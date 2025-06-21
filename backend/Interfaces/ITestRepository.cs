using IELTS_System.Models;

namespace IELTS_System.Interfaces;
/// <summary>
/// Interface for test data access operations
/// </summary>
public interface ITestRepository
{
    /// <summary>
    /// Creates a new test in the database
    /// </summary>
    /// <param name="test">The Test entity to create</param>
    /// <returns>The created test with generated ID</returns>
    Task<Test> CreateAsync(Test test);
    
    /// <summary>
    /// Gets a test by its ID
    /// </summary>
    /// <param name="id">The ID of the test to retrieve</param>
    /// <returns>The Test if found, null otherwise</returns>
    Task<Test?> GetByIdAsync(Guid id);
    
    /// <summary>
    /// Gets a complete test by its ID with all related entities (TestParts, Sections, Questions, etc.)
    /// </summary>
    /// <param name="id">The ID of the test to retrieve</param>
    /// <returns>The fully loaded Test if found, null otherwise</returns>
    Task<Test?> GetFullTestByIdAsync(Guid id);
    /// <summary>
    /// Gets all tests by their names
    /// </summary>
    /// <param name="testName">The names of the tests to retrieve</param>
    /// <param name="pageNumber">The page number for pagination (default: 1)</param>
    /// <param name="pageSize">The number of items per page (default: 10)</param>   
    /// <returns>A collection of all Tests</returns>
    Task<IEnumerable<Test>> GetByTestNamesAsync(string testName, int pageNumber = 1, int pageSize = 10);

    /// <summary>
    /// Gets all tests by test type
    /// </summary>
    /// <param name="testTypeId">The id of the test type to retrieve test</param>
    /// <param name="pageNumber">The page number for pagination (default: 1)</param>
    /// <param name="pageSize">The number of items per page (default: 10)</param>   
    /// <returns>A collection of all Tests</returns>
    Task<IEnumerable<Test>> GetByTestTypeAsync(Guid testTypeId, int pageNumber = 1, int pageSize = 10);
    /// <summary>
    /// Gets all tests with pagination
    /// </summary>
    /// <returns>A collection of all Tests</returns>
    Task<IEnumerable<Test>> GetAllAsync(int pageNumber = 1, int pageSize = 10);
    
    /// <summary>
    /// Updates an existing test
    /// </summary>
    /// <param name="test">The Test entity to update</param>
    /// <returns>The updated Test</returns>
    Task<Test> UpdateAsync(Test test);
    
    /// <summary>
    /// Deletes a test by its ID
    /// </summary>
    /// <param name="id">The ID of the test to delete</param>
    /// <returns>True if deleted successfully, false otherwise</returns>
    Task<bool> DeleteAsync(Guid id);
}