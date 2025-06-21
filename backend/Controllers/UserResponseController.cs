using IELTS_System.DTOs.UserResponse;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using IELTS_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserResponseController : ControllerBase
{
    private readonly IUserTestRepository _userTestRepository;
    private readonly IQuestionRepository _questionRepository;
    private readonly IUserResponseRepository _userResponseRepository;
    private readonly ILogger<UserResponseController> _logger;

    public UserResponseController(IUserTestRepository userTestRepository, 
        IQuestionRepository questionRepository,
        IUserResponseRepository userResponseRepository,
        ILogger<UserResponseController> logger)
    {
        _userTestRepository = userTestRepository ?? throw new ArgumentNullException(nameof(userTestRepository));
        _questionRepository = questionRepository ?? throw new ArgumentNullException(nameof(questionRepository));
        _userResponseRepository = userResponseRepository ?? throw new ArgumentNullException(nameof(userResponseRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUserResponses([FromQuery] int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var userResponses = await _userResponseRepository.GetAllAsync(pageNumber, pageSize);
            return Ok(userResponses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all user responses");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpGet("id/{id}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<UserResponseDto>> GetUserResponse(Guid id)
    {
        try
        {
            var userResponse = await _userResponseRepository.GetByIdAsync(id);
            if (userResponse == null)
            {
                return NotFound($"UserResponse with ID {id} not found");
            }
            return Ok(userResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user response with ID: {Id}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpGet("usertest/{userTestId}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetResponsesByUserTest(Guid userTestId)
    {
        try
        {
            var responses = await _userResponseRepository.GetByUserTestIdAsync(userTestId);
            return Ok(responses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting responses for user test ID: {UserTestId}", userTestId);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpPost]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<UserResponseDto>> CreateUserResponse([FromBody] CreateUserResponseDto createUserResponseDto)
    {
        try
        {
            var userTest = await _userTestRepository.GetByIdAsync(createUserResponseDto.UserTestId);
            if (userTest == null)
            {
                return NotFound($"UserTest with ID {createUserResponseDto.UserTestId} not found");
            }
            var question = await _questionRepository.GetByIdAsync(createUserResponseDto.QuestionId);
            if (question == null)
            {
                return NotFound($"Question with ID {createUserResponseDto.QuestionId} not found");
            }
            var createdUserResponse = createUserResponseDto.ToUserResponse(userTest, question);
            await _userResponseRepository.CreateAsync(createdUserResponse);
            return Ok(createdUserResponse.ToUserResponseDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating user response");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpPost("multiple")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> CreateMultipleResponses(
        [FromBody] List<CreateUserResponseDto> createUserResponseDtos)
    {
        try
        {
            if (!createUserResponseDtos.Any())
            {
                return BadRequest("No responses provided");
            }

            // Get unique UserTestIds and QuestionIds from all DTOs
            var userTestIds = createUserResponseDtos.Select(dto => dto.UserTestId).Distinct().ToList();
            var questionIds = createUserResponseDtos.Select(dto => dto.QuestionId).Distinct().ToList();

            // Fetch all required UserTests and Questions
            var userTests = new Dictionary<Guid, UserTest>();
            var questions = new Dictionary<Guid, Question>();
            var notFoundUserTests = new List<Guid>();
            var notFoundQuestions = new List<Guid>();

            // Fetch UserTests
            foreach (var userTestId in userTestIds)
            {
                var userTest = await _userTestRepository.GetByIdAsync(userTestId);
                if (userTest == null)
                {
                    notFoundUserTests.Add(userTestId);
                }
                else
                {
                    userTests[userTestId] = userTest;
                }
            }

            // Fetch Questions
            foreach (var questionId in questionIds)
            {
                var question = await _questionRepository.GetByIdAsync(questionId);
                if (question == null)
                {
                    notFoundQuestions.Add(questionId);
                }
                else
                {
                    questions[questionId] = question;
                }
            }

            // Return error if any UserTests or Questions were not found
            if (notFoundUserTests.Any() || notFoundQuestions.Any())
            {
                return NotFound(new
                {
                    message = "Some required entities were not found",
                });
            }

            // Create UserResponses
            var userResponses = new List<UserResponse>();
            foreach (var dto in createUserResponseDtos)
            {
                var userResponse = dto.ToUserResponse(
                    userTests[dto.UserTestId],
                    questions[dto.QuestionId]);
                userResponses.Add(userResponse);
            }

            // Save all responses
            await _userResponseRepository.CreateBulkAsync(userResponses);

            // Convert to DTOs and return
            var responseDtos = userResponses.Select(ur => ur.ToUserResponseDto()).ToList();
            return Ok(responseDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating multiple user responses");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }
    
    [HttpDelete("id/{id}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<IActionResult> DeleteUserResponse(Guid id)
    {
        try
        {
            var deleted = await _userResponseRepository.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound($"UserResponse with ID {id} not found");
            }

            return Ok(new
            {
                message = $"User response with id {id} deleted successfully",
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting user response with ID: {Id}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }
}