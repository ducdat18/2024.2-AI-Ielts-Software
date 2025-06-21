using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.Test;

public class UpdateTestDto
{
    [StringLength(255)]
    public required string TestName { get; set; }
    public bool IsActive { get; set; }
    [StringLength(255)]
    public string? AudioPath { get; set; }

}