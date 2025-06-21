using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.Test;

public class CreateTestDto
{
    [StringLength(255)]
    public required string TestName { get; set; }
    public required Guid TestTypeId { get; set; }
    [StringLength(255)]
    public string? AudioPath { get; set; }
}