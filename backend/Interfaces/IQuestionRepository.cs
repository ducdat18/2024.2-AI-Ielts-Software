using IELTS_System.Models;

namespace IELTS_System.Interfaces;
/// <summary>
/// Interface for question data access operations
/// </summary>
public interface IQuestionRepository
{
    /// <summary>
    /// Creates a new question in the database
    /// </summary>
    /// <param name="question">The Question entity to create and be assigned to the given section</param>
    /// <returns>The created Question with generated ID</returns>
    Task<Question> CreateAsync(Question question);
    
    /// <summary>
    /// Retrieves a question by its unique identifier
    /// </summary>
    /// <param name="questionId">The unique identifier of the question</param>
    /// <returns>The question if found; otherwise null</returns>
    Task<Question?> GetByIdAsync(Guid questionId);
    
    /// <summary>
    /// Retrieves all questions for a specific section
    /// </summary>
    /// <param name="sectionId">The unique identifier of the section</param>
    /// <returns>A collection of questions belonging to the specified section</returns>
    Task<IEnumerable<Question>> GetBySectionIdAsync(Guid sectionId);
    
    /// <summary>
    /// Updates an existing question in the database
    /// </summary>
    /// <param name="question">The question entity with updated values</param>
    /// <returns>The updated question</returns>
    /// <exception cref="KeyNotFoundException">Thrown when the question with the specified ID is not found</exception>
    Task<Question> UpdateAsync(Question question);
    
    /// <summary>
    /// Deletes a question from the database
    /// </summary>
    /// <param name="questionId">The unique identifier of the question to delete</param>
    /// <returns>True if deletion was successful; otherwise false</returns>
    Task<bool> DeleteAsync(Guid questionId);
    
    /// <summary>
    /// Checks if a question with the specified ID exists in the database
    /// </summary>
    /// <param name="questionId">The unique identifier of the question</param>
    /// <returns>True if the question exists; otherwise false</returns>
    Task<bool> ExistsAsync(Guid questionId);
    
    // For IQuestionRepository interface
    /// <summary>
    /// Creates multiple Question entities in a single database transaction.
    /// This method is optimized for bulk operations and reduces the number of database roundtrip.
    /// </summary>
    /// <param name="questions">Collection of Question entities to be created</param>
    /// <returns>Task representing the asynchronous operation</returns>
    /// <exception cref="ArgumentNullException">Thrown when a question collection is null</exception>
    Task CreateBulkAsync(IEnumerable<Question> questions);

    /// <summary>
    /// Updates multiple existing Question entities in a single database transaction.
    /// This method efficiently applies changes to multiple entities at once, using
    /// EntityState.Modified to optimize the update process.
    /// </summary>
    /// <param name="questions">Collection of Question entities with updated properties</param>
    /// <returns>Task representing the asynchronous operation</returns>
    /// <exception cref="ArgumentNullException">Thrown when the question collection is null</exception>
    Task UpdateBulkAsync(IEnumerable<Question> questions);
    /// <summary>
    /// Checks if a question with the specified question number already exists within a given section.
    /// </summary>
    /// <param name="sectionId">The unique identifier of the section to check against.</param>
    /// <param name="questionNumber">The question number to check for uniqueness.</param>
    /// <returns>
    /// A task that represents the asynchronous operation.
    /// The task result contains a boolean value:
    /// - true if a question with the specified number already exists in the given section
    /// - false if no question with the specified number exists in the given section
    /// </returns>
    /// <remarks>
    /// This method is typically used during question creation to ensure that question numbers 
    /// are unique within their parent section, maintaining proper ordering and structure.
    /// </remarks>
    Task<bool> QuestionNumberExistsAsync(Guid sectionId, int questionNumber);
}