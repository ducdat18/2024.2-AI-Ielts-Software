import type { CreateTestPartDto, TestPart, UpdateTestPartDto, CreateSectionDto, Section, UpdateSectionDto, CreateQuestionDto, Question, UpdateQuestionDto, UpdateAnswerDto, Answer } from "@/types";
import { apiClient } from "./cilentApi";
import { API_ENDPOINTS } from "./configApi";

// Test Part API
export class TestPartAPI {
  /**
   * Create new test part (admin only)
   */
  async createTestPart(partData: CreateTestPartDto): Promise<{ message: string; value: TestPart }> {
    return apiClient.post(API_ENDPOINTS.TEST_PART.BASE, partData);
  }

  /**
   * Get test part by ID
   */
  async getTestPartById(partId: string): Promise<TestPart> {
    return apiClient.get(API_ENDPOINTS.TEST_PART.BY_ID(partId));
  }

  /**
   * Get all test parts for a test
   */
  async getTestPartsByTestId(testId: string): Promise<TestPart[]> {
    return apiClient.get(API_ENDPOINTS.TEST_PART.BY_TEST(testId));
  }

  /**
   * Update test part (admin only)
   */
  async updateTestPart(partId: string, partData: UpdateTestPartDto): Promise<TestPart> {
    return apiClient.put(API_ENDPOINTS.TEST_PART.BY_ID(partId), partData);
  }

  /**
   * Delete test part (admin only)
   */
  async deleteTestPart(partId: string): Promise<{ message: string }> {
    return apiClient.delete(API_ENDPOINTS.TEST_PART.BY_ID(partId));
  }
}

// Section API
export class SectionAPI {
  /**
   * Create new section (admin only)
   */
  async createSection(sectionData: CreateSectionDto): Promise<{ message: string; value: Section }> {
    return apiClient.post(API_ENDPOINTS.SECTION.BASE, sectionData);
  }

  /**
   * Get section by ID
   */
  async getSectionById(sectionId: string): Promise<Section> {
    return apiClient.get(API_ENDPOINTS.SECTION.BY_ID(sectionId));
  }

  /**
   * Get all sections for a test part
   */
  async getSectionsByPartId(partId: string): Promise<Section[]> {
    return apiClient.get(API_ENDPOINTS.SECTION.BY_PART(partId));
  }

  /**
   * Update section (admin only)
   */
  async updateSection(sectionId: string, sectionData: UpdateSectionDto): Promise<Section> {
    return apiClient.put(API_ENDPOINTS.SECTION.BY_ID(sectionId), sectionData);
  }

  /**
   * Delete section (admin only)
   */
  async deleteSection(sectionId: string): Promise<{ message: string }> {
    return apiClient.delete(API_ENDPOINTS.SECTION.BY_ID(sectionId));
  }
}

// Question API
export class QuestionAPI {
  /**
   * Create new question (admin only)
   */
  async createQuestion(questionData: CreateQuestionDto): Promise<{ message: string; question: Question }> {
    return apiClient.post(API_ENDPOINTS.QUESTION.BASE, questionData);
  }

  /**
   * Get question by ID
   */
  async getQuestionById(questionId: string): Promise<Question> {
    return apiClient.get(API_ENDPOINTS.QUESTION.BY_ID(questionId));
  }

  /**
   * Get all questions for a section
   */
  async getQuestionsBySectionId(sectionId: string): Promise<Question[]> {
    return apiClient.get(API_ENDPOINTS.QUESTION.BY_SECTION(sectionId));
  }

  /**
   * Update question (admin only)
   */
  async updateQuestion(questionId: string, questionData: UpdateQuestionDto): Promise<Question> {
    return apiClient.put(API_ENDPOINTS.QUESTION.BY_ID(questionId), questionData);
  }

  /**
   * Delete question (admin only)
   */
  async deleteQuestion(questionId: string): Promise<{ message: string }> {
    return apiClient.delete(API_ENDPOINTS.QUESTION.BY_ID(questionId));
  }

  /**
   * Create multiple questions (admin only)
   */
  async createBulkQuestions(questionsData: CreateQuestionDto[]): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.QUESTION.MULTIPLE, questionsData);
  }

  /**
   * Update multiple questions (admin only)
   */
  async updateBulkQuestions(questionsData: UpdateQuestionDto[]): Promise<{ message: string }> {
    return apiClient.put(API_ENDPOINTS.QUESTION.BULK, questionsData);
  }

  /**
   * Get question count for a section
   */
  async getQuestionCountForSection(sectionId: string): Promise<{ count: number }> {
    return apiClient.get(API_ENDPOINTS.QUESTION.COUNT_BY_SECTION(sectionId));
  }
}

// Answer API
export class AnswerAPI {
  /**
   * Update answer (admin only)
   */
  async updateAnswer(answerId: string, answerData: UpdateAnswerDto): Promise<Answer> {
    return apiClient.put(API_ENDPOINTS.ANSWER.BY_ID(answerId), answerData);
  }

  /**
   * Update multiple answers (admin only)
   */
  async updateMultipleAnswers(answersData: UpdateAnswerDto[]): Promise<{ message: string }> {
    return apiClient.put(API_ENDPOINTS.ANSWER.MULTIPLE, answersData);
  }
}

// Composite Test Management API
export class TestManagementAPI {
  public testPart = new TestPartAPI();
  public section = new SectionAPI();
  public question = new QuestionAPI();
  public answer = new AnswerAPI();

  /**
   * Get complete test structure for editing (admin only)
   */
  async getTestForEditing(testId: string): Promise<{
    test: any;
    parts: TestPart[];
    sections: Section[];
    questions: Question[];
  }> {
    // This would typically be a single endpoint that returns all nested data
    // For now, we'll make multiple calls
    const test = await apiClient.get(`/api/Test/id/${testId}`);
    const parts = await this.testPart.getTestPartsByTestId(testId);
    
    const sections: Section[] = [];
    const questions: Question[] = [];
    
    for (const part of parts) {
      const partSections = await this.section.getSectionsByPartId(part.partId);
      sections.push(...partSections);
      
      for (const section of partSections) {
        const sectionQuestions = await this.question.getQuestionsBySectionId(section.sectionId);
        questions.push(...sectionQuestions);
      }
    }
    
    return { test, parts, sections, questions };
  }

  /**
   * Clone test with all its content (admin only)
   * Note: This endpoint may need to be implemented in backend
   */
  async cloneTest(_testId: string, _newTestName: string): Promise<{ message: string; newTestId: string }> {
    // This would need to be implemented in backend
    throw new Error('Clone test endpoint not yet implemented in backend');
  }

  /**
   * Import test from file (admin only)
   * Note: This endpoint may need to be implemented in backend
   */
  async importTest(_file: File, _onProgress?: (progress: number) => void): Promise<{ message: string; testId: string }> {
    // This would need to be implemented in backend
    throw new Error('Import test endpoint not yet implemented in backend');
  }

  /**
   * Export test to file (admin only)
   * Note: This endpoint may need to be implemented in backend
   */
  async exportTest(_testId: string, _format: 'json' | 'xlsx' = 'json'): Promise<Blob> {
    // This would need to be implemented in backend
    throw new Error('Export test endpoint not yet implemented in backend');
  }

  /**
   * Validate test structure (admin only)
   * Note: This endpoint may need to be implemented in backend
   */
  async validateTest(_testId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    // This would need to be implemented in backend
    throw new Error('Validate test endpoint not yet implemented in backend');
  }

  /**
   * Get test preview for students
   * Note: This endpoint may need to be implemented in backend
   */
  async getTestPreview(_testId: string): Promise<{
    test: any;
    sampleQuestions: Question[];
    estimatedTime: number;
    difficulty: string;
  }> {
    // This would need to be implemented in backend
    throw new Error('Test preview endpoint not yet implemented in backend');
  }
}

export const testPartAPI = new TestPartAPI();
export const sectionAPI = new SectionAPI();
export const questionAPI = new QuestionAPI();
export const answerAPI = new AnswerAPI();
export const testManagementAPI = new TestManagementAPI();