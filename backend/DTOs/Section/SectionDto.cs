using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.Section;

public class SectionDto
{
    public Guid SectionId { get; init; }
    public required Guid PartId { get; set; }
    public required int SectionNumber { get; set; }
    [MaxLength(10000)] 
    public string? Instructions { get; set; }
    [StringLength(100)]
    public string? QuestionType { get; set; }
    [StringLength(255)]
    public string? ImagePath { get; set; } 
    public string? Content { get; set;}
}