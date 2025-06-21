using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class UserResponseRepository : IUserResponseRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<UserResponseRepository> _logger;
    
    public UserResponseRepository(AppDbContext context, ILogger<UserResponseRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
    
    public async Task<IEnumerable<UserResponse>> GetAllAsync(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
        if (pageSize < 1) throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));
        
        return await _context.UserResponses
            .Include(ur => ur.UserTest)
            .Include(ur => ur.Question)
            .ThenInclude(q => q.Answer)
            .AsNoTracking()
            .Skip((pageNumber -1) * pageSize)
            .Take(pageSize)
            .ToListAsync();   
    }

    public async Task<UserResponse?> GetByIdAsync(Guid id)
    {
        return await _context.UserResponses
            .Include(ur => ur.UserTest)
            .Include(ur => ur.Question)
            .ThenInclude(q => q.Answer)
            .AsNoTracking()
            .FirstOrDefaultAsync(ur => ur.ResponseId == id);
    }

    public async Task<IEnumerable<UserResponse>> GetByUserTestIdAsync(Guid userTestId, int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
        if (pageSize < 1) throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));
        
        return await _context.UserResponses
            .Include(ur => ur.UserTest)
            .Where(ur => ur.UserTestId == userTestId)
            .Include(ur => ur.Question)
                .ThenInclude(q => q.Answer)
            .OrderBy(ur => ur.Question.QuestionNumber)
            .AsNoTracking()
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();   
    }

    public async Task<UserResponse> CreateAsync(UserResponse userResponse)
    {
        if(userResponse == null) throw new ArgumentNullException(nameof(userResponse));
        
        // Check if this question has already been answered for this user test
        bool alreadyAnswered = await _context.UserResponses
            .AnyAsync(ur => ur.UserTestId == userResponse.UserTestId && 
                            ur.QuestionId == userResponse.QuestionId);

        if (alreadyAnswered)
        {
            throw new InvalidOperationException($"Question {userResponse.QuestionId} has already been answered in user test {userResponse.UserTestId}");
        }

        // Get the question with its answer to check if the user's answer is correct
        var question = await _context.Questions
            .Include(q => q.Answer)
            .FirstOrDefaultAsync(q => q.QuestionId == userResponse.QuestionId);
        
        if (question != null && question.Answer != null)
        {
            // Compare the user's answer with the correct answer
            // You may need to adjust the comparison logic based on your specific requirements
            bool isCorrect = string.Equals(
                userResponse.UserAnswer?.Trim(), 
                question.Answer.CorrectAnswer?.Trim(), 
                StringComparison.InvariantCultureIgnoreCase
            );
        
        // Set MarksAwarded to 1 if correct, 0 if incorrect
            userResponse.MarksAwarded = isCorrect ? 1 : 0;
        }
        else
        {
            // If the question has no answer defined, default to 0 marks
            userResponse.MarksAwarded = 0;
        }

        _context.Entry(userResponse.UserTest).State = EntityState.Unchanged;
        _context.Entry(userResponse.Question).State = EntityState.Unchanged;
        await _context.UserResponses.AddAsync(userResponse);
        await _context.SaveChangesAsync();
        
        return userResponse;   
    }
    
    public async Task<IEnumerable<UserResponse>> CreateBulkAsync(IEnumerable<UserResponse> userResponses)
    {
        if (userResponses == null)
        {
            throw new ArgumentNullException(nameof(userResponses));
        }

        // Convert to list to avoid multiple enumeration
        var responsesList = userResponses.ToList();
        
        if (!responsesList.Any())
        {
            return Enumerable.Empty<UserResponse>();
        }

        try
        {
            // Add all entities to the context
            await _context.UserResponses.AddRangeAsync(responsesList);
        
            // Save changes to the database in a single transaction
            await _context.SaveChangesAsync();
        
            // Return the created entities with their generated IDs
            return responsesList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating bulk user responses. Count: {Count}", responsesList.Count);
            throw; 
        }
    }
    
    public async Task<bool> UpdateAsync(UserResponse userResponse)
    {
        if (userResponse == null)
        {
            throw new ArgumentNullException(nameof(userResponse));
        }

        try
        {
            // Find the existing entity
            var existingResponse = await _context.UserResponses.FindAsync(userResponse.ResponseId);
        
            if (existingResponse == null)
            {
                return false;
            }
        
            // Update entity state in DbContext
            _context.Entry(existingResponse).CurrentValues.SetValues(userResponse);
        
            // Detach related entities if needed to prevent circular updates
            _context.Entry(existingResponse).Reference(u => u.UserTest).IsModified = false;
            _context.Entry(existingResponse).Reference(u => u.Question).IsModified = false;
        
            // Save changes to the database
            var updatedRows = await _context.SaveChangesAsync();
        
            // Return true if at least one row was affected
            return updatedRows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user response with ID {UserResponseId}", userResponse.ResponseId);
            return false;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var userResponse = await _context.UserResponses.FindAsync(id);
        if (userResponse == null)
        {
            return false;
        }
        _context.Remove(userResponse);
        await _context.SaveChangesAsync();
        return true;
    }
}