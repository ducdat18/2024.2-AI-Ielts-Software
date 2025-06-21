using IELTS_System.DTOs.Question;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using IELTS_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionController : ControllerBase
{
    private readonly ISectionRepository _sectionRepository;
    private readonly IQuestionRepository _questionRepository;
    private readonly IAnswerRepository _answerRepository;
    private readonly ILogger<QuestionController> _logger;

    public QuestionController(ISectionRepository sectionRepository, IQuestionRepository questionRepository, IAnswerRepository answerRepository, ILogger<QuestionController> logger)
    {
        _sectionRepository = sectionRepository ?? throw new ArgumentNullException(nameof(sectionRepository));
        _questionRepository = questionRepository ?? throw new ArgumentNullException(nameof(questionRepository));
        _answerRepository = answerRepository ?? throw new ArgumentNullException(nameof(answerRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<QuestionDto>> CreateQuestion([FromBody] CreateQuestionDto createQuestionDto)
    {
        try
        {
            var existingSection = await _sectionRepository.GetByIdAsync(createQuestionDto.SectionId);
            if (existingSection == null)
            {
                return NotFound($"Section with section ID {createQuestionDto.SectionId} not found!");
            }
            // Check if the question number already exists in this section
            bool questionNumberExists = await _questionRepository.QuestionNumberExistsAsync(
                createQuestionDto.SectionId, 
                createQuestionDto.QuestionNumber);
            
            if (questionNumberExists)
            {
                return BadRequest($"Question number {createQuestionDto.QuestionNumber} already exists in section {createQuestionDto.SectionId}");
            }

            var question = createQuestionDto.ToQuestion(existingSection);
            await _questionRepository.CreateAsync(question);
            
            var answer = createQuestionDto.ToAnswer(question);
            await _answerRepository.CreateAsync(answer);
            
            // Set the answer property on the question object
            question.Answer = answer;

            return Ok(new
            {
                message = $"Question created successfully for section {existingSection.SectionId}",
                question = question.ToQuestionDto(answer.ToAnswerDto()),
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating question");
            return StatusCode(500, "An error occurred while creating the question");
        }
    }
    
    [HttpGet("id/{questionId}")]
    public async Task<ActionResult<QuestionDto>> GetQuestionById(Guid questionId)
    {
        try
        {
            var question = await _questionRepository.GetByIdAsync(questionId);
            if (question == null)
            {
                return NotFound($"Question with id {questionId} not found");
            }
            
            return Ok(question.ToQuestionDto(question.Answer!.ToAnswerDto()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving question");
            return StatusCode(500, "An error occurred while retrieving the question");
        }
    }
    
    // Get all questions for a section
    [HttpGet("section/{sectionId}")]
    public async Task<ActionResult<IEnumerable<QuestionDto>>> GetQuestionsBySectionId(Guid sectionId)
    {
        try
        {
            // Verify section exists
            var section = await _sectionRepository.GetByIdAsync(sectionId);
            if (section == null)
            {
                return NotFound($"Section with id {sectionId} not found");
            }
            
            var questions = await _questionRepository.GetBySectionIdAsync(sectionId);
            var questionDtos = new List<QuestionDto>();
            
            foreach (var question in questions)
            {
                var answerDto = question.Answer != null ? question.Answer.ToAnswerDto() : null;
                if (answerDto != null) questionDtos.Add(question.ToQuestionDto(answerDto));
            }
            
            return Ok(questionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving questions");
            return StatusCode(500, "An error occurred while retrieving questions");
        }
    }
    
    // Update a question
    [HttpPut("id/{questionId}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<QuestionDto>> UpdateQuestion(Guid questionId, [FromBody] UpdateQuestionDto updateQuestionDto)
    {
        try
        {
            var existingQuestion = await _questionRepository.GetByIdAsync(questionId);
            if (existingQuestion == null)
            {
                return NotFound($"Question with id {questionId} not found");
            }
            // Only validate the question number if it's being changed
            if (existingQuestion.QuestionNumber != updateQuestionDto.QuestionNumber)
            {
                bool questionNumberExists = await _questionRepository.QuestionNumberExistsAsync(
                    existingQuestion.SectionId, 
                    updateQuestionDto.QuestionNumber);
                
                if (questionNumberExists)
                {
                    return BadRequest($"Cannot update question number because {updateQuestionDto.QuestionNumber} already exists in this section");
                }
            }
            var updatedQuestion = updateQuestionDto.ToUpdate(existingQuestion);
            var result = await _questionRepository.UpdateAsync(updatedQuestion);
            return Ok(result.ToQuestionDto(updatedQuestion.Answer!.ToAnswerDto()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating question");
            return StatusCode(500, "An error occurred while updating the question");
        }
    }
    
    // Delete a question
    [HttpDelete("id/{questionId}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult> DeleteQuestion(Guid questionId)
    {
        try
        {
            var question = await _questionRepository.GetByIdAsync(questionId);
            if (question == null)
            {
                return NotFound($"Question with id {questionId} not found");
            }
            
            // Delete the associated answer first if it exists
            var answer = await _answerRepository.GetByQuestionIdAsync(questionId);
            if (answer != null)
            {
                await _answerRepository.DeleteAsync(answer.AnswerId);
            }
            
            var result = await _questionRepository.DeleteAsync(questionId);
            if (result)
            {
                return Ok(new { message = $"Question with id {questionId} deleted successfully" });
            }
            else
            {
                return StatusCode(500, "An error occurred while deleting the question");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting question");
            return StatusCode(500, "An error occurred while deleting the question");
        }
    }
    
    // Create multiple questions ans following answers
    [HttpPost("multiple")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<IEnumerable<QuestionDto>>> CreateBulkQuestions([FromBody] IEnumerable<CreateQuestionDto> questionDtos)
    {
        try
        {
            var questionList = new List<Question>();
            var answerList = new List<Answer>();
            int count = 0;
            foreach (var questionDto in questionDtos)
            {
                var section = await _sectionRepository.GetByIdAsync(questionDto.SectionId);
                if (section == null)
                {
                    return NotFound($"Section with id {questionDto.SectionId} not found");
                }
                bool questionNumberExists = await _questionRepository.QuestionNumberExistsAsync(questionDto.SectionId, questionDto.QuestionNumber);
            
                if (questionNumberExists)
                {
                    return BadRequest($"Question number {questionDto.QuestionNumber} already exists in section {questionDto.SectionId}");
                }
                
                var question = questionDto.ToQuestion(section);
                questionList.Add(question);
                var answer = questionDto.ToAnswer(question);
                answerList.Add(answer);
                count++;
            }

            await _questionRepository.CreateBulkAsync(questionList);
            await _answerRepository.CreateBulkAsync(answerList);
            return Ok(new
            {
                message = $"Successfully created {count} questions",
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating bulk questions");
            return StatusCode(500, "An error occurred while creating questions");
        }
    }
    
    // Get the number of questions for a section
    [HttpGet("count/section/{sectionId}")]
    public async Task<ActionResult<int>> GetQuestionCountForSection(Guid sectionId)
    {
        try
        {
            var section = await _sectionRepository.GetByIdAsync(sectionId);
            if (section == null)
            {
                return NotFound($"Section with id {sectionId} not found");
            }
            
            var questions = await _questionRepository.GetBySectionIdAsync(sectionId);
            return Ok(new { count = questions.Count() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error counting questions");
            return StatusCode(500, "An error occurred while counting questions");
        }
    }

    // Update multiple questions
    [HttpPut("bulk")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<IEnumerable<QuestionDto>>> UpdateBulkQuestions([FromBody] IEnumerable<UpdateQuestionDto> questionDtos)
    {
        try
        {
            var questionList = new List<Question>();
            var notFoundIds = new List<Guid>();
            var duplicateNumberErrors = new List<string>();
            // Convert to list immediately to avoid multiple enumeration
            var updateQuestionDtos = questionDtos.ToList();
            var questionDtosList = updateQuestionDtos.ToList();
            if (!questionDtosList.Any())
            {
                return BadRequest("No questions provided for update");
            }
            // First, verify all questions exist and check for number conflicts
            foreach (var questionDto in updateQuestionDtos)
            {
                var existingQuestion = await _questionRepository.GetByIdAsync(questionDto.QuestionId);
                if (existingQuestion == null)
                {
                    notFoundIds.Add(questionDto.QuestionId);
                    continue;
                }
            
                // Only check for existing question numbers if the number is being changed
                if (existingQuestion.QuestionNumber != questionDto.QuestionNumber)
                {
                    // Check if the new question number conflicts with any existing question in the same section
                    bool questionNumberExists = await _questionRepository.QuestionNumberExistsAsync(
                        existingQuestion.SectionId, questionDto.QuestionNumber);
                
                    // Check if the same number is used by another question in this update batch
                    bool duplicateInBatch = updateQuestionDtos
                        .Where(q => q.QuestionId != questionDto.QuestionId) // Exclude the current question
                        .Any(q => 
                        {
                            var otherQuestion = _questionRepository.GetByIdAsync(q.QuestionId).Result;
                            return otherQuestion != null && 
                                   otherQuestion.SectionId == existingQuestion.SectionId && 
                                   q.QuestionNumber == questionDto.QuestionNumber;
                        });
                
                    if (questionNumberExists || duplicateInBatch)
                    {
                        duplicateNumberErrors.Add($"Question number {questionDto.QuestionNumber} already exists in section {existingQuestion.SectionId}");
                    }
                }
            }
        
            // Return errors if any questions not found
            if (notFoundIds.Any())
            {
                return NotFound(new 
                {
                    message = "One or more questions not found",
                    notFoundQuestionIds = notFoundIds
                });
            }
        
            // Return errors if any duplicate question numbers
            if (duplicateNumberErrors.Any())
            {
                return BadRequest(new
                {
                    message = "Question number conflicts detected",
                    conflicts = duplicateNumberErrors
                });
            }
        
            // Now process the updates
            foreach (var questionDto in updateQuestionDtos)
            {
                var existingQuestion = await _questionRepository.GetByIdAsync(questionDto.QuestionId);
            
                // Update the question
                if (existingQuestion != null)
                {
                    var updatedQuestion = questionDto.ToUpdate(existingQuestion);
                    questionList.Add(updatedQuestion);
                }
            }
        
            // Perform bulk updates
            await _questionRepository.UpdateBulkAsync(questionList);
            
        
            return Ok(new
            {
                message = $"Successfully updated {questionList.Count} questions",
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating bulk questions");
            return StatusCode(500, "An error occurred while updating questions");
        }
    }
}