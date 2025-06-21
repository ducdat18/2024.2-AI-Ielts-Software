using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class TestTypeRepository : ITestTypeRepository
{
    private readonly AppDbContext _context;

    public TestTypeRepository(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }
    
    public async Task<IEnumerable<TestType>> GetAllAsync()
    {
        return await _context.TestTypes.AsNoTracking().ToListAsync();
    }

    public async Task<TestType?> GetByIdAsync(Guid id)
    {
        return await _context.TestTypes.FindAsync(id);
    }

    public async Task<TestType?> GetByNameAsync(string name)
    {
        return await _context.TestTypes
            .AsNoTracking()
            .FirstOrDefaultAsync(tt => tt.Name == name);
    }
}