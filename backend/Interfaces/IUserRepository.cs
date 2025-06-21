using IELTS_System.Models;

namespace IELTS_System.Interfaces;

/// <summary>
/// Interface for user data access operations
/// </summary>
public interface IUserRepository
{
     /// <summary>
    /// Creates a new user in the database
    /// </summary>
    /// <param name="user">The user entity to create</param>
    /// <returns>The created user with generated ID</returns>
    Task<User> CreateAsync(User user);

    /// <summary>
    /// Retrieves a user by their unique identifier
    /// </summary>
    /// <param name="userId">The unique identifier of the user</param>
    /// <returns>The user if found, null otherwise</returns>
    Task<User?> GetByIdAsync(Guid userId);

    /// <summary>
    /// Retrieves a user by their email address
    /// </summary>
    /// <param name="email">The email address of the user</param>
    /// <returns>The user if found, null otherwise</returns>
    Task<User?> GetByEmailAsync(string email);

    /// <summary>
    /// Updates an existing user in the database
    /// </summary>
    /// <param name="user">The user entity with updated information</param>
    /// <returns>The updated user</returns>
    Task<User> UpdateAsync(User user);

    /// <summary>
    /// Deletes a user from the database
    /// </summary>
    /// <param name="userId">The unique identifier of the user to delete</param>
    /// <returns>True if user was deleted, false if user was not found</returns>
    Task<bool> DeleteAsync(Guid userId);

    /// <summary>
    /// Gets all users with optional pagination
    /// </summary>
    /// <param name="pageNumber">The page number to retrieve (1-based)</param>
    /// <param name="pageSize">The number of users per page</param>
    /// <returns>A collection of users for the specified page</returns>
    Task<IEnumerable<User>> GetAllAsync(int pageNumber = 1, int pageSize = 10);

    /// <summary>
    /// Updates the last login time for a user
    /// </summary>
    /// <param name="userId">The unique identifier of the user</param>
    /// <returns>True if the update was successful, false otherwise</returns>
    Task<bool> UpdateLastLoginAsync(Guid userId);

    /// <summary>
    /// Checks if an email address is already registered
    /// </summary>
    /// <param name="email">The email address to check</param>
    /// <returns>True if the email exists, false otherwise</returns>
    Task<bool> EmailExistsAsync(string email);

    /// <summary>
    /// Updates a user's password
    /// </summary>
    /// <param name="userId">The unique identifier of the user</param>
    /// <param name="hashedPassword">The new hashed password</param>
    /// <returns>True if the password was updated successfully, false otherwise</returns>
    Task<bool> UpdatePasswordAsync(Guid userId, string hashedPassword);

    /// <summary>
    /// Updates a user's profile image path
    /// </summary>
    /// <param name="userId">The unique identifier of the user</param>
    /// <param name="imagePath">The path to the profile image</param>
    /// <returns>True if the image path was updated successfully, false otherwise</returns>
    Task<bool> UpdateProfileImageAsync(Guid userId, string imagePath);
}