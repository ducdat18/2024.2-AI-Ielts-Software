namespace IELTS_System.DTOs.TestType;

public class TestTypeDto
{
    public Guid TestTypeId { get; init; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required int TimeLimit { get; init; }
    public required int TotalMarks { get; init; }
    public string? Instructions { get; set; }
}