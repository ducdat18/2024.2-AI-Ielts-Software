using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<UserRepository> _logger;
    public UserRepository(AppDbContext context, ILogger<UserRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<User> CreateAsync(User user)
    {
        if (user == null) throw new ArgumentNullException(nameof(user));
        
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        _logger.LogInformation($"User {user.Email} created successfully");
        return user;
    }

    public async Task<User?> GetByIdAsync(Guid userId)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserId == userId);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty", nameof(email));

        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User> UpdateAsync(User user)
    {
        if (user == null) throw new ArgumentNullException(nameof(user));

        _context.Entry(user).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> DeleteAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        _context.Users.Remove(user);
        _logger.LogInformation($"User {user.Email} deleted successfully");
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<User>> GetAllAsync(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
        if (pageSize < 1) throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

        return await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.Email)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<bool> UpdateLastLoginAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.LastLogin = DateTime.UtcNow;
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty", nameof(email));

        return await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<bool> UpdatePasswordAsync(Guid userId, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(hashedPassword))
            throw new ArgumentException("Password hash cannot be empty", nameof(hashedPassword));

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.Password = hashedPassword;
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateProfileImageAsync(Guid userId, string imagePath)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.ProfileImagePath = imagePath;
        return await _context.SaveChangesAsync() > 0;
    }
}