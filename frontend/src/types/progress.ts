import type { TestSkill, TestDifficulty } from "./test";


// User progress overview
export interface UserProgress {
  userId: string;
  currentLevel: ProgressLevel;
  targetScore: number;
  currentScore: number;
  improvement: number; // percentage improvement
  testsCompleted: number;
  totalStudyTime: number; // in minutes
  streakDays: number;
  lastActivity: Date;
  skillProgress: SkillProgress[];
  weakAreas: WeakArea[];
  recommendations: Recommendation[];
}

export type ProgressLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';

// Skill-specific progress
export interface SkillProgress {
  skill: TestSkill;
  currentScore: number;
  averageScore: number;
  bestScore: number;
  improvement: number;
  testsCompleted: number;
  timeSpent: number;
  lastAttempt: Date;
  trend: 'improving' | 'stable' | 'declining';
  weakPoints: string[];
  strengths: string[];
}

// Weak areas identification
export interface WeakArea {
  skill: TestSkill;
  area: string;
  severity: 'low' | 'medium' | 'high';
  frequency: number; // how often this appears as an issue
  description: string;
  suggestions: string[];
  relatedTopics: string[];
}

// Personalized recommendations
export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  skill?: TestSkill;
  estimatedTime: number; // minutes to complete
  difficulty: TestDifficulty;
  resources: RecommendationResource[];
  completedAt?: Date;
  feedback?: string;
}

export type RecommendationType = 
  | 'practice-test' 
  | 'skill-exercise' 
  | 'grammar-review' 
  | 'vocabulary-building' 
  | 'writing-practice'
  | 'reading-comprehension'
  | 'listening-practice';

export interface RecommendationResource {
  type: 'test' | 'exercise' | 'article' | 'video' | 'audio';
  title: string;
  url?: string;
  duration?: number;
  description: string;
}

// Progress analytics for charts and graphs
export interface ProgressAnalytics {
  overview: ProgressOverview;
  timeSeriesData: TimeSeriesPoint[];
  skillComparison: SkillComparisonData[];
  performanceHeatmap: HeatmapData[];
  questionTypeAnalysis: QuestionTypeStats[];
}

export interface ProgressOverview {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  averageTestTime: number;
  improvementRate: number;
  completionRate: number;
}

export interface TimeSeriesPoint {
  date: Date;
  score: number;
  skill: TestSkill;
  testId?: string;
  duration: number;
}

export interface SkillComparisonData {
  skill: TestSkill;
  currentScore: number;
  averageScore: number;
  testCount: number;
  trend: number; // positive for improving, negative for declining
}

export interface HeatmapData {
  date: Date;
  activity: number; // number of tests taken or study time
  score?: number;
}

export interface QuestionTypeStats {
  questionType: string;
  accuracy: number;
  averageTime: number;
  attempts: number;
  improvement: number;
}

// Study plan and goals
export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetScore: number;
  targetDate: Date;
  currentProgress: number; // percentage completion
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  milestones: StudyMilestone[];
  weeklyGoals: WeeklyGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  score?: number;
  requirements: MilestoneRequirement[];
}

export interface MilestoneRequirement {
  type: 'test-score' | 'tests-completed' | 'study-time' | 'skill-level';
  target: number;
  current: number;
  skill?: TestSkill;
}

export interface WeeklyGoal {
  weekStart: Date;
  testsToComplete: number;
  studyTimeTarget: number; // in minutes
  skillFocus: TestSkill[];
  completed: boolean;
  actualTests: number;
  actualStudyTime: number;
}

// Learning roadmap
export interface LearningRoadmap {
  userId: string;
  currentLevel: ProgressLevel;
  targetLevel: ProgressLevel;
  estimatedDuration: number; // weeks to reach target
  phases: LearningPhase[];
  generatedAt: Date;
  lastUpdated: Date;
}

export interface LearningPhase {
  id: string;
  title: string;
  description: string;
  duration: number; // weeks
  skills: TestSkill[];
  activities: LearningActivity[];
  requirements: PhaseRequirement[];
  isCompleted: boolean;
}

export interface LearningActivity {
  type: RecommendationType;
  title: string;
  description: string;
  estimatedTime: number;
  difficulty: TestDifficulty;
  isOptional: boolean;
  isCompleted: boolean;
  resources: RecommendationResource[];
}

export interface PhaseRequirement {
  description: string;
  target: number;
  current: number;
  unit: 'score' | 'tests' | 'hours';
  skill?: TestSkill;
}

// Progress comparison and statistics
export interface ProgressComparison {
  userScore: number;
  averageScore: number;
  percentile: number;
  rank: number;
  totalUsers: number;
  skillComparison: SkillComparison[];
}

export interface SkillComparison {
  skill: TestSkill;
  userScore: number;
  averageScore: number;
  percentile: number;
  rank: number;
}

// API request/response types
export interface GetProgressRequest {
  userId: string;
  timeframe?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  skills?: TestSkill[];
}

export interface GetProgressResponse {
  progress: UserProgress;
  analytics: ProgressAnalytics;
  comparison: ProgressComparison;
}

export interface GetRecommendationsRequest {
  userId: string;
  limit?: number;
  types?: RecommendationType[];
  skills?: TestSkill[];
}

export interface UpdateStudyPlanRequest {
  planId: string;
  updates: Partial<Omit<StudyPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

export interface CompleteRecommendationRequest {
  recommendationId: string;
  feedback?: string;
  rating?: number; // 1-5 scale
}