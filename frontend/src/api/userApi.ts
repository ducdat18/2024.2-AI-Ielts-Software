import type { User, UserListItem, UserUpdateDto, PasswordUpdateDto, ProfileImageUpdateDto } from "@/types";
import  { apiClient } from "./cilentApi";
import  { API_ENDPOINTS } from "./configApi";


export class UserAPI {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    return apiClient.get(API_ENDPOINTS.USER.BY_ID(userId));
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(params: { page?: number; limit?: number } = {}): Promise<UserListItem[]> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('pageNumber', params.page.toString());
    if (params.limit) queryParams.append('pageSize', params.limit.toString());
    
    const url = `${API_ENDPOINTS.USER.BASE}?${queryParams.toString()}`;
    return apiClient.get(url);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, userData: UserUpdateDto): Promise<User> {
    return apiClient.put(`${API_ENDPOINTS.USER.BASE}/${userId}`, userData);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<User> {
    return apiClient.delete(API_ENDPOINTS.USER.BY_ID(userId));
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, passwordData: PasswordUpdateDto): Promise<{ message: string }> {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE_PASSWORD(userId), passwordData);
  }

  /**
   * Update profile image
   */
  async updateProfileImage(userId: string, imageData: ProfileImageUpdateDto): Promise<{ message: string }> {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE_IMAGE(userId), imageData);
  }
}

export const userAPI = new UserAPI();