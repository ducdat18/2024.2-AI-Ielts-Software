using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.Section;

public class CreateSectionDto
{
    public required Guid PartId { get; set; }
    public required int SectionNumber { get; set; }
    [MaxLength(10000)] 
    public string? Instructions { get; set; }
    [StringLength(100)]
    public string? QuestionType { get; set; }
    public string? Content { get; set; }
    [StringLength(255)]
    public string? ImagePath { get; set; } 
}