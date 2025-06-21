using IELTS_System.Models;

namespace IELTS_System.Interfaces;
/// <summary>
/// Interface for section data access operations
/// </summary>
public interface ISectionRepository
{
    /// <summary>
    /// Creates a new section to the given test part in the database
    /// </summary>
    /// <param name="section">The Section entity to create and be assigned to TestPart</param>
    /// <returns>The created Section with generated ID</returns>
    Task<Section> CreateAsync(Section section);
    /// <summary>
    /// Retrieves a section by its unique identifier
    /// </summary>
    /// <param name="sectionId">The unique identifier of the section</param>
    /// <returns>The section if found; otherwise null</returns>
    Task<Section?> GetByIdAsync(Guid sectionId);
    /// <summary>
    /// Retrieves all sections for a specific test part
    /// </summary>
    /// <param name="partId">The unique identifier of the test part</param>
    /// <returns>A collection of sections belonging to the specified test part</returns>
    Task<IEnumerable<Section>> GetByPartIdAsync(Guid partId);
    /// <summary>
    /// Updates an existing section in the database
    /// </summary>
    /// <param name="section">The section entity with updated values</param>
    /// <returns>The updated section</returns>
    /// <exception cref="KeyNotFoundException">Thrown when the section with the specified ID is not found</exception>
    Task<Section> UpdateAsync(Section section);
    /// <summary>
    /// Deletes a section from the database
    /// </summary>
    /// <param name="sectionId">The unique identifier of the section to delete</param>
    /// <returns>True if deletion was successful; otherwise false</returns>
    Task<bool> DeleteAsync(Guid sectionId);
    /// <summary>
    /// Checks if a section with the specified section number already exists within a given test part.
    /// </summary>
    /// <param name="partId">The unique identifier of the test part to check against.</param>
    /// <param name="sectionNumber">The section number to check for uniqueness.</param>
    /// <returns>
    /// A task that represents the asynchronous operation.
    /// The task result contains a boolean value:
    /// - true if a section with the specified number already exists in the given test part
    /// - false if no section with the specified number exists in the given test part
    /// </returns>
    /// <remarks>
    /// This method is typically used during section creation to ensure that section numbers 
    /// are unique within their parent test part, maintaining proper ordering and structure.
    /// </remarks>
    Task<bool> SectionNumberExistsAsync(Guid partId, int sectionNumber);
}