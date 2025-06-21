using IELTS_System.Models;

namespace IELTS_System.Interfaces;

public interface ITestUpdateService
{
    Task UpdateTestLastModifiedDateByTestIdAsync(Guid testId);
    Task UpdateTestLastModifiedDateByPartIdAsync(Guid partId);
    Task UpdateTestLastModifiedDateBySectionIdAsync(Guid sectionId);
    Task UpdateTestLastModifiedDateByQuestionIdAsync(Guid questionId);
    Task UpdateTestLastModifiedDateByAnswerIdAsync(Guid answerId);
}