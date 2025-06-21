using IELTS_System.DTOs.TestType;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class TestTypeMapper
{
    public static TestTypeDto ToTestTypeDto(this TestType testType)
    {
        return new TestTypeDto()
        {
           TestTypeId = testType.TestTypeId,
           Name = testType.Name,
           Description = testType.Description,
           Instructions = testType.Instructions,
           TimeLimit = testType.TimeLimit,
           TotalMarks = testType.TotalMarks
        };
    }
}