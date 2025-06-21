using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class QuestionRepository : IQuestionRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<QuestionRepository> _logger;
    private readonly ITestUpdateService _testUpdateService;
    
    public QuestionRepository(ILogger<QuestionRepository> logger, AppDbContext context, ITestUpdateService testUpdateService)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _testUpdateService = testUpdateService ?? throw new ArgumentException(nameof(testUpdateService));
    }
    
    public async Task<Question> CreateAsync(Question question)
    {
        if(question == null) throw new ArgumentNullException(nameof(question));
        _context.Entry(question.Section).State = EntityState.Unchanged;
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();
        await _testUpdateService.UpdateTestLastModifiedDateByQuestionIdAsync(question.QuestionId);
        return question;
    }

    public async Task<Question?> GetByIdAsync(Guid questionId)
    {
        return await _context.Questions.Include(q => q.Answer)
            .FirstOrDefaultAsync(q => q.QuestionId == questionId);
    }

    public async Task<IEnumerable<Question>> GetBySectionIdAsync(Guid sectionId)
    {
        var givenSection = await _context.Sections.FindAsync(sectionId);
        if (givenSection == null)
        {
            throw new ArgumentException($"Section with ID {sectionId} not found\"");
        }

        return await _context.Questions
            .Include(q => q.Answer)
            .Where(q => q.SectionId == sectionId)
            .OrderBy(q => q.QuestionNumber)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Question> UpdateAsync(Question question)
    {
        // Only fetch the existing question for validation
        var existingQuestion = await _context.Questions
            .FirstOrDefaultAsync(q => q.QuestionId == question.QuestionId);

        if (existingQuestion == null)
        {
            throw new KeyNotFoundException($"Question with ID {question.QuestionId} not found");
        }

        // Detach the existing entity from the context
        _context.Entry(existingQuestion).State = EntityState.Detached;

        // Mark the updated entity as modified
        _context.Entry(question).State = EntityState.Modified;

        await _context.SaveChangesAsync();
        
        // Use the service to update the Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateByQuestionIdAsync(question.QuestionId);

        return question;
    }

    public async Task<bool> DeleteAsync(Guid questionId)
    {
        var givenQuestion = await _context.Questions.FindAsync(questionId);
        if (givenQuestion == null)
        {
            return false;
        }
        _context.Questions.Remove(givenQuestion);
        await _context.SaveChangesAsync();
        
        // Use the service to update the Test's LastUpdatedDate
        await _testUpdateService.UpdateTestLastModifiedDateByQuestionIdAsync(givenQuestion.QuestionId);
        return true;
    }

    public async Task<bool> ExistsAsync(Guid questionId)
    {
        var givenQuestion = await _context.Questions.FindAsync(questionId);
        return givenQuestion != null;
    }
    
    public async Task CreateBulkAsync(IEnumerable<Question> questions)
    {
        if (questions == null) throw new ArgumentNullException(nameof(questions));
    
        // Convert to list to avoid multiple enumeration
        var questionsList = questions.ToList();
        if (!questionsList.Any()) return; // Nothing to do
    
        // Begin a transaction to ensure all questions are created or none
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var question in questionsList)
            {
                if (question == null) throw new ArgumentException("Collection contains null question", nameof(questions));
            
                // Set the navigational property state to be unchanged to avoid duplicate inserts
                _context.Entry(question.Section).State = EntityState.Unchanged;
                    
                // Add the question to the context
                await _context.Questions.AddAsync(question);
            }
        
            // Save all changes in a single operation
            await _context.SaveChangesAsync();
        
            // Update the parent Test's LastUpdatedDate for each question
            // Only update once if all questions belong to the same section/test
            var distinctSectionIds = questionsList.Select(q => q.SectionId).Distinct();
            foreach (var sectionId in distinctSectionIds)
            {
                await _testUpdateService.UpdateTestLastModifiedDateBySectionIdAsync(sectionId);
            }
        
            // Commit the transaction
            await transaction.CommitAsync();
        
            _logger.LogInformation($"Bulk created {questionsList.Count} questions successfully");
        }
        catch (Exception ex)
        {
            // Roll back the transaction if an error occurs
            await transaction.RollbackAsync();
            _logger.LogError(ex, $"Error during bulk question creation: {ex.Message}");
            throw;
        }
    }
    
    public async Task UpdateBulkAsync(IEnumerable<Question> questions)
    {
        if (questions == null) throw new ArgumentNullException(nameof(questions));
    
        // Convert to list to avoid multiple enumeration
        var questionsList = questions.ToList();
        if (!questionsList.Any()) return; // Nothing to do
    
        // Begin a transaction to ensure all questions are updated or none
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Get all question IDs to update
            var questionIds = questionsList.Select(q => q.QuestionId).ToList();
        
            // Validate all questions exist before updating
            var existingCount = await _context.Questions
                .Where(q => questionIds.Contains(q.QuestionId))
                .CountAsync();
            
            if (existingCount != questionIds.Count)
            {
                throw new KeyNotFoundException("One or more questions to update do not exist");
            }
        
            foreach (var question in questionsList)
            {
                if (question == null) throw new ArgumentException("Collection contains null question", nameof(questions));
            
                // Detach any existing entity with the same key
                var existingEntry = _context.ChangeTracker.Entries<Question>()
                    .FirstOrDefault(e => e.Entity.QuestionId == question.QuestionId);
                
                if (existingEntry != null)
                {
                    existingEntry.State = EntityState.Detached;
                }
            
                // Mark the entity as modified
                _context.Entry(question).State = EntityState.Modified;
            }
        
            // Save all changes in a single operation
            await _context.SaveChangesAsync();
        
            // Update the parent Test's LastUpdatedDate for each question
            // Only update once if all questions belong to the same section/test
            var distinctQuestionIds = questionsList.Select(q => q.QuestionId).Distinct();
            foreach (var questionId in distinctQuestionIds)
            {
                await _testUpdateService.UpdateTestLastModifiedDateByQuestionIdAsync(questionId);
            }
        
            // Commit the transaction
            await transaction.CommitAsync();
        
            _logger.LogInformation($"Bulk updated {questionsList.Count} questions successfully");
        }
        catch (Exception ex)
        {
            // Roll back the transaction if an error occurs
            await transaction.RollbackAsync();
            _logger.LogError(ex, $"Error during bulk question update: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> QuestionNumberExistsAsync(Guid sectionId, int questionNumber)
    {
        return await _context.Questions
            .AnyAsync(q => q.SectionId == sectionId && q.QuestionNumber == questionNumber);
    }
}