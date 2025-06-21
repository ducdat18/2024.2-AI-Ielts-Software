using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.Section;

public class UpdateSectionDto
{
    public required int SectionNumber { get; set; }
    [MaxLength(10000)] 
    public string? Instructions { get; set; }
    [StringLength(100)]
    public string? QuestionType { get; set; }
    [StringLength(255)]
    public string? ImagePath { get; set; } 
    public string? Content { get; set;}
}