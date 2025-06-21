using IELTS_System.Models;

namespace IELTS_System.Interfaces;

public interface IAnswerRepository
{     
    /// <summary>
    /// Creates a new answer in the database
    /// </summary>
    /// <param name="answer">The Answer entity to create and assigned to the given Question</param>
    /// <returns>The created Answer with generated ID</returns>
    Task<Answer> CreateAsync(Answer answer);
    /// <summary>
    /// Retrieves an answer by its unique identifier
    /// </summary>
    /// <param name="answerId">The unique identifier of the answer</param>
    /// <returns>The answer if found; otherwise null</returns>
    Task<Answer?> GetByIdAsync(Guid answerId);
    
    /// <summary>
    /// Retrieves the answer associated with a specific question
    /// </summary>
    /// <param name="questionId">The unique identifier of the question</param>
    /// <returns>The answer for the specified question if found; otherwise null</returns>
    Task<Answer?> GetByQuestionIdAsync(Guid questionId);
    
    /// <summary>
    /// Updates an existing answer in the database
    /// </summary>
    /// <param name="answer">The answer entity with updated values</param>
    /// <returns>The updated answer</returns>
    /// <exception cref="KeyNotFoundException">Thrown when the answer with the specified ID is not found</exception>
    Task<Answer> UpdateAsync(Answer answer);
    
    /// <summary>
    /// Deletes an answer from the database
    /// </summary>
    /// <param name="answerId">The unique identifier of the answer to delete</param>
    /// <returns>True if deletion was successful; otherwise false</returns>
    Task<bool> DeleteAsync(Guid answerId);
    
    /// <summary>
    /// Checks if an answer exists for the specified question
    /// </summary>
    /// <param name="questionId">The unique identifier of the question</param>
    /// <returns>True if an answer exists for the question; otherwise false</returns>
    Task<bool> ExistsForQuestionAsync(Guid questionId);
    
    // Bulk method - optimized for performance
    /// <summary>
    /// Creates multiple Answer entities in a single database transaction.
    /// This method is optimized for bulk operations and reduces the number of database roundtrips.
    /// </summary>
    /// <param name="answers">Collection of Answer entities to be created</param>
    /// <returns>Task representing the asynchronous operation</returns>
    /// <exception cref="ArgumentNullException">Thrown when answers collection is null</exception>
    Task CreateBulkAsync(IEnumerable<Answer> answers);

    /// <summary>
    /// Updates multiple existing Answer entities in a single database transaction.
    /// This method efficiently applies changes to multiple entities at once, using
    /// EntityState.Modified to optimize the update process.
    /// </summary>
    /// <param name="answers">Collection of Answer entities with updated properties</param>
    /// <returns>Task representing the asynchronous operation</returns>
    /// <exception cref="ArgumentNullException">Thrown when the answers collection is null</exception>
    Task UpdateBulkAsync(IEnumerable<Answer> answers);
}