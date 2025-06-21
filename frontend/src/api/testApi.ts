import type { Test, TestFull, PaginationParams, CreateTestDto, UpdateTestDto, TestType } from "@/types";
import  { apiClient } from "./cilentApi";
import  { API_ENDPOINTS } from "./configApi";

export class TestAPI {
  /**
   * Get all tests with pagination
   */
  async getTests(params: { page?: number; limit?: number } = {}): Promise<Test[]> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('pageNumber', params.page.toString());
    if (params.limit) queryParams.append('pageSize', params.limit.toString());
    
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.TEST.BASE}?${queryParams.toString()}`
      : API_ENDPOINTS.TEST.BASE;
    
    return apiClient.get(url);
  }

  /**
   * Get test by ID (full test with all nested data)
   */
  async getTestById(testId: string): Promise<TestFull> {
    return apiClient.get(API_ENDPOINTS.TEST.BY_ID(testId));
  }

  /**
   * Search tests by name
   */
  async getTestsByName(
    testName: string, 
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<Test[]> {
    const queryParams = new URLSearchParams({
      pageNumber: pagination.page.toString(),
      pageSize: pagination.limit.toString(),
    });
    
    const url = `${API_ENDPOINTS.TEST.BY_NAME(testName)}?${queryParams.toString()}`;
    return apiClient.get(url);
  }

  /**
   * Get tests by type
   */
  async getTestsByType(
    testTypeId: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<Test[]> {
    const queryParams = new URLSearchParams({
      testTypeId,
      pageNumber: pagination.page.toString(),
      pageSize: pagination.limit.toString(),
    });
    
    const url = `${API_ENDPOINTS.TEST.BY_TYPE}?${queryParams.toString()}`;
    return apiClient.get(url);
  }

  /**
   * Create new test (admin only)
   */
  async createTest(testData: CreateTestDto): Promise<{ message: string; value: Test }> {
    return apiClient.post(API_ENDPOINTS.TEST.BASE, testData);
  }

  /**
   * Update test (admin only)
   */
  async updateTest(testId: string, testData: UpdateTestDto): Promise<Test> {
    return apiClient.put(API_ENDPOINTS.TEST.BY_ID(testId), testData);
  }

  /**
   * Delete test (admin only)
   */
  async deleteTest(testId: string): Promise<{ message: string }> {
    return apiClient.delete(API_ENDPOINTS.TEST.BY_ID(testId));
  }
}

// Test Type API
export class TestTypeAPI {
  /**
   * Get all test types
   */
  async getTestTypes(): Promise<TestType[]> {
    return apiClient.get(API_ENDPOINTS.TEST_TYPE.BASE);
  }

  /**
   * Get test type by ID
   */
  async getTestTypeById(testTypeId: string): Promise<TestType> {
    return apiClient.get(API_ENDPOINTS.TEST_TYPE.BY_ID(testTypeId));
  }

  /**
   * Get test type by name
   */
  async getTestTypeByName(name: string): Promise<TestType> {
    return apiClient.post(API_ENDPOINTS.TEST_TYPE.BY_NAME(name), name);
  }
}

export const testAPI = new TestAPI();
export const testTypeAPI = new TestTypeAPI();