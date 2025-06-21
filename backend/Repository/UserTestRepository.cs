using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class UserTestRepository : IUserTestRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<UserTestRepository> _logger;
    
    public UserTestRepository(AppDbContext context, ILogger<UserTestRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
    
    public async Task<IEnumerable<UserTest>> GetAllAsync(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
        if (pageSize < 1) throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

        return await _context.UserTests
            .Include(ut => ut.Test)
            .Include(ut => ut.User)
            .AsNoTracking()
            .Skip((pageNumber -1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<UserTest?> GetByIdAsync(Guid id)
    {
        return await _context.UserTests
            .Include(ut => ut.Test)
            .Include(ut => ut.User)
            .FirstOrDefaultAsync(ut => ut.UserTestId == id);
    }

    public async Task<IEnumerable<UserTest>> GetByUserIdAsync(Guid userId, int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
        if (pageSize < 1) throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

        return await _context.UserTests
            .Include(ut => ut.Test)
            .Include(ut => ut.User)
            .Where(ut => ut.UserId == userId)
            .AsNoTracking()
            .Skip((pageNumber -1) * pageSize)
            .Take(pageSize)
            .ToListAsync();    }

    public async Task<IEnumerable<UserTest>> GetByTestIdAsync(Guid testId, int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
        if (pageSize < 1) throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

        return await _context.UserTests
            .Include(ut => ut.Test)
            .Include(ut => ut.User)
            .Where(ut => ut.TestId == testId)
            .AsNoTracking()
            .Skip((pageNumber -1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<UserTest> AddAsync(UserTest userTest)
    {
        if(userTest == null) throw new ArgumentNullException(nameof(userTest));
        _context.Entry(userTest.Test).State = EntityState.Unchanged;
        _context.Entry(userTest.User).State = EntityState.Unchanged;
        await _context.UserTests.AddAsync(userTest);
        await _context.SaveChangesAsync();
        return userTest;
    }

    public async Task<bool> UpdateAsync(UserTest userTest)
    {
        try
        {
            var existingUserTest = await _context.UserTests.FindAsync(userTest.UserTestId);
            if (existingUserTest == null)
            {
                return false;
            }
        
            // Update entity state in DbContext
            _context.Entry(existingUserTest).CurrentValues.SetValues(userTest);
        
            // Save changes to the database
            var updatedRows = await _context.SaveChangesAsync();
        
            // Return true if at least one row was affected
            return updatedRows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user test with ID {UserTestId}", userTest.UserTestId);
            return false;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var userTest = await _context.UserTests.FindAsync(id);
        if (userTest == null)
        {
            return false;
        }
        _context.Remove(userTest);
        await _context.SaveChangesAsync();
        return true;
    }
}