using IELTS_System.Data;
using IELTS_System.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Services
{
    public class TestUpdateService : ITestUpdateService
    {
        private readonly AppDbContext _context;
        
        public TestUpdateService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
    
        public async Task UpdateTestLastModifiedDateByTestIdAsync(Guid testId)
        {
            var test = await _context.Tests.FindAsync(testId);
            if (test == null)
            {
                throw new KeyNotFoundException($"Test with ID {testId} not found");
            }
        
            test.LastUpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    
        public async Task UpdateTestLastModifiedDateByPartIdAsync(Guid partId)
        {
            var testId = await _context.TestParts
                .Where(tp => tp.PartId == partId)
                .Select(tp => tp.TestId)
                .FirstOrDefaultAsync();
            
            if (testId == Guid.Empty)
            {
                throw new KeyNotFoundException($"TestPart with ID {partId} not found");
            }
        
            await UpdateTestLastModifiedDateByTestIdAsync(testId);
        }
    
        public async Task UpdateTestLastModifiedDateBySectionIdAsync(Guid sectionId)
        {
            var testId = await _context.Sections
                .Join(_context.TestParts,
                     s => s.PartId,
                     tp => tp.PartId,
                     (s, tp) => new { Section = s, TestPart = tp })
                .Where(x => x.Section.SectionId == sectionId)
                .Select(x => x.TestPart.TestId)
                .FirstOrDefaultAsync();
            
            if (testId == Guid.Empty)
            {
                throw new KeyNotFoundException($"Section with ID {sectionId} not found");
            }
        
            await UpdateTestLastModifiedDateByTestIdAsync(testId);
        }
    
        public async Task UpdateTestLastModifiedDateByQuestionIdAsync(Guid questionId)
        {
            var testId = await _context.Questions
                .Join(_context.Sections,
                     q => q.SectionId,
                     s => s.SectionId,
                     (q, s) => new { Question = q, Section = s })
                .Join(_context.TestParts,
                     x => x.Section.PartId,
                     tp => tp.PartId,
                     (x, tp) => new { x.Question, x.Section, TestPart = tp })
                .Where(x => x.Question.QuestionId == questionId)
                .Select(x => x.TestPart.TestId)
                .FirstOrDefaultAsync();
            
            if (testId == Guid.Empty)
            {
                throw new KeyNotFoundException($"Question with ID {questionId} not found");
            }
        
            await UpdateTestLastModifiedDateByTestIdAsync(testId);
        }
    
        public async Task UpdateTestLastModifiedDateByAnswerIdAsync(Guid answerId)
        {
            var testId = await _context.Answers
                .Join(_context.Questions,
                     a => a.QuestionId,
                     q => q.QuestionId,
                     (a, q) => new { Answer = a, Question = q })
                .Join(_context.Sections,
                     x => x.Question.SectionId,
                     s => s.SectionId,
                     (x, s) => new { x.Answer, x.Question, Section = s })
                .Join(_context.TestParts,
                     x => x.Section.PartId,
                     tp => tp.PartId,
                     (x, tp) => new { x.Answer, x.Question, x.Section, TestPart = tp })
                .Where(x => x.Answer.AnswerId == answerId)
                .Select(x => x.TestPart.TestId)
                .FirstOrDefaultAsync();
            
            if (testId == Guid.Empty)
            {
                throw new KeyNotFoundException($"Answer with ID {answerId} not found");
            }
        
            await UpdateTestLastModifiedDateByTestIdAsync(testId);
        }
    }
}