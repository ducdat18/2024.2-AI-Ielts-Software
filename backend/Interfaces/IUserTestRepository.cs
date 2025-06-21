using IELTS_System.Models;

namespace IELTS_System.Interfaces;

/// <summary>
/// Interface for user test data access operations
/// </summary>
public interface IUserTestRepository
{
    /// <summary>
    /// Get all user tests
    /// <param name="pageNumber">Page Number</param>
    /// <param name="pageSize">Page Size</param>    /// </summary>
    /// <returns>Collection of user tests</returns>
    Task<IEnumerable<UserTest>> GetAllAsync(int pageNumber = 1, int pageSize = 10);
    
    /// <summary>
    /// Get user test by id
    /// </summary>
    /// <param name="id">User test id</param>
    /// <returns>User test if found, null otherwise</returns>
    Task<UserTest?> GetByIdAsync(Guid id);

    /// <summary>
    /// Get all tests for a specific user
    /// </summary>
    /// <param name="userId">User id</param>
    /// <param name="pageNumber">Page Number</param>
    /// <param name="pageSize">Page Size</param>
    /// <returns>Collection of user tests</returns>
    Task<IEnumerable<UserTest>> GetByUserIdAsync(Guid userId, int pageNumber = 1, int pageSize = 10);
    
    /// <summary>
    /// Get all tests for a specific test
    /// </summary>
    /// <param name="testId">Test Id</param>
    /// <param name="pageNumber">Page Number</param>
    /// <param name="pageSize">Page Size</param>
    /// <returns>Collection of user tests</returns>
    Task<IEnumerable<UserTest>> GetByTestIdAsync(Guid testId, int pageNumber = 1, int pageSize = 10);
    /// <summary>
    /// Add a new user test
    /// </summary>
    /// <param name="userTest">User test to add</param>
    /// <returns>Added user test</returns>
    Task<UserTest> AddAsync(UserTest userTest);
    
    /// <summary>
    /// Update an existing user test
    /// </summary>
    /// <param name="userTest">User test with updated information</param>
    /// <returns>True if updated successfully, false otherwise</returns>
    Task<bool> UpdateAsync(UserTest userTest);
    
    /// <summary>
    /// Delete a user test
    /// </summary>
    /// <param name="id">Id of the user test to delete</param>
    /// <returns>True if deleted successfully, false otherwise</returns>
    Task<bool> DeleteAsync(Guid id);
    
}