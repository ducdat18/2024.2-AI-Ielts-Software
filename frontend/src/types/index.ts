import type { User, UserRole } from './auth';
import type { NotificationType, ApiError } from './common';
import type { TestSkill, QuestionType, TestSession, UserAnswer, Question, Test } from './test';

// Auth types
export type {
  User,
  UserProfile,
  UserPreferences,
  UserRole,
  IELTSLevel,
  LoginRequest,
  RegisterRequest,
  CreateUserDto,
  VerificationRequestDto,
  ResetPasswordRequest,
  PasswordUpdateDto,
  ProfileImageUpdateDto,
  UserUpdateDto,
  PwdRecoveryRequestDto,
  PwdRecoveryResponseDto,
  AuthResponse,
  AuthError,
  AuthState,
  AuthContextType,
} from './auth';

// User management types
export type {
  UserDetails,
  UserSubscription,
  UserStats,
  MonthlyProgress,
  UserListItem,
  UserFilters,
  UserSortOptions,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  DeleteUserRequest,
  BulkUserOperation,
  BulkOperationResult,
  UserDto,
  UserTestDto,
  CreateUserTestDto,
  UpdateUserTestDto,
  UserResponseDto,
} from './user';

// Test types
export type {
  TestSkill,
  TestStatus,
  TestDifficulty,
  QuestionType,
  TestType,
  Test,
  TestFull,
  TestPart,
  TestPartFull,
  Section,
  SectionFull,
  Question,
  Answer,
  UserTest,
  UserResponse,
  QuestionOption,
  MultipleChoiceQuestion,
  FillInBlankQuestion,
  BlankField,
  MatchingQuestion,
  MatchingItem,
  EssayQuestion,
  WritingRubric,
  RubricCriteria,
  RubricBand,
  CreateTestDto,
  UpdateTestDto,
  CreateTestPartDto,
  UpdateTestPartDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  UpdateAnswerDto,
  CreateUserResponseDto,
  TestSession,
  UserAnswer,
  TestResult,
  TestScores,
  SectionScore,
  ScoredAnswer,
  TestFeedback,
  SkillFeedback,
  AIWritingAnalysis,
  AnalysisResult,
  AnalysisIssue,
  TestFilters,
  TestListItem,
  GetTestsRequest,
  GetTestsResponse,
  StartTestRequest,
  SubmitAnswerRequest,
  SubmitTestRequest,
} from './test';

// Progress types
export type {
  UserProgress,
  ProgressLevel,
  SkillProgress,
  WeakArea,
  Recommendation,
  RecommendationType,
  RecommendationResource,
  ProgressAnalytics,
  ProgressOverview,
  TimeSeriesPoint,
  SkillComparisonData,
  HeatmapData,
  QuestionTypeStats,
  StudyPlan,
  StudyMilestone,
  MilestoneRequirement,
  WeeklyGoal,
  LearningRoadmap,
  LearningPhase,
  LearningActivity,
  PhaseRequirement,
  ProgressComparison,
  SkillComparison,
  GetProgressRequest,
  GetProgressResponse,
  GetRecommendationsRequest,
  UpdateStudyPlanRequest,
  CompleteRecommendationRequest,
} from './progress';

// Common types
export type {
  ApiResponse,
  ApiError,
  ResponseMeta,
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  SortOptions,
  FilterOptions,
  SearchOptions,
  FileInfo,
  FileUploadOptions,
  Notification,
  NotificationType,
  ToastMessage,
  ToastAction,
  LoadingState,
  AsyncState,
  ValidationError,
  FormState,
  DateRange,
  TimeRange,
  ChartDataPoint,
  ChartOptions,
  BaseComponentProps,
  ButtonProps,
  InputProps,
  ModalProps,
  ConfirmDialogOptions,
  AppSettings,
  NotificationSettings,
  PerformanceMetrics,
  ErrorInfo,
  ErrorBoundaryState,
  AnalyticsEvent,
  UserActivity,
  DeepPartial,
  Optional,
  RequiredBy,
  Nullable,
  KeyValuePair,
} from './common';

// Constants
export {
  HTTP_STATUS,
  LOCAL_STORAGE_KEYS,
  BREAKPOINTS,
} from './common';

// Type guards and utility functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isUserRole = (role: string): role is UserRole => {
  return ['user', 'admin'].includes(role);
};

export const isTestSkill = (skill: string): skill is TestSkill => {
  return ['Reading', 'Listening', 'Writing', 'Speaking'].includes(skill);
};

export const isQuestionType = (type: string): type is QuestionType => {
  return [
    'multiple-choice',
    'fill-in-blank',
    'matching',
    'true-false-not-given',
    'short-answer',
    'essay',
    'summary-completion',
    'diagram-labeling'
  ].includes(type);
};

export const isNotificationType = (type: string): type is NotificationType => {
  return [
    'info',
    'success',
    'warning',
    'error',
    'test-completed',
    'new-recommendation',
    'achievement',
    'reminder'
  ].includes(type);
};

// Helper functions for type checking
export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
};

export const isValidTestSession = (session: any): session is TestSession => {
  return (
    session &&
    typeof session === 'object' &&
    'id' in session &&
    'testId' in session &&
    'userId' in session &&
    'status' in session
  );
};

export const isValidUserAnswer = (answer: any): answer is UserAnswer => {
  return (
    answer &&
    typeof answer === 'object' &&
    'questionId' in answer &&
    'answer' in answer &&
    'timeSpent' in answer
  );
};

// Date utility functions
export const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    short: { day: 'numeric' as const, month: 'short' as const },
    medium: { day: 'numeric' as const, month: 'short' as const, year: 'numeric' as const },
    long: { day: 'numeric' as const, month: 'long' as const, year: 'numeric' as const }
  }[format];
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
};

// Score calculation utilities
export const calculateBandScore = (percentage: number): number => {
  if (percentage >= 90) return 9.0;
  if (percentage >= 80) return 8.0;
  if (percentage >= 70) return 7.0;
  if (percentage >= 60) return 6.0;
  if (percentage >= 50) return 5.0;
  if (percentage >= 40) return 4.0;
  if (percentage >= 30) return 3.0;
  if (percentage >= 20) return 2.0;
  return 1.0;
};

export const getBandScoreDescription = (score: number): string => {
  const descriptions: Record<number, string> = {
    9: 'Expert user',
    8: 'Very good user',
    7: 'Good user',
    6: 'Competent user',
    5: 'Modest user',
    4: 'Limited user',
    3: 'Extremely limited user',
    2: 'Intermittent user',
    1: 'Non-user'
  };
  
  return descriptions[Math.floor(score)] || 'Unknown level';
};

// Backend API utility functions
export const convertBackendUser = (backendUser: any): User => {
  return {
    userId: backendUser.userId,
    email: backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    dateOfBirth: backendUser.dateOfBirth,
    country: backendUser.country,
    registrationDate: backendUser.registrationDate,
    lastLogin: backendUser.lastLogin,
    userRole: backendUser.userRole,
    profileImagePath: backendUser.profileImagePath,
  };
};

export const convertBackendTest = (backendTest: any): Test => {
  return {
    testId: backendTest.testId,
    testName: backendTest.testName,
    testTypeId: backendTest.testTypeId,
    isActive: backendTest.isActive,
    creationDate: backendTest.creationDate,
    lastUpdatedDate: backendTest.lastUpdatedDate,
    audioPath: backendTest.audioPath,
    testType: backendTest.testType,
    testParts: backendTest.testParts,
  };
};

export const convertBackendQuestion = (backendQuestion: any): Question => {
  return {
    questionId: backendQuestion.questionId,
    sectionId: backendQuestion.sectionId,
    questionNumber: backendQuestion.questionNumber,
    content: backendQuestion.content,
    marks: backendQuestion.marks,
    answer: backendQuestion.answer,
  };
};

// Test skill mapping
export const mapTestSkillToLowercase = (skill: TestSkill): string => {
  return skill.toLowerCase();
};

export const mapTestSkillFromLowercase = (skill: string): TestSkill => {
  const skillMap: Record<string, TestSkill> = {
    'reading': 'Reading',
    'listening': 'Listening',
    'writing': 'Writing',
    'speaking': 'Speaking',
  };
  return skillMap[skill] || 'Reading';
};