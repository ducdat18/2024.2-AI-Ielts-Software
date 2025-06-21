using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.TestPart;

public class TestPartDto
{
    public Guid PartId { get; set; }
    public required Guid TestId { get; set; }
    public required int PartNumber { get; set; }
    [MaxLength(10000)] 
    public string? Title { get; set; }
    [MaxLength(10000)] 
    public string? Description { get; set; }
    [MaxLength(10000)] 
    public required string Content { get; set; }
    [StringLength(255)]
    public string? ImgPath { get; set; }
}