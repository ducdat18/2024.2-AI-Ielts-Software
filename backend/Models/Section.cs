using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IELTS_System.Models;

[Table("sections" , Schema = "public")]
public class Section
{
     [Key]
     [Column("section_id")]
     public Guid SectionId { get; init; }
     [Column("part_id")]
     public required Guid PartId { get; set; }
     [Column("section_number")]
     public required int SectionNumber { get; set; }
     [Column("instructions")]
     [MaxLength(10000)] 
     public string? Instructions { get; set; }
     [Column("question_type")]
     [StringLength(100)]
     public string? QuestionType { get; set; }
     [Column("content")]
     public string? Content { get; set; }
     [Column("image_path")]
     [StringLength(255)]
     public string? ImagePath { get; set; } 
     [ForeignKey("PartId")]
     public required TestPart TestPart { get; set; }
     
     // Navigation property for the collection of Question
     public ICollection<Question> Questions { get; set; } = new List<Question>();
}