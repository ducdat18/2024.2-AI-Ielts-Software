using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class AnswerRepository : IAnswerRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<AnswerRepository> _logger;
    private readonly ITestUpdateService _testUpdateService;
    
    public AnswerRepository(ILogger<AnswerRepository> logger, AppDbContext context, ITestUpdateService testUpdateService)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _testUpdateService = testUpdateService ?? throw new ArgumentException(nameof(testUpdateService));
    }

    public async Task<Answer> CreateAsync(Answer answer)
    {
        if(answer == null) throw new ArgumentNullException(nameof(answer));
        _context.Entry(answer.Question).State = EntityState.Unchanged;
        await _context.Answers.AddAsync(answer);
        await _context.SaveChangesAsync();
        _logger.LogInformation($"Answer with id {answer.AnswerId} created successfully");
        // Use the service to update the Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateByAnswerIdAsync(answer.AnswerId);
        return answer;
    }

    public async Task<Answer?> GetByIdAsync(Guid answerId)
    {
        return await _context.Answers.FindAsync(answerId);
    }

    public async Task<Answer?> GetByQuestionIdAsync(Guid questionId)
    {
        var givenQuestion = await _context.Questions.FindAsync(questionId);
        if (givenQuestion == null)
        {
            throw new ArgumentException($"Question with questionID {questionId} does not exist");
        }

        return await _context.Answers
            .Include(a => a.Question)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.QuestionId == questionId);
    }

    public async Task<Answer> UpdateAsync(Answer answer)
    {
        // Only fetch the existing answer for validation (no need for the navigation properties)
        var existingAnswer = await _context.Answers
            .FirstOrDefaultAsync(a => a.AnswerId == answer.AnswerId);

        if (existingAnswer == null)
        {
            throw new KeyNotFoundException($"Answer with ID {answer.AnswerId} not found");
        }

        // Detach the existing entity from the context
        _context.Entry(existingAnswer).State = EntityState.Detached;

        // Mark the updated entity as modified
        _context.Entry(answer).State = EntityState.Modified;

        await _context.SaveChangesAsync();
        
        // Use the service to update the parent Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateByAnswerIdAsync(answer.AnswerId);

        return answer;
    }

    public async Task<bool> DeleteAsync(Guid answerId)
    {
        var givenAnswer = await _context.Answers.FindAsync(answerId);
        if (givenAnswer == null)
        {
            return false;
        }
        _context.Answers.Remove(givenAnswer);
        await _context.SaveChangesAsync();
        // Use the service to update the Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateByAnswerIdAsync(givenAnswer.AnswerId);
        return true;
    }

    public async Task<bool> ExistsForQuestionAsync(Guid questionId)
    {
        var answer = await _context.Answers
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.QuestionId == questionId);
        if (answer == null)
        {
            return false;
        }
        return true;
    }
    
    

    public async Task CreateBulkAsync(IEnumerable<Answer> answers)
    {
        if (answers == null) throw new ArgumentNullException(nameof(answers));
        
        // Convert to list to avoid multiple enumeration
        var answersList = answers.ToList();
        if (!answersList.Any()) return; // Nothing to do
        
        // Begin a transaction to ensure all answers are created or none
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Add all answers at once
            _context.Answers.AddRange(answersList);
            
            // Save changes in a single operation
            await _context.SaveChangesAsync();
            
            // Update the parent Test's LastUpdatedDate only once per question
            // Group by QuestionId to avoid redundant updates
            var distinctQuestionIds = answersList.Select(a => a.QuestionId).Distinct();
            foreach (var questionId in distinctQuestionIds)
            {
                await _testUpdateService.UpdateTestLastModifiedDateByQuestionIdAsync(questionId);
            }
            
            // Commit the transaction
            await transaction.CommitAsync();
            
            _logger.LogInformation($"Bulk created {answersList.Count} answers successfully");
        }
        catch (Exception ex)
        {
            // Roll back the transaction if an error occurs
            await transaction.RollbackAsync();
            _logger.LogError(ex, $"Error during bulk answer creation: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateBulkAsync(IEnumerable<Answer>? answers)
    {
        if (answers == null) throw new ArgumentNullException(nameof(answers));

        // Skip execution if the collection is empty
        var enumerable = answers.ToList();
        if (!enumerable.Any()) return;

        // Begin transaction to ensure all updates succeed or fail together
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var answer in enumerable)
            {
                // Mark each entity as modified so EF Core generates UPDATE statements
                _context.Entry(answer).State = EntityState.Modified;
            }
        
            // Execute all updates in a single SaveChanges call
            await _context.SaveChangesAsync();
            
            // Update the LastModifiedDate for all affected tests
            // We collect answerIds to update their parent tests
            var answerIds = enumerable.Select(a => a.AnswerId).ToList();
        
            // Group by questionId to avoid redundant updates to the same test
            foreach (var answerId in answerIds)
            {
                try
                {
                    await _testUpdateService.UpdateTestLastModifiedDateByAnswerIdAsync(answerId);
                }
                catch (KeyNotFoundException ex)
                {
                    _logger.LogWarning(ex, "Could not update test LastModifiedDate for answerId {AnswerId}", answerId);
                    // Continue processing other answers even if one fails
                }
            }
            
            // Commit the transaction if everything succeeds
            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            // Roll back changes if anything fails
            await transaction.RollbackAsync();
            throw; // Re-throw to allow the caller to handle the exception
        }
    }

}