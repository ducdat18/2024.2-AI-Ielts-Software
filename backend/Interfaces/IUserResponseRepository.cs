using IELTS_System.Models;

namespace IELTS_System.Interfaces;

/// <summary>
/// Interface for user response data access operations
/// </summary>
public interface IUserResponseRepository
{
    /// <summary>
    /// Get all user responses
    /// </summary>
    /// <param name="pageNumber">Page Number</param>
    /// <param name="pageSize">Page Size</param>
    /// <returns>Collection of user responses</returns>
    Task<IEnumerable<UserResponse>> GetAllAsync(int pageNumber = 1, int pageSize = 10);
    
    /// <summary>
    /// Get user response by id
    /// </summary>
    /// <param name="id">User response id</param>
    /// <returns>User response if found, null otherwise</returns>
    Task<UserResponse?> GetByIdAsync(Guid id);
    
    /// <summary>
    /// Get all responses for a specific user test
    /// </summary>
    /// <param name="userTestId">User test id</param>
    /// <param name="pageNumber">Page Number</param>
    /// <param name="pageSize">Page Size</param>
    /// <returns>Collection of user responses</returns>
    Task<IEnumerable<UserResponse>> GetByUserTestIdAsync(Guid userTestId, int pageNumber = 1, int pageSize = 10);
    
    /// <summary>
    /// Add a new user response
    /// </summary>
    /// <param name="userResponse">User response to add</param>
    /// <returns>Added user response</returns>
    Task<UserResponse> CreateAsync(UserResponse userResponse);
    
    /// <summary>
    /// Add multiple user responses in a batch
    /// </summary>
    /// <param name="userResponses">Collection of user responses to add</param>
    /// <returns>Added user responses</returns>
    Task<IEnumerable<UserResponse>> CreateBulkAsync(IEnumerable<UserResponse> userResponses);
    
    /// <summary>
    /// Update an existing user response
    /// </summary>
    /// <param name="userResponse">User response with updated information</param>
    /// <returns>True if updated successfully, false otherwise</returns>
    Task<bool> UpdateAsync(UserResponse userResponse);
    
    /// <summary>
    /// Delete a user response
    /// </summary>
    /// <param name="id">Id of the user response to delete</param>
    /// <returns>True if deleted successfully, false otherwise</returns>
    Task<bool> DeleteAsync(Guid id);
}