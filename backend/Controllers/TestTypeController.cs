using IELTS_System.DTOs.TestType;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers;

[ApiController]
[Route("[controller]")]
public class TestTypeController : ControllerBase
{
    private readonly ITestTypeRepository _testTypeRepository;
    private readonly ILogger<TestTypeController> _logger;

    public TestTypeController(ITestTypeRepository testTypeRepository, ILogger<TestTypeController> logger)
    {
        _testTypeRepository = testTypeRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TestTypeDto>>> GetAllTestTypes()
    {
        try
        {
            var testTypes = await _testTypeRepository.GetAllAsync();
            var testTypesDtos = testTypes.Select(tt => tt.ToTestTypeDto());
            return Ok(testTypesDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all test types");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpGet("id/{testTypeId}")]
    public async Task<ActionResult<TestTypeDto>> GetTaskTypeById(Guid testTypeId)
    {
        try
        {
            var testType = await _testTypeRepository.GetByIdAsync(testTypeId);
            if (testType == null)
            {
                return BadRequest($"TestType with Id {testTypeId} not found!");
            }

            return Ok(testType.ToTestTypeDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting test type with ID: {Id}", testTypeId);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    [HttpGet("name/{testTypeName}")]
    public async Task<ActionResult<TestTypeDto>> GetTaskTypeByName([FromBody] string testTypeName)
    {
        try
        {
            var testType = await _testTypeRepository.GetByNameAsync(testTypeName);
            if (testType == null)
            {
                return BadRequest($"TestType with Name {testTypeName} not found!");
            }

            return Ok(testType.ToTestTypeDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting test type with Name: {Name}", testTypeName);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }
}