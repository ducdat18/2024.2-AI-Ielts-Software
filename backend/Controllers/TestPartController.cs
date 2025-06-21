using IELTS_System.DTOs.TestPart;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using IELTS_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers;


[ApiController]
[Route("api/[controller]")]
public class TestPartController : ControllerBase
{
    private readonly ITestPartRepository _testPartRepository;
    private readonly ITestRepository _testRepository;
    private readonly ILogger<TestPartController> _logger;

    public TestPartController(ITestPartRepository testPartRepository, ITestRepository testRepository, ILogger<TestPartController> logger)
    {
        _testPartRepository = testPartRepository ?? throw new ArgumentException(nameof(testPartRepository));
        _testRepository = testRepository ?? throw new ArgumentException(nameof(testRepository));
        _logger = logger ?? throw new ArgumentException(nameof(logger));
    }

    [HttpPost]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult> CreateNewTestPart([FromBody] CreateTestPartDto createTestPartDto)
    {
        try
        {
            var test = await _testRepository.GetByIdAsync(createTestPartDto.TestId);
            if (test == null)
            {
                return NotFound($"The test with id {createTestPartDto.TestId} was not found!");
            }

            // Check if a part number already exists for this test
            var partNumberExists = await _testPartRepository.PartNumberExistsAsync(
                createTestPartDto.TestId,
                createTestPartDto.PartNumber);

            if (partNumberExists)
            {
                return BadRequest(
                    $"Part number {createTestPartDto.PartNumber} already exists for test {createTestPartDto.TestId}");
            }

            var testPart = createTestPartDto.ToTestPart(test);
            _logger.LogInformation("Successfully convert to test part");
            await _testPartRepository.CreateAsync(testPart);
            _logger.LogInformation("Successfully add to the database");
            return Ok(new
            {
                message = $"A new test part assigned to {test.TestId}",
                value = testPart.ToTestPartDto(),
            });
        } catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating test part");
            return StatusCode(500, "An error occurred while creating the test part");
        }
    }
    // Get a test part by ID
    [HttpGet("id/{partId}")]
    public async Task<ActionResult<TestPartDto>> GetById(Guid partId)
    {
        try
        {
            var testPart = await _testPartRepository.GetByIdAsync(partId);
            if (testPart == null)
            {
                return NotFound($"TestPart with id {partId} not found");
            }
        
            return Ok(testPart.ToTestPartDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving test part");
            return StatusCode(500, "An error occurred while retrieving the test part");
        }
    }
    // Get all test parts for a specific test
    [HttpGet("test/{testId}")]
    public async Task<ActionResult<IEnumerable<TestPartDto>>> GetByTestId(Guid testId)
    {
        try
        {
            // Check if the test exists
            var test = await _testRepository.GetByIdAsync(testId);
            if (test == null)
            {
                return NotFound($"Test with id {testId} not found");
            }
        
            var testParts = await _testPartRepository.GetByTestIdAsync(testId);
            var testPartDtos = testParts.Select(tp => tp.ToTestPartDto());
        
            return Ok(testPartDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving test parts");
            return StatusCode(500, "An error occurred while retrieving test parts");
        }
    }
    // Update a test part
    [HttpPut("id/{partId}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<TestPartDto>> UpdateTestPart(Guid partId, [FromBody] UpdateTestPartDto updateTestPartDto)
    {
        try
        {
            var existingTestPart = await _testPartRepository.GetByIdAsync(partId);
            if (existingTestPart == null)
            {
                return NotFound($"TestPart with id {partId} not found");
            }

            if (existingTestPart.PartNumber != updateTestPartDto.PartNumber && await _testPartRepository.PartNumberExistsAsync(existingTestPart.TestId, updateTestPartDto.PartNumber))
            {
                return BadRequest($"Can not update the part because the conflict of part number with other parts");
            }
            var updatedTestPart = updateTestPartDto.ToUpdate(existingTestPart);
            var result = await _testPartRepository.UpdateAsync(updatedTestPart);
        
            return Ok(result.ToTestPartDto());

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating test part");
            return StatusCode(500, "An error occurred while updating the test part");
        }
    }

    // Delete a test part
    [HttpDelete("id/{partId}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult> DeleteTestPart(Guid partId)
    {
        try
        {
            var testPart = await _testPartRepository.GetByIdAsync(partId);
            if (testPart == null)
            {
                return NotFound($"TestPart with id {partId} not found");
            }
        
            var result = await _testPartRepository.DeleteAsync(partId);
            if (result)
            {
                return Ok(new { message = $"TestPart with id {partId} deleted successfully" });
            }
            else
            {
                return StatusCode(500, "An error occurred while deleting the test part");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting test part");
            return StatusCode(500, "An error occurred while deleting the test part");
        }
    }

}