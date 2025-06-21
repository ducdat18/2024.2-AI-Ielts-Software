using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.Test;

public class TestDto
{
    public Guid TestId { get; set; }
    [StringLength(255)]
    public required string TestName { get; set; }
    public required Guid TestTypeId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreationDate { get; init; }
    public DateTime LastUpdatedDate { get; set; }
    [StringLength(255)]
    public string? AudioPath { get; set; }
    public string? TestTypeName { get; set; }
    public string? Description { get; set; }
    public required int TimeLimit { get; init; }
    public required int TotalMarks { get; init; }
    public string? Instructions { get; set; }
}