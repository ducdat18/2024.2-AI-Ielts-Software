using IELTS_System.DTOs.Test;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class TestMapper
{
    public static TestDto ToTestDto(this Test test)
    {
        return new TestDto()
        {
            TestId = test.TestId,
            TestTypeId = test.TestTypeId,
            TestName = test.TestName,
            CreationDate = test.CreationDate,
            IsActive = true,
            AudioPath = test.AudioPath,
            LastUpdatedDate = test.LastUpdatedDate,
            TestTypeName = test.TestType.Name,
            Description = test.TestType.Description,
            TimeLimit = test.TestType.TimeLimit,
            TotalMarks = test.TestType.TotalMarks,
            Instructions = test.TestType.Instructions
        };
    }

    public static Test ToTest(this CreateTestDto createTestDto, TestType testType)
    {
        return new Test()
        {
            TestId = Guid.NewGuid(),
            TestTypeId = createTestDto.TestTypeId,
            TestName = createTestDto.TestName,
            CreationDate = DateTime.UtcNow,
            IsActive = true,
            AudioPath = createTestDto.AudioPath,
            LastUpdatedDate = DateTime.UtcNow,
            TestType = testType
        };
    }

    public static Test ToUpdate(this UpdateTestDto updateTestDto, Test test)
    {
        return new Test(){
            TestId = test.TestId,
            TestTypeId = test.TestTypeId,
            TestName = updateTestDto.TestName,
            CreationDate = test.CreationDate,
            IsActive = updateTestDto.IsActive,
            AudioPath = updateTestDto.AudioPath,
            LastUpdatedDate = DateTime.UtcNow,
            TestType = test.TestType
        };
    }
    
    public static TestFullDto ToTestFullDto(this Test test)
    {
        var testDto = new TestFullDto
        {
            TestId = test.TestId,
            TestName = test.TestName,
            TestTypeId = test.TestTypeId,
            TestTypeName = test.TestType?.Name ?? string.Empty,
            IsActive = test.IsActive,
            CreationDate = test.CreationDate,
            LastUpdatedDate = test.LastUpdatedDate,
            AudioPath = test.AudioPath
        };

        foreach (var part in test.TestParts.OrderBy(p => p.PartNumber))
        {
            var partDto = new TestPartFullDto
            {
                PartId = part.PartId,
                PartNumber = part.PartNumber,
                Title = part.Title,
                Description = part.Description,
                Content = part.Content,
                ImgPath = part.ImgPath
            };

            foreach (var section in part.Sections.OrderBy(s => s.SectionNumber))
            {
                var sectionDto = new SectionFullDto
                {
                    SectionId = section.SectionId,
                    SectionNumber = section.SectionNumber,
                    Instructions = section.Instructions,
                    QuestionType = section.QuestionType,
                    ImagePath = section.ImagePath
                };

                foreach (var question in section.Questions.OrderBy(q => q.QuestionNumber))
                {
                    var answerDto = question.Answer != null 
                        ? question.Answer.ToAnswerDto() 
                        : null;

                    if (answerDto != null) sectionDto.Questions.Add(question.ToQuestionDto(answerDto));
                }

                partDto.Sections.Add(sectionDto);
            }

            testDto.TestParts.Add(partDto);
        }

        return testDto;
    }
}