import type { LoginRequest, User, CreateUserDto, VerificationRequestDto, PwdRecoveryRequestDto } from "@/types";
import { apiClient } from "./cilentApi";
import { API_ENDPOINTS } from "./configApi";


export class AuthAPI {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<{ message: string; user: User }> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password,
    });
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  /**
   * Send verification code for registration
   */
  async sendVerificationCode(userData: CreateUserDto): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.USER.REGISTER_SEND_VERIFICATION, userData);
  }

  /**
   * Verify code and complete registration
   */
  async verifyAndRegister(request: VerificationRequestDto): Promise<User> {
    return apiClient.post(API_ENDPOINTS.USER.REGISTER_VERIFY, request);
  }

  /**
   * Send password recovery code
   */
  async sendRecoveryCode(request: PwdRecoveryRequestDto): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.USER.RECOVERY_SEND, request);
  }

  /**
   * Get temporary password after verification
   */
  async getTempPassword(request: VerificationRequestDto): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.USER.RECOVERY_TEMP_PASSWORD, request);
  }
}

export const authAPI = new AuthAPI();