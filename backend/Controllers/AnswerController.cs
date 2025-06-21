using IELTS_System.DTOs.Answer;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using IELTS_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnswerController : ControllerBase
{
    private readonly IAnswerRepository _answerRepository;
    private readonly ILogger<AnswerController> _logger;
    
    public AnswerController(IAnswerRepository answerRepository, ILogger<AnswerController> logger)
    {
        _answerRepository = answerRepository;
        _logger = logger;
    }

    [HttpPut("id/{answerId}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<AnswerDto>> UpdateAnswer(Guid answerId, [FromBody] UpdateAnswerDto updateAnswerDto)
    {
        try
        {
            if (answerId != updateAnswerDto.AnswerId)
            {
                return BadRequest("Answer ID in the query does not match the ID in the request body.");
            }

            var existingAnswer = await _answerRepository.GetByIdAsync(answerId);
            if (existingAnswer == null)
            {
                return NotFound("Answer not found");
            }

            // Update answer properties
            existingAnswer.CorrectAnswer = updateAnswerDto.UpdatedCorrectAnswer;
            existingAnswer.Explanation = updateAnswerDto.UpdatedExplanation;
            existingAnswer.AlternativeAnswers = updateAnswerDto.UpdatedAlternativeAnswers;

            // Save the updated answer
            await _answerRepository.UpdateAsync(existingAnswer);
            return Ok(existingAnswer.ToAnswerDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating answer");
            return StatusCode(500, "An error occurred while updating the answer");
        }
}

    [HttpPut("multiple")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult> UpdateMultipleAnswers([FromBody] List<UpdateAnswerDto>? updateAnswerDtos)
    {
        try
        {
            if (updateAnswerDtos == null || !updateAnswerDtos.Any())
            {
                return BadRequest("No answers provided for update.");
            }

            // Validate all answers have correct data
            var invalidAnswers =
                updateAnswerDtos.Where(a => string.IsNullOrWhiteSpace(a.UpdatedCorrectAnswer)).ToList();
            if (invalidAnswers.Any())
            {
                return BadRequest(new
                {
                    message = "Some answers have invalid data",
                    invalidAnswerIds = invalidAnswers.Select(a => a.AnswerId).ToList()
                });
            }

            // Fetch all answers in a single query
            var existingAnswers = new List<Answer>();
            var notFoundIds = new List<Guid>();

            foreach (var dto in updateAnswerDtos)
            {
                var answer = await _answerRepository.GetByIdAsync(dto.AnswerId);
                if (answer == null)
                {
                    notFoundIds.Add(dto.AnswerId);
                }
                else
                {
                    // Update answer properties
                    answer.CorrectAnswer = dto.UpdatedCorrectAnswer;
                    answer.Explanation = dto.UpdatedExplanation;
                    answer.AlternativeAnswers = dto.UpdatedAlternativeAnswers;
                    existingAnswers.Add(answer);
                }
            }

            // Check if any answers were not found
            if (notFoundIds.Any())
            {
                return NotFound(new
                {
                    message = "Some answers could not be found",
                    notFoundAnswerIds = notFoundIds
                });
            }

            // Update all valid answers in bulk
            await _answerRepository.UpdateBulkAsync(existingAnswers);

            return Ok(new { message = $"Successfully updated {existingAnswers.Count} answers" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating multiple answers");
            return StatusCode(500, "An error occurred while updating multiple answers");
        }
    }
}