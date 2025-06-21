// Authentication related types

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // DateOnly from backend
  country?: string;
  registrationDate: string; // DateOnly from backend
  lastLogin?: string; // DateTime from backend - optional since it can be null
  userRole: UserRole;
  profileImagePath?: string;
}

export interface UserProfile {
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  targetScore: number;
  currentLevel: IELTSLevel;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    testReminders: boolean;
    progressUpdates: boolean;
  };
  language: string;
  timezone: string;
}

export type UserRole = 'user' | 'admin';
export type IELTSLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';

// Auth request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country?: string;
}

export interface VerificationRequestDto {
  email: string;
  verificationCode: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface PasswordUpdateDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileImageUpdateDto {
  imagePath: string;
}

export interface UserUpdateDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country?: string;
}

export interface PwdRecoveryRequestDto {
  email: string;
}

export interface PwdRecoveryResponseDto {
  userId: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface AuthError {
  field?: string;
  message: string;
  code?: string;
}

// Auth context state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}