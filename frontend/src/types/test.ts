export type TestSkill = 'Reading' | 'Listening' | 'Writing' | 'Speaking';
export type TestStatus = 'draft' | 'published' | 'archived';
export type TestDifficulty = 'easy' | 'medium' | 'hard';

// Test Types (from backend)
export interface TestType {
  testTypeId: string;
  name: TestSkill;
  description?: string;
  timeLimit: number; // in minutes
  totalMarks: number;
  instructions?: string;
}

// Test interface (from backend)
export interface Test {
  testId: string;
  testName: string;
  testTypeId: string;
  isActive: boolean;
  creationDate: string;
  lastUpdatedDate: string;
  audioPath?: string; // for listening tests
  testType?: TestType;
  testParts?: TestPart[];
}

// Full test with all nested data
export interface TestFull {
  testId: string;
  testName: string;
  testTypeId: string;
  testTypeName: string;
  isActive: boolean;
  creationDate: string;
  lastUpdatedDate: string;
  audioPath?: string;
  testParts: TestPartFull[];
}

// Test Part interface (from backend)
export interface TestPart {
  partId: string;
  testId: string;
  partNumber: number;
  title?: string;
  description?: string;
  content: string;
  imgPath?: string;
  sections?: Section[];
}

// Full test part with nested data
export interface TestPartFull {
  partId: string;
  partNumber: number;
  title?: string;
  description?: string;
  content: string;
  imgPath?: string;
  sections: SectionFull[];
}

// Section interface (from backend)
export interface Section {
  sectionId: string;
  partId: string;
  sectionNumber: number;
  instructions?: string;
  questionType?: string;
  content?: string;
  imagePath?: string;
  questions?: Question[];
}

// Full section with nested data
export interface SectionFull {
  sectionId: string;
  sectionNumber: number;
  instructions?: string;
  questionType?: string;
  imagePath?: string;
  questions: Question[];
}

// Question interface (from backend)
export interface Question {
  questionId: string;
  sectionId: string;
  questionNumber: number;
  content: any; // JSONB content
  marks: number;
  answer?: Answer;
}

// Answer interface (from backend)
export interface Answer {
  answerId?: string;
  questionId: string;
  correctAnswer: string;
  explanation?: string;
  alternativeAnswers?: string;
}

// User Test interface (from backend)
export interface UserTest {
  userTestId: string;
  userId: string;
  testId: string;
  startTime: string;
  endTime?: string;
  status: 'in progress' | 'abandoned' | 'completed';
  numCorrectAnswer: number;
  feedback?: string;
  user?: any;
  test?: Test;
  userResponses?: UserResponse[];
}

// User Response interface (from backend)
export interface UserResponse {
  responseId: string;
  userTestId: string;
  questionId: string;
  userAnswer: string;
  marksAwarded: number;
  question?: Question;
}

// Question types for frontend compatibility
export type QuestionType = 
  | 'multiple-choice' 
  | 'fill-in-blank' 
  | 'matching' 
  | 'true-false-not-given'
  | 'short-answer'
  | 'essay'
  | 'summary-completion'
  | 'diagram-labeling';

// Legacy interfaces for frontend compatibility
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface MultipleChoiceQuestion extends Question {
  type: 'multiple-choice';
  options: QuestionOption[];
  allowMultiple: boolean;
}

export interface FillInBlankQuestion extends Question {
  type: 'fill-in-blank';
  blanks: BlankField[];
}

export interface BlankField {
  id: string;
  position: number;
  acceptedAnswers: string[];
  caseSensitive: boolean;
}

export interface MatchingQuestion extends Question {
  type: 'matching';
  leftColumn: MatchingItem[];
  rightColumn: MatchingItem[];
}

export interface MatchingItem {
  id: string;
  text: string;
  matchWith?: string;
}

export interface EssayQuestion extends Question {
  type: 'essay';
  minWords: number;
  maxWords: number;
  prompt: string;
  rubric: WritingRubric;
}

// Writing assessment rubric
export interface WritingRubric {
  taskAchievement: RubricCriteria;
  coherenceCohesion: RubricCriteria;
  lexicalResource: RubricCriteria;
  grammaticalAccuracy: RubricCriteria;
}

export interface RubricCriteria {
  weight: number; // percentage weight in final score
  bands: RubricBand[];
}

export interface RubricBand {
  score: number;
  description: string;
  keywords: string[];
}

// DTOs for API calls
export interface CreateTestDto {
  testName: string;
  testTypeId: string;
  audioPath?: string;
}

export interface UpdateTestDto {
  testName: string;
  isActive: boolean;
  audioPath?: string;
}

export interface CreateTestPartDto {
  testId: string;
  partNumber: number;
  title?: string;
  description?: string;
  content: string;
  imgPath?: string;
}

export interface UpdateTestPartDto {
  partNumber: number;
  title?: string;
  description?: string;
  content: string;
  imgPath?: string;
}

export interface CreateSectionDto {
  partId: string;
  sectionNumber: number;
  instructions?: string;
  questionType?: string;
  content?: string;
  imagePath?: string;
}

export interface UpdateSectionDto {
  sectionNumber: number;
  instructions?: string;
  questionType?: string;
  imagePath?: string;
  content?: string;
}

export interface CreateQuestionDto {
  sectionId: string;
  questionNumber: number;
  content: any; // JSONB content
  marks: number;
  correctAnswer: string;
  explanation?: string;
  alternativeAnswers?: string;
}

export interface UpdateQuestionDto {
  questionId: string;
  questionNumber: number;
  content: any; // JSONB content
}

export interface UpdateAnswerDto {
  answerId: string;
  updatedCorrectAnswer: string;
  updatedExplanation?: string;
  updatedAlternativeAnswers?: string;
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

export interface CreateUserResponseDto {
  userTestId: string;
  questionId: string;
  userAnswer: string;
  marksRewarded: number;
}

// Test session and progress for frontend compatibility
export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'abandoned';
  currentSection: number;
  currentQuestion: number;
  timeRemaining: number;
  answers: UserAnswer[];
  autoSaved: boolean;
}

export interface UserAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  isMarked: boolean;
  confidence?: number; // 1-5 scale
}

// Test result for frontend compatibility
export interface TestResult {
  id: string;
  sessionId: string;
  testId: string;
  userId: string;
  completedAt: Date;
  scores: TestScores;
  answers: ScoredAnswer[];
  feedback: TestFeedback;
  timeSpent: number;
  bandScore: number;
}

export interface TestScores {
  total: number;
  percentage: number;
  bandScore: number;
  sectionScores: SectionScore[];
}

export interface SectionScore {
  sectionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface ScoredAnswer extends UserAnswer {
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  feedback?: string;
}

// Test feedback
export interface TestFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  skillBreakdown: SkillFeedback[];
}

export interface SkillFeedback {
  skill: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

// AI Writing analysis (from technical spec)
export interface AIWritingAnalysis {
  grammaticalAccuracy: AnalysisResult;
  vocabularyUsage: AnalysisResult;
  taskAchievement: AnalysisResult;
  coherenceCohesion: AnalysisResult;
  overallScore: number;
  bandScore: number;
  feedback: string;
  suggestions: string[];
}

export interface AnalysisResult {
  score: number;
  percentage: number;
  details: string;
  issues: AnalysisIssue[];
}

export interface AnalysisIssue {
  type: string;
  description: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
  position?: {
    start: number;
    end: number;
  };
}

// Test management for admin
export interface TestFilters {
  skill?: TestSkill;
  difficulty?: TestDifficulty;
  status?: TestStatus;
  createdBy?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface TestListItem {
  id: string;
  title: string;
  skill: TestSkill;
  difficulty: TestDifficulty;
  duration: number;
  totalQuestions: number;
  status: TestStatus;
  createdAt: Date;
  createdBy: string;
  attemptCount: number;
  averageScore: number;
}

// API request/response types
export interface GetTestsRequest {
  page?: number;
  limit?: number;
  filters?: TestFilters;
  search?: string;
}

export interface GetTestsResponse {
  tests: TestListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StartTestRequest {
  testId: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  isMarked?: boolean;
}

export interface SubmitTestRequest {
  sessionId: string;
  answers: UserAnswer[];
}