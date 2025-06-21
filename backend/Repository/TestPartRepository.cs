using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class TestPartRepository : ITestPartRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<TestPartRepository> _logger;
    private readonly ITestUpdateService _testUpdateService;
    
    public TestPartRepository(AppDbContext context, ILogger<TestPartRepository> logger, ITestUpdateService testUpdateService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _testUpdateService = testUpdateService ?? throw new ArgumentException(nameof(testUpdateService));
    }
    
    public async Task<TestPart> CreateAsync(TestPart testPart)
    {
        if(testPart == null) throw new ArgumentNullException(nameof(testPart));
        _context.Entry(testPart.Test).State = EntityState.Unchanged;
        await _context.TestParts.AddAsync(testPart);
        await _context.SaveChangesAsync();
        
        // Update the parent Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateByPartIdAsync(testPart.PartId);

        return testPart;
    }

    public async Task<TestPart?> GetByIdAsync(Guid partId)
    {
        return await _context.TestParts.FindAsync(partId);
    }

    public async Task<IEnumerable<TestPart>> GetByTestIdAsync(Guid testId)
    {
        var givenTest = await _context.Tests.FindAsync(testId);
        if (givenTest == null)
        {
            throw new KeyNotFoundException($"Test with ID {testId} not found");
        }
        return await _context.TestParts
            .Where(tp => tp.TestId == testId)
            .OrderBy(tp => tp.PartNumber)
            .AsNoTracking()
            .ToListAsync();
    }
    
    public async Task<TestPart> UpdateAsync(TestPart testPart)
    {
        // Verify the entity exists
        var existingTestPart = await _context.TestParts
            .Include(tp => tp.Test)  // Include the Test navigation property
            .FirstOrDefaultAsync(tp => tp.PartId == testPart.PartId);
    
        // Check if the entity exists before detaching
        if (existingTestPart != null)
        {
            _context.Entry(existingTestPart).State = EntityState.Detached;
        }
        
        // Mark the updated entity as modified
        _context.Entry(testPart).State = EntityState.Modified;
        
        if (existingTestPart == null)
        {
            throw new KeyNotFoundException($"TestPart with ID {testPart.PartId} not found");
        }
        
        try
        {
            // Save changes to the database
            await _context.SaveChangesAsync();
            
            // Update the parent Test's LastUpdatedDate
            await _testUpdateService.UpdateTestLastModifiedDateByPartIdAsync(testPart.PartId);
            
            return testPart;
        }
        catch (DbUpdateConcurrencyException)
        {
            // Handle concurrency conflicts
            if (!await TestPartExistsAsync(testPart.PartId))
            {
                throw new KeyNotFoundException($"TestPart with ID {testPart.PartId} not found");
            }
            throw;
        }
    }

    // Helper method to check if a TestPart exists
    private async Task<bool> TestPartExistsAsync(Guid testPartId)
    {
        return await _context.TestParts.AnyAsync(tp => tp.PartId == testPartId);
    }

    public async Task<bool> DeleteAsync(Guid partId)
    {
        var testPart = await _context.TestParts.FindAsync(partId);
        if (testPart == null) return false;
        _context.TestParts.Remove(testPart);
        await _context.SaveChangesAsync();
        
        // Update the parent Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateByPartIdAsync(testPart.PartId);
        
        return true;
    }

    public async Task<bool> PartNumberExistsAsync(Guid testId, int partNumber)
    {
        return await _context.TestParts
            .AnyAsync(tp => tp.TestId == testId && tp.PartNumber == partNumber);
    }

}