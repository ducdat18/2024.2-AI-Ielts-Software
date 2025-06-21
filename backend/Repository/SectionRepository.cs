using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class SectionRepository : ISectionRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<SectionRepository> _logger;
    private readonly ITestUpdateService _testUpdateService;
    public SectionRepository(ILogger<SectionRepository> logger, AppDbContext context, ITestUpdateService testUpdateService)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _testUpdateService = testUpdateService ?? throw new ArgumentException(nameof(testUpdateService));
    }
    public async Task<Section> CreateAsync(Section section)
    {
        if(section == null) throw new ArgumentNullException(nameof(section));
        _context.Entry(section.TestPart).State = EntityState.Unchanged;
        await _context.Sections.AddAsync(section);
        await _context.SaveChangesAsync();
        // Update the parent Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateBySectionIdAsync(section.SectionId);
        return section;
    }

    public async Task<Section?> GetByIdAsync(Guid sectionId)
    {
        return await _context.Sections.FindAsync(sectionId);
    }

    public async Task<IEnumerable<Section>> GetByPartIdAsync(Guid partId)
    {
        var givenPart = await _context.TestParts.FindAsync(partId);
        if (givenPart == null)
        {
            throw new KeyNotFoundException($"TestPart with ID {partId} not found");
        }
        return _context.Sections
            .AsNoTracking()
            .Where(s => s.PartId == partId)
            .OrderBy(s => s.SectionNumber)
            .ToList();
    }
    
    public async Task<Section> UpdateAsync(Section section)
    {
        // Find the existing section with navigation properties
        var existingSection = await _context.Sections
            .Include(s => s.TestPart)
            .ThenInclude(tp => tp.Test)
            .FirstOrDefaultAsync(s => s.SectionId == section.SectionId);

        if (existingSection == null)
        {
            throw new KeyNotFoundException($"Section with ID {section.SectionId} not found");
        }

        // Detach the existing entity from the context
        _context.Entry(existingSection).State = EntityState.Detached;

        // Mark the updated entity as modified
        _context.Entry(section).State = EntityState.Modified;

        await _context.SaveChangesAsync();
        
        // Only update the parent Test's LastUpdatedDate once, using the service
        await _testUpdateService.UpdateTestLastModifiedDateBySectionIdAsync(section.SectionId);
        
        return section;
    }

    public async Task<bool> DeleteAsync(Guid sectionId)
    {
        var section = await _context.Sections.FindAsync(sectionId);
        if(section == null) return false;
        _context.Sections.Remove(section);
        await _context.SaveChangesAsync();
        
        // Update the parent Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateBySectionIdAsync(section.SectionId);
        return true;
    }

    public async Task<bool> SectionNumberExistsAsync(Guid partId, int sectionNumber)
    {
        return await _context.Sections.AnyAsync(s => s.SectionNumber == sectionNumber && s.PartId == partId);
    }
}