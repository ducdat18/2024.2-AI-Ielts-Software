using IELTS_System.DTOs.TestPart;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class TestPartMapper
{
    public static TestPart ToTestPart(this CreateTestPartDto createTestPartDto, Test test)
    {
        return new TestPart()
        {
            PartId = Guid.NewGuid(),
            TestId = createTestPartDto.TestId,
            PartNumber = createTestPartDto.PartNumber,
            Title = createTestPartDto.Title,
            Description = createTestPartDto.Description,
            Content = createTestPartDto.Content,
            ImgPath = createTestPartDto.ImgPath,
            Test = test
        };
    }

    public static TestPartDto ToTestPartDto(this TestPart testPart)
    {
        return new TestPartDto(){
            PartId = testPart.PartId,
            TestId = testPart.TestId,
            PartNumber = testPart.PartNumber,
            Title = testPart.Title,
            Description = testPart.Description,
            Content = testPart.Content,
            ImgPath = testPart.ImgPath,
        };
    }

    public static TestPart ToUpdate(this UpdateTestPartDto updateTestPartDto, TestPart testPart)
    {
        return new TestPart()
        {
            PartId = testPart.PartId,
            TestId = testPart.TestId,
            PartNumber = updateTestPartDto.PartNumber,
            Title = updateTestPartDto.Title,
            Description = updateTestPartDto.Description,
            Content = updateTestPartDto.Content,
            ImgPath = updateTestPartDto.ImgPath,
            Test = testPart.Test
        };
    }
}