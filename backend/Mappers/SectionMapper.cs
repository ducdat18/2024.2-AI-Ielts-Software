using IELTS_System.DTOs.Section;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class SectionMapper
{
    public static Section ToSection(this CreateSectionDto createSectionDto, TestPart testPart)
    {
        return new Section()
        {
            SectionId = Guid.NewGuid(),
            PartId = createSectionDto.PartId,
            SectionNumber = createSectionDto.SectionNumber,   
            Instructions = createSectionDto.Instructions,
            QuestionType = createSectionDto.QuestionType,
            Content = createSectionDto.Content,
            ImagePath = createSectionDto.ImagePath,
            TestPart = testPart
        };
    }

    public static SectionDto ToSectionDto(this Section section)
    {
        return new SectionDto()
        {
            SectionId = section.SectionId,
            PartId = section.PartId,
            SectionNumber = section.SectionNumber,   
            Instructions = section.Instructions,
            QuestionType = section.QuestionType,
            Content = section.Content,
            ImagePath = section.ImagePath,
        };
    }

    public static Section ToUpdate(this UpdateSectionDto updateSectionDto, Section section)
    {
        return new Section()
        {
            SectionId = section.SectionId,
            PartId = section.PartId,
            SectionNumber = updateSectionDto.SectionNumber,   
            Instructions = updateSectionDto.Instructions,
            QuestionType = updateSectionDto.QuestionType,
            ImagePath = updateSectionDto.ImagePath,
            Content = updateSectionDto.Content,
            TestPart = section.TestPart
        };
    }
}