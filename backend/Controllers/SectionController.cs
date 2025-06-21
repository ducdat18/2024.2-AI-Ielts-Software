using IELTS_System.DTOs.Section;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SectionController : ControllerBase
{
    private readonly ISectionRepository _sectionRepository;
    private readonly ITestPartRepository _testPartRepository;
    private readonly ILogger<SectionController> _logger;

    public SectionController(
        ISectionRepository sectionRepository,
        ITestPartRepository testPartRepository,
        ILogger<SectionController> logger)
    {
        _sectionRepository = sectionRepository ?? throw new ArgumentNullException(nameof(sectionRepository));
        _testPartRepository = testPartRepository ?? throw new ArgumentNullException(nameof(testPartRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // Create a new section
    [HttpPost]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult> CreateSection([FromBody] CreateSectionDto createSectionDto)
    {
        try
        {
            // Validate that the test part exists
            var testPart = await _testPartRepository.GetByIdAsync(createSectionDto.PartId);
            if (testPart == null)
            {
                return NotFound($"TestPart with id {createSectionDto.PartId} not found");
            }

            // Check if a section number already exists for this part
            var sectionNumberExists = await _sectionRepository.SectionNumberExistsAsync(
                createSectionDto.PartId,
                createSectionDto.SectionNumber);

            if (sectionNumberExists)
            {
                return BadRequest($"Section number {createSectionDto.SectionNumber} already exists for part {createSectionDto.PartId}");
            }

            // Create the section
            var section = createSectionDto.ToSection(testPart);
            var createdSection = await _sectionRepository.CreateAsync(section);

            return Ok(new
            {
                message = $"Section created successfully for part {testPart.PartId}",
                value = createdSection.ToSectionDto()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating section");
            return StatusCode(500, "An error occurred while creating the section");
        }
    }

    // Get a section by ID
    [HttpGet("id/{sectionId}")]
    public async Task<ActionResult<SectionDto>> GetById(Guid sectionId)
    {
        try
        {
            var section = await _sectionRepository.GetByIdAsync(sectionId);
            if (section == null)
            {
                return NotFound($"Section with id {sectionId} not found");
            }

            return Ok(section.ToSectionDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving section");
            return StatusCode(500, "An error occurred while retrieving the section");
        }
    }

    // Get all sections for a specific test part
    [HttpGet("part/{partId}")]
    public async Task<ActionResult<IEnumerable<SectionDto>>> GetByPartId(Guid partId)
    {
        try
        {
            // Check if the test part exists
            var testPart = await _testPartRepository.GetByIdAsync(partId);
            if (testPart == null)
            {
                return NotFound($"TestPart with id {partId} not found");
            }

            var sections = await _sectionRepository.GetByPartIdAsync(partId);
            var sectionDtos = sections.Select(s => s.ToSectionDto());

            return Ok(sectionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sections");
            return StatusCode(500, "An error occurred while retrieving sections");
        }
    }

    // Update a section
    [HttpPut("id/{sectionId}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<SectionDto>> UpdateSection(Guid sectionId, [FromBody] UpdateSectionDto updateSectionDto)
    {
        try
        {
            var existingSection = await _sectionRepository.GetByIdAsync(sectionId);
            if (existingSection == null)
            {
                return NotFound($"Section with id {sectionId} not found");
            }

            if (existingSection.SectionNumber != updateSectionDto.SectionNumber && await _sectionRepository.SectionNumberExistsAsync(existingSection.PartId, updateSectionDto.SectionNumber))
            {
                return BadRequest("Can not update the section number because of the conflict with other sections");
            }
            var updatedSection = updateSectionDto.ToUpdate(existingSection);
            var result = await _sectionRepository.UpdateAsync(updatedSection);

            return Ok(result.ToSectionDto());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating section");
            return StatusCode(500, "An error occurred while updating the section");
        }
    }

    // Delete a section
    [HttpDelete("id/{sectionId}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult> DeleteSection(Guid sectionId)
    {
        try
        {
            var section = await _sectionRepository.GetByIdAsync(sectionId);
            if (section == null)
            {
                return NotFound($"Section with id {sectionId} not found");
            }

            var result = await _sectionRepository.DeleteAsync(sectionId);
            if (result)
            {
                return Ok(new { message = $"Section with id {sectionId} deleted successfully" });
            }
            else
            {
                return StatusCode(500, "An error occurred while deleting the section");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting section");
            return StatusCode(500, "An error occurred while deleting the section");
        }
    }
}