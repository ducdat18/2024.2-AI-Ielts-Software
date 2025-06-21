using IELTS_System.Models;

namespace IELTS_System.Interfaces;
/// <summary>
/// Interface for test type data access operations
/// </summary>
public interface ITestTypeRepository
{
    /// <summary>
    /// Retrieves all test types from the database
    /// </summary>
    /// <returns>A collection of all test types</returns>
    Task<IEnumerable<TestType>> GetAllAsync();

    /// <summary>
    /// Retrieves a specific test type by its ID
    /// </summary>
    /// <param name="id">The GUID of the test type to retrieve</param>
    /// <returns>The test type if found, null otherwise</returns>
    Task<TestType?> GetByIdAsync(Guid id);

    /// <summary>
    /// Retrieves a specific test type by its name
    /// </summary>
    /// <param name="name">The name of the test type to retrieve</param>
    /// <returns>The test type if found, null otherwise</returns>
    Task<TestType?> GetByNameAsync(string name);
}