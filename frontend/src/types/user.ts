import type { User, UserRole, IELTSLevel } from "./auth";

export interface UserDetails extends User {
  lastLogin?: string; // Changed to string to match User interface
  isActive: boolean;
  testsTaken: number;
  averageScore: number;
  registrationDate: string; // Changed to string to match User interface
  subscription?: UserSubscription;
}

export interface UserSubscription {
  plan: 'free' | 'premium' | 'pro';
  startDate: string; // Changed to string for consistency
  endDate?: string; // Changed to string for consistency
  isActive: boolean;
  features: string[];
}

// User statistics
export interface UserStats {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  bestScore: number;
  totalStudyTime: number; // in minutes
  streakDays: number;
  skillBreakdown: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
  monthlyProgress: MonthlyProgress[];
}

export interface MonthlyProgress {
  month: string;
  testsCompleted: number;
  averageScore: number;
  studyTime: number;
}

// User list for admin
export interface UserListItem {
  dateOfBirth: null;
  userId: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  userRole: UserRole;
  currentLevel: IELTSLevel;
  lastLogin?: string; // Changed to string for consistency
  isActive: boolean;
  testsTaken: number;
  averageScore: number;
  registrationDate: string; // Changed to string for consistency
  country?: string;
  profileImagePath?: string;
}

// User filters and sorting
export interface UserFilters {
  userRole?: UserRole;
  level?: IELTSLevel;
  isActive?: boolean;
  registeredAfter?: string; // Changed to string for consistency
  registeredBefore?: string; // Changed to string for consistency
  minTests?: number;
  minScore?: number;
  country?: string;
  search?: string;
}

export interface UserSortOptions {
  field: 'email' | 'fullName' | 'registrationDate' | 'lastLogin' | 'testsTaken' | 'averageScore' | 'firstName' | 'lastName';
  direction: 'asc' | 'desc';
}

// API request/response types
export interface GetUsersRequest {
  page?: number;
  limit?: number;
  filters?: UserFilters;
  sort?: UserSortOptions;
  search?: string;
}

export interface GetUsersResponse {
  users: UserListItem[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UpdateUserRequest {
  userId: string;
  updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    userRole?: UserRole;
    isActive?: boolean;
    targetScore?: number;
    currentLevel?: IELTSLevel;
    country?: string;
    profileImagePath?: string;
  };
}

export interface DeleteUserRequest {
  userId: string;
  transferDataTo?: string; // Optional: transfer user data to another user
}

// User DTOs matching backend
export interface UserDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country?: string;
  registrationDate: string;
  lastLogin: string;
  userRole: UserRole;
  profileImagePath?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country?: string;
}

export interface UserUpdateDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country?: string;
}

export interface PasswordUpdateDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileImageUpdateDto {
  imagePath: string;
}

export interface VerificationRequestDto {
  email: string;
  verificationCode: string;
}

export interface PwdRecoveryRequestDto {
  email: string;
}

export interface PwdRecoveryResponseDto {
  userId: string;
  email: string;
}

// Bulk operations
export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'changeRole';
  params?: {
    newRole?: UserRole;
    transferDataTo?: string;
  };
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

// User test relationship types
export interface UserTestDto {
  userTestId: string;
  userId: string;
  testId: string;
  startTime: string;
  endTime?: string;
  status: 'in progress' | 'abandoned' | 'completed';
  numCorrectAnswer: number;
  feedback?: string;
  userName: string;
  testName: string;
}

export interface CreateUserTestDto {
  userId: string;
  testId: string;
  startTime: string;
  endTime: string;
  status: string;
  numCorrectAnswer: number;
  feedback: string;
}

export interface UpdateUserTestDto {
  status?: string;
  feedback?: string;
}

// User response types
export interface UserResponseDto {
  responseId: string;
  userTestId: string;
  questionId: string;
  userAnswer: string;
  marksRewarded: number;
  question: any; // Question object
}

export interface CreateUserResponseDto {
  userTestId: string;
  questionId: string;
  userAnswer: string;
  marksRewarded: number;
}