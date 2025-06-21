using IELTS_System.DTOs.Test;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ITestRepository _testRepository;
        private readonly ITestTypeRepository _testTypeRepository;
        private readonly ILogger<TestController> _logger;

        public TestController(
            ITestRepository testRepository,
            ITestTypeRepository testTypeRepository,
            ILogger<TestController> logger)
        {
            _testRepository = testRepository ?? throw new ArgumentNullException(nameof(testRepository));
            _testTypeRepository = testTypeRepository ?? throw new ArgumentNullException(nameof(testTypeRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        
        [HttpPost]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult> CreateTest([FromBody] CreateTestDto createTestDto)
        {
            try
            {
                var testType = await _testTypeRepository.GetByIdAsync(createTestDto.TestTypeId);
                if (testType == null)
                {
                    return BadRequest($"Test type with id {createTestDto.TestTypeId} not found");
                }

                var test = createTestDto.ToTest(testType);

                var createdTest = await _testRepository.CreateAsync(test);

                return Ok(new
                {
                    message = $"Test with TestID = {test.TestId} created successfully}}",
                    value = createdTest.ToTestDto(),
                });
            } catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test");
                return StatusCode(500, "An error occurred while creating the test");
            }
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestDto>>> GetAllTests([FromQuery] int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var tests = await _testRepository.GetAllAsync(pageNumber, pageSize);
                var testDtos = tests.Select(t => t.ToTestDto());
                return Ok(testDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tests");
                return StatusCode(500, "An error occurred while retrieving tests");
            }
        }

        [HttpGet("name/{testName}")]
        public async Task<ActionResult<IEnumerable<TestDto>>> GetTestByName(string testName, [FromQuery] int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var tests = await _testRepository.GetByTestNamesAsync(testName, pageNumber, pageSize);
                var testDtos = tests.Select(t => t.ToTestDto());
                return Ok(testDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tests");
                return StatusCode(500, "An error occurred while retrieving tests");
            }
        }
        [HttpGet("test_type/{testTypeId}")]
        public async Task<ActionResult<IEnumerable<TestDto>>> GetTestByName([FromQuery] Guid testTypeId, [FromQuery] int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var tests = await _testRepository.GetByTestTypeAsync(testTypeId, pageNumber, pageSize);
                var testDtos = tests.Select(t => t.ToTestDto());
                return Ok(testDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tests");
                return StatusCode(500, "An error occurred while retrieving tests");
            }
        }
        [HttpGet("id/{testId}")]
        public async Task<ActionResult<TestFullDto>> GetFullTestById(Guid testId)
        {
            try
            {
                var test = await _testRepository.GetFullTestByIdAsync(testId);
                if (test == null)
                {
                    return NotFound($"Test with id {testId} not found");
                }

                return Ok(test.ToTestFullDto());
            } catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving test");
                return StatusCode(500, "An error occurred while retrieving the test");
            }
        }

        [HttpPut("id/{testId}")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<TestDto>> UpdateTest(Guid testId, [FromBody] UpdateTestDto updateTestDto)
        {
            try
            {
                var existingTest = await _testRepository.GetByIdAsync(testId);
                if (existingTest == null)
                {
                    return NotFound($"Test with id {testId} not found");
                }

                var updatedTest = await _testRepository.UpdateAsync(updateTestDto.ToUpdate(existingTest));
                return Ok(updatedTest.ToTestDto());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating test");
                return StatusCode(500, "An error occurred while updating the test");
            }
        }
        
        [HttpDelete("id/{testId}")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult> DeleteTest(Guid testId)
        {
            try
            {
                var test = await _testRepository.GetByIdAsync(testId);
                if (test == null)
                {
                    return NotFound($"Test with id {testId} not found");
                }
                
                await _testRepository.DeleteAsync(testId);
                return Ok(new { message = $"Test with id {testId} deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting test");
                return StatusCode(500, "An error occurred while deleting the test");
            }
        }
    }
}