import type { PaginationParams, UserTest, CreateUserTestDto, UpdateUserTestDto, UserAnswer, UserResponse, CreateUserResponseDto } from '@/types';
import  { apiClient } from './cilentApi';
import  { API_ENDPOINTS } from './configApi';

// User Test API
export class UserTestAPI {
  /**
   * Get all user tests with pagination
   */
  async getUserTests(pagination: PaginationParams = { page: 1, limit: 10 }): Promise<UserTest[]> {
    // ✅ Safe parameter handling
    const safePageNumber = pagination?.page || 1;
    const safePageSize = pagination?.limit || 10;
    
    const queryParams = new URLSearchParams({
      pageNumber: safePageNumber.toString(),
      pageSize: safePageSize.toString(),
    });
    
    const url = `${API_ENDPOINTS.USER_TEST.BASE}?${queryParams.toString()}`;
    return apiClient.get(url);
  }

  /**
   * Get user test by ID
   */
  async getUserTestById(userTestId: string): Promise<UserTest> {
    if (!userTestId) {
      throw new Error('UserTest ID is required');
    }
    return apiClient.get(API_ENDPOINTS.USER_TEST.BY_ID(userTestId));
  }

  /**
   * Get user tests by user ID - FIXED VERSION
   */
  async getUserTestsByUserId(
    userId: string, 
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<UserTest[]> {
    // ✅ Comprehensive validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('Valid User ID is required');
    }

    // ✅ Safe parameter handling
    const safePagination = {
      page: pagination?.page || 1,
      limit: pagination?.limit || 10
    };

    // ✅ Ensure values are numbers and convert safely
    const safePageNumber = Number(safePagination.page) || 1;
    const safePageSize = Number(safePagination.limit) || 10;

    try {
      const queryParams = new URLSearchParams({
        pageNumber: safePageNumber.toString(),
        pageSize: safePageSize.toString(),
      });
      
      const url = `${API_ENDPOINTS.USER_TEST.BY_USER(userId)}?${queryParams.toString()}`;
      console.log('🔍 Fetching user tests:', { userId, url, pagination: safePagination });
      
      return apiClient.get(url);
    } catch (error) {
      console.error('❌ Error in getUserTestsByUserId:', error);
      throw error;
    }
  }

  /**
   * Get user tests by test ID
   */
  async getUserTestsByTestId(
    testId: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<UserTest[]> {
    if (!testId) {
      throw new Error('Test ID is required');
    }

    const safePageNumber = Number(pagination?.page) || 1;
    const safePageSize = Number(pagination?.limit) || 10;

    const queryParams = new URLSearchParams({
      pageNumber: safePageNumber.toString(),
      pageSize: safePageSize.toString(),
    });
    
    const url = `${API_ENDPOINTS.USER_TEST.BY_TEST(testId)}?${queryParams.toString()}`;
    return apiClient.get(url);
  }

  /**
   * Start a new test session
   */
  async startTest(testData: CreateUserTestDto): Promise<UserTest> {
    return apiClient.post(API_ENDPOINTS.USER_TEST.BASE, testData);
  }

  /**
   * Update user test (e.g., change status, add feedback)
   */
  async updateUserTest(userTestId: string, updates: UpdateUserTestDto): Promise<{ message: string }> {
    if (!userTestId) {
      throw new Error('UserTest ID is required');
    }
    return apiClient.put(API_ENDPOINTS.USER_TEST.BY_ID(userTestId), updates);
  }

  /**
   * Delete user test
   */
  async deleteUserTest(userTestId: string): Promise<{ message: string }> {
    if (!userTestId) {
      throw new Error('UserTest ID is required');
    }
    return apiClient.delete(API_ENDPOINTS.USER_TEST.BY_ID(userTestId));
  }

  /**
   * Complete test session
   */
  async completeTest(userTestId: string, finalData: {
    endTime: string;
    status: 'completed' | 'abandoned';
    numCorrectAnswer: number;
    feedback?: string;
  }): Promise<{ message: string }> {
    return this.updateUserTest(userTestId, finalData);
  }

  /**
   * Get test session status
   */
  async getTestSessionStatus(userTestId: string): Promise<{
    status: string;
    timeElapsed: number;
    questionsAnswered: number;
    totalQuestions: number;
    canContinue: boolean;
  }> {
    // Note: This endpoint may need to be implemented in backend
    return apiClient.get(`${API_ENDPOINTS.USER_TEST.BY_ID(userTestId)}/status`);
  }

  /**
   * Save test progress (for auto-save functionality)
   */
  async saveTestProgress(userTestId: string, _progressData: {
    currentSection?: number;
    currentQuestion?: number;
    timeSpent: number;
    answers: UserAnswer[];
  }): Promise<{ message: string }> {
    // Note: This endpoint may need to be implemented in backend
    // For now, we can use the update endpoint to save progress
    return this.updateUserTest(userTestId, {
      status: 'in progress'
    });
  }

  /**
   * Get user's test history with enhanced filtering
   */
  async getUserTestHistory(
    userId: string,
    filters?: {
      skill?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<{
    tests: UserTest[];
    stats: {
      totalTests: number;
      completedTests: number;
      averageScore: number;
      bestScore: number;
    };
  }> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const safePageNumber = Number(pagination?.page) || 1;
    const safePageSize = Number(pagination?.limit) || 20;

    const queryParams = new URLSearchParams({
      pageNumber: safePageNumber.toString(),
      pageSize: safePageSize.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          queryParams.append(key, value);
        }
      });
    }

    const url = `${API_ENDPOINTS.USER_TEST.BY_USER(userId)}/history?${queryParams.toString()}`;
    
    try {
      return apiClient.get(url);
    } catch (error) {
      // If endpoint doesn't exist, fallback to regular getUserTestsByUserId
      console.warn('History endpoint not available, falling back to regular user tests');
      const tests = await this.getUserTestsByUserId(userId, pagination);
      
      // Calculate basic stats
      const completedTests = tests.filter(t => t.status === 'completed');
      const totalScore = completedTests.reduce((sum, test) => sum + (test.numCorrectAnswer || 0), 0);
      const averageScore = completedTests.length > 0 ? totalScore / completedTests.length : 0;
      const bestScore = completedTests.length > 0 
        ? Math.max(...completedTests.map(t => t.numCorrectAnswer || 0)) 
        : 0;

      return {
        tests,
        stats: {
          totalTests: tests.length,
          completedTests: completedTests.length,
          averageScore: Math.round(averageScore * 10) / 10,
          bestScore
        }
      };
    }
  }
}

// User Response API - Also improved with safety
export class UserResponseAPI {
  /**
   * Get all user responses with pagination
   */
  async getUserResponses(pagination: PaginationParams = { page: 1, limit: 10 }): Promise<UserResponse[]> {
    const safePageNumber = Number(pagination?.page) || 1;
    const safePageSize = Number(pagination?.limit) || 10;

    const queryParams = new URLSearchParams({
      pageNumber: safePageNumber.toString(),
      pageSize: safePageSize.toString(),
    });
    
    const url = `${API_ENDPOINTS.USER_RESPONSE.BASE}?${queryParams.toString()}`;
    return apiClient.get(url);
  }

  /**
   * Get user response by ID
   */
  async getUserResponseById(responseId: string): Promise<UserResponse> {
    if (!responseId) {
      throw new Error('Response ID is required');
    }
    return apiClient.get(API_ENDPOINTS.USER_RESPONSE.BY_ID(responseId));
  }

  /**
   * Get responses by user test ID
   */
  async getResponsesByUserTestId(userTestId: string): Promise<UserResponse[]> {
    if (!userTestId) {
      throw new Error('UserTest ID is required');
    }
    return apiClient.get(API_ENDPOINTS.USER_RESPONSE.BY_USER_TEST(userTestId));
  }

  /**
   * Submit single answer
   */
  async submitAnswer(responseData: CreateUserResponseDto): Promise<UserResponse> {
    return apiClient.post(API_ENDPOINTS.USER_RESPONSE.BASE, responseData);
  }

  /**
   * Submit multiple answers
   */
  async submitMultipleAnswers(responsesData: CreateUserResponseDto[]): Promise<UserResponse[]> {
    if (!Array.isArray(responsesData) || responsesData.length === 0) {
      throw new Error('Valid responses data is required');
    }
    return apiClient.post(API_ENDPOINTS.USER_RESPONSE.MULTIPLE, responsesData);
  }

  /**
   * Delete user response
   */
  async deleteUserResponse(responseId: string): Promise<{ message: string }> {
    if (!responseId) {
      throw new Error('Response ID is required');
    }
    return apiClient.delete(API_ENDPOINTS.USER_RESPONSE.BY_ID(responseId));
  }

  /**
   * Update user response (for corrections or re-grading)
   */
  async updateUserResponse(responseId: string, updates: {
    userAnswer?: string;
    marksAwarded?: number;
  }): Promise<UserResponse> {
    if (!responseId) {
      throw new Error('Response ID is required');
    }
    return apiClient.put(API_ENDPOINTS.USER_RESPONSE.BY_ID(responseId), updates);
  }

  /**
   * Get response statistics for a test
   */
  async getResponseStats(userTestId: string): Promise<{
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    accuracy: number;
    averageTimePerQuestion: number;
  }> {
    if (!userTestId) {
      throw new Error('UserTest ID is required');
    }

    try {
      // For now, calculate from responses
      const responses = await this.getResponsesByUserTestId(userTestId);
      const answeredQuestions = responses.length;
      const correctAnswers = responses.filter(r => (r.marksAwarded || 0) > 0).length;
      
      return {
        totalQuestions: 0, // Would need to get from test
        answeredQuestions,
        correctAnswers,
        incorrectAnswers: answeredQuestions - correctAnswers,
        skippedQuestions: 0, // Would need to calculate
        accuracy: answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0,
        averageTimePerQuestion: 0, // Would need time tracking
      };
    } catch (error) {
      console.error('Error calculating response stats:', error);
      throw error;
    }
  }
}

// Test Session Management API (higher-level operations)
export class TestSessionAPI {
  private userTestAPI = new UserTestAPI();
  private userResponseAPI = new UserResponseAPI();

  /**
   * Initialize new test session
   */
  async initializeSession(userId: string, testId: string): Promise<{
    userTest: UserTest;
    test: any;
  }> {
    if (!userId || !testId) {
      throw new Error('User ID and Test ID are required');
    }

    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
    
    const userTest = await this.userTestAPI.startTest({
      userId,
      testId,
      startTime,
      endTime,
      status: 'in progress',
      numCorrectAnswer: 0,
      feedback: '',
    });

    // Get test details
    const test = await apiClient.get(`/api/Test/id/${testId}`);

    return { userTest, test };
  }

  /**
   * Save answer to current session
   */
  async saveAnswer(sessionId: string, answer: UserAnswer): Promise<UserResponse> {
    if (!sessionId || !answer?.questionId) {
      throw new Error('Session ID and valid answer are required');
    }

    const responseData: CreateUserResponseDto = {
      userTestId: sessionId,
      questionId: answer.questionId,
      userAnswer: Array.isArray(answer.answer) ? answer.answer.join(',') : String(answer.answer || ''),
      marksRewarded: 0, // Will be calculated by backend
    };

    return this.userResponseAPI.submitAnswer(responseData);
  }

  /**
   * Submit entire test
   */
  async submitTest(sessionId: string, answers: UserAnswer[]): Promise<UserTest> {
    if (!sessionId || !Array.isArray(answers)) {
      throw new Error('Session ID and valid answers are required');
    }

    // Submit all answers
    const responsesData: CreateUserResponseDto[] = answers.map(answer => ({
      userTestId: sessionId,
      questionId: answer.questionId,
      userAnswer: Array.isArray(answer.answer) ? answer.answer.join(',') : String(answer.answer || ''),
      marksRewarded: 0,
    }));

    await this.userResponseAPI.submitMultipleAnswers(responsesData);

    // Complete the test
    const endTime = new Date().toISOString();
    await this.userTestAPI.completeTest(sessionId, {
      endTime,
      status: 'completed',
      numCorrectAnswer: 0, // Will be calculated by backend
    });

    // Get final results from backend
    const userTest = await this.userTestAPI.getUserTestById(sessionId);
    return userTest;
  }

  /**
   * Resume test session
   */
  async resumeSession(sessionId: string): Promise<{
    userTest: UserTest;
    responses: UserResponse[];
  }> {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const userTest = await this.userTestAPI.getUserTestById(sessionId);
    const responses = await this.userResponseAPI.getResponsesByUserTestId(sessionId);

    return { userTest, responses };
  }

  /**
   * Auto-save session progress
   */
  async autoSave(sessionId: string, currentAnswers: UserAnswer[]): Promise<void> {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Save current progress
    await this.userTestAPI.saveTestProgress(sessionId, {
      timeSpent: 0,
      answers: currentAnswers || [],
    });
  }
}

export const userTestAPI = new UserTestAPI();
export const userResponseAPI = new UserResponseAPI();
export const testSessionAPI = new TestSessionAPI();