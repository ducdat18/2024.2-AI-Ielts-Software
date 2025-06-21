import { authAPI } from "./authApi";
import { testAPI, testTypeAPI } from "./testApi";
import { testPartAPI, sectionAPI, questionAPI, answerAPI, testManagementAPI } from "./testManagementApi";
import { userAPI } from "./userApi";
import { userTestAPI, userResponseAPI, testSessionAPI } from "./userTestApi";


// Main API class that combines all services
export class IELTSAPI {
  public auth = authAPI;
  public user = userAPI;
  public test = testAPI;
  public testType = testTypeAPI;
  public testPart = testPartAPI;
  public section = sectionAPI;
  public question = questionAPI;
  public answer = answerAPI;
  public testManagement = testManagementAPI;
  public userTest = userTestAPI;
  public userResponse = userResponseAPI;
  public testSession = testSessionAPI;

  // Utility methods
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Try to call a simple endpoint to check if backend is alive
      await this.testType.getTestTypes();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get API version - may need backend implementation
  async getVersion(): Promise<{ version: string; build: string }> {
    return {
      version: '1.0.0',
      build: 'development',
    };
  }
}

export const api = new IELTSAPI();
export default api;

