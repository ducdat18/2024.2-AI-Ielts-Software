using IELTS_System.Models;

namespace IELTS_System.Interfaces;

/// <summary>
/// Interface for test part data access operations
/// </summary>
public interface ITestPartRepository
{
    /// <summary>
    /// Creates a new test part in the database
    /// </summary>
    /// <param name="testPart">The TestPart entity to create</param>
    /// <returns>The created TestPart with generated ID</returns>
    Task<TestPart> CreateAsync(TestPart testPart);

    /// <summary>
    /// Retrieves a test part by its ID
    /// </summary>
    /// <param name="partId">The ID of the test part to retrieve</param>
    /// <returns>The TestPart if found, null otherwise</returns>
    Task<TestPart?> GetByIdAsync(Guid partId);
    
    /// <summary>
    /// Gets all test parts for a specific test
    /// </summary>
    /// <param name="testId">The ID of the test</param>
    /// <returns>An ordered collection of TestParts</returns>
    Task<IEnumerable<TestPart>> GetByTestIdAsync(Guid testId);
    
    /// <summary>
    /// Updates an existing test part
    /// </summary>
    /// <param name="testPart">The TestPart entity with updated values</param>
    /// <returns>The updated TestPart</returns>
    Task<TestPart> UpdateAsync(TestPart testPart);

    /// <summary>
    /// Deletes a test part by its ID
    /// </summary>
    /// <param name="partId">The ID of the test part to delete</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteAsync(Guid partId);
    /// <summary>
    /// Checks if a part number already exists for a specific test
    /// </summary>
    /// <param name="testId">The ID of the test</param>
    /// <param name="partNumber">The part number to check</param>
    /// <returns>True if the part number exists, false otherwise</returns>
    Task<bool> PartNumberExistsAsync(Guid testId, int partNumber);
}