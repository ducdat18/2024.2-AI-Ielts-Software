using IELTS_System.Interfaces;
using IELTS_System.DTOs.UserTests;
using IELTS_System.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserTestController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ITestRepository _testRepository;
    private readonly IUserTestRepository _userTestRepository;
    private readonly ILogger<UserTestController> _logger;

    public UserTestController(IUserRepository userRepository, ITestRepository testRepository, IUserTestRepository userTestRepository, ILogger<UserTestController> logger)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _testRepository = testRepository ?? throw new ArgumentNullException(nameof(testRepository));
        _userTestRepository = userTestRepository ?? throw new ArgumentNullException(nameof(userTestRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<IEnumerable<UserTestDto>>> GetAllUserTests([FromQuery] int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var userTests = await _userTestRepository.GetAllAsync(pageNumber, pageSize);
            var userTestDtos = userTests.Select(ut => ut.ToUserTestDto());
            return Ok(userTestDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all user tests");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpGet("id/{id}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<UserTestDto>> GetUserTest(Guid id)
    {
        try
        {
            var userTest = await _userTestRepository.GetByIdAsync(id);
            if (userTest == null)
            {
                return NotFound($"User Test with ID {id} not found");
            }
            return Ok(userTest.ToUserTestDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user test with ID: {Id}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpGet("user/{userId}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<IEnumerable<UserTestDto>>> GetUserTestsByUserId(Guid userId, [FromQuery] int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var userTests = await _userTestRepository.GetByUserIdAsync(userId, pageNumber, pageSize);
            var userTestDtos = userTests.Select(ut => ut.ToUserTestDto());
            return Ok(userTestDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user tests for user ID: {UserId}", userId);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }
    
    [HttpGet("test/{testId}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<IEnumerable<UserTestDto>>> GetUserTestsByTestId(Guid testId, [FromQuery] int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var userTests = await _userTestRepository.GetByTestIdAsync(testId, pageNumber, pageSize);
            var userTestDtos = userTests.Select(ut => ut.ToUserTestDto());
            return Ok(userTestDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user tests for user ID: {UserId}", testId);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }
    
    [HttpPost]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<UserTestDto>> CreateUserTest([FromBody] CreateUserTestDto createUserTestDto)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(createUserTestDto.UserId);
            if (user == null)
            {
                return NotFound($"User with ID {createUserTestDto.UserId} not found");
            }
            var test = await _testRepository.GetByIdAsync(createUserTestDto.TestId);
            if (test == null)
            {
                return NotFound($"Test with ID {createUserTestDto.TestId} not found");
            }
            var userTest = createUserTestDto.ToUserTest(user, test);
            await _userTestRepository.AddAsync(userTest);
            var userTestDto = userTest.ToUserTestDto();
            return CreatedAtAction(nameof(GetUserTest), new { id = userTest.UserTestId }, userTestDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating user test");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpPut("id/{id}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<IActionResult> UpdateUserTest(Guid id, [FromBody] UpdateUserTestDto updateUserTestDto)
    {
        try
        {
            var existingUserTest = await _userTestRepository.GetByIdAsync(id);
            if (existingUserTest == null)
            {
                return NotFound($"UserTest with ID {id} not found");
            }

            var updatedUserTest = updateUserTestDto.ToUpdate(existingUserTest);
            var updated = await _userTestRepository.UpdateAsync(updatedUserTest);
        
            if (!updated)
            {
                return StatusCode(500, "Failed to update the user test");
            }

            return Ok(new
            {
                message = $"User Test with id {id} updated successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating user test with ID: {Id}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpDelete("id/{id}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<IActionResult> DeleteUserTest(Guid id)
    {
        try
        {
            var deleted = await _userTestRepository.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return Ok(new
            {
                message = $"User test {id} deleted successfully",
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting user test with ID: {Id}", id);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }
}