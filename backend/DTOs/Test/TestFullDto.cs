using IELTS_System.DTOs.Answer;
using IELTS_System.DTOs.Question;

namespace IELTS_System.DTOs.Test;

public class TestFullDto
{
    public Guid TestId { get; set; }
    public required string TestName { get; set; }
    public Guid TestTypeId { get; set; }
    public required string TestTypeName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime LastUpdatedDate { get; set; }
    public string? AudioPath { get; set; }
    public List<TestPartFullDto> TestParts { get; set; } = new();
}

public class TestPartFullDto
{
    public Guid PartId { get; set; }
    public int PartNumber { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public required string Content { get; set; }
    public string? ImgPath { get; set; }
    public List<SectionFullDto> Sections { get; set; } = new();
}

public class SectionFullDto
{
    public Guid SectionId { get; set; }
    public int SectionNumber { get; set; }
    public string? Instructions { get; set; }
    public string? QuestionType { get; set; }
    public string? ImagePath { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}