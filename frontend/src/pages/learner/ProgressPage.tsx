import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { gsap } from 'gsap';
import { useAuth } from '@/hooks/useAuthApi';
import { useAPI } from '@/hooks/useApi';
import api from '@/api/indexApi';
import type { UserTest } from '@/types';
import { LoadingSpinner } from '@/components/auth';

interface ProgressStats {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  skillBreakdown: {
    [key: string]: {
      tests: number;
      averageScore: number;
      bestScore: number;
    };
  };
  recentActivity: UserTest[];
  monthlyProgress: {
    month: string;
    testsCompleted: number;
    averageScore: number;
  }[];
}

const ProgressPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('month');
  const [stats, setStats] = useState<ProgressStats>({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
    skillBreakdown: {},
    recentActivity: [],
    monthlyProgress: [],
  });

  // API calls
  const {
    data: userTests,
    isLoading: testsLoading,
    execute: fetchUserTests,
  } = useAPI(api.userTest.getUserTestsByUserId.bind(api.userTest));

  const {
    data: testTypes,
    isLoading: testTypesLoading,
    execute: fetchTestTypes,
  } = useAPI(api.testType.getTestTypes.bind(api.testType));

  const { data: tests, execute: fetchAllTests } = useAPI(
    api.test.getTests.bind(api.test)
  );

  // Calculate progress statistics
  useEffect(() => {
    if (userTests && Array.isArray(userTests) && testTypes && tests) {
      calculateProgressStats();
    }
  }, [userTests, testTypes, tests, selectedPeriod]);

  const calculateProgressStats = () => {
    if (!userTests || !Array.isArray(userTests)) {
      return;
    }

    const completedTests = userTests.filter(
      (test) => test.status === 'completed'
    );
    const totalScore = completedTests.reduce(
      (sum, test) => sum + (test.numCorrectAnswer || 0),
      0
    );
    const avgScore =
      completedTests.length > 0 ? totalScore / completedTests.length : 0;
    const bestScore = Math.max(
      ...completedTests.map((test) => test.numCorrectAnswer || 0),
      0
    );

    // Calculate skill breakdown
    const skillBreakdown: ProgressStats['skillBreakdown'] = {};

    if (tests && Array.isArray(tests)) {
      completedTests.forEach((userTest) => {
        const test = tests.find((t) => t.testId === userTest.testId);
        const testType = testTypes?.find(
          (tt) => tt.testTypeId === test?.testTypeId
        );
        const skillName = testType?.name || 'Unknown';

        if (!skillBreakdown[skillName]) {
          skillBreakdown[skillName] = {
            tests: 0,
            averageScore: 0,
            bestScore: 0,
          };
        }

        skillBreakdown[skillName].tests += 1;
        skillBreakdown[skillName].averageScore +=
          userTest.numCorrectAnswer || 0;
        skillBreakdown[skillName].bestScore = Math.max(
          skillBreakdown[skillName].bestScore,
          userTest.numCorrectAnswer || 0
        );
      });

      // Calculate averages
      Object.keys(skillBreakdown).forEach((skill) => {
        if (skillBreakdown[skill].tests > 0) {
          skillBreakdown[skill].averageScore =
            skillBreakdown[skill].averageScore / skillBreakdown[skill].tests;
        }
      });
    }

    // Calculate monthly progress
    const monthlyData: {
      [key: string]: { tests: number; totalScore: number };
    } = {};
    completedTests.forEach((test) => {
      const date = new Date(test.endTime || test.startTime);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { tests: 0, totalScore: 0 };
      }

      monthlyData[monthKey].tests += 1;
      monthlyData[monthKey].totalScore += test.numCorrectAnswer || 0;
    });

    const monthlyProgress = Object.entries(monthlyData)
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month));
        return {
          month: date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          testsCompleted: data.tests,
          averageScore: data.tests > 0 ? data.totalScore / data.tests : 0,
        };
      })
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months

    setStats({
      totalTests: userTests.length,
      completedTests: completedTests.length,
      averageScore: Math.round(avgScore * 10) / 10,
      bestScore,
      currentStreak: calculateCurrentStreak(completedTests),
      skillBreakdown,
      recentActivity: completedTests.slice(-5).reverse(),
      monthlyProgress,
    });
  };

  const calculateCurrentStreak = (completedTests: UserTest[]): number => {
    if (completedTests.length === 0) return 0;

    // Sort by date descending
    const sortedTests = completedTests.sort(
      (a, b) =>
        new Date(b.endTime || b.startTime).getTime() -
        new Date(a.endTime || a.startTime).getTime()
    );

    let streak = 0;
    let currentDate = new Date();

    for (const test of sortedTests) {
      const testDate = new Date(test.endTime || test.startTime);
      const daysDiff = Math.floor(
        (currentDate.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        streak++;
        currentDate = testDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateBandScore = (
    correctAnswers: number,
    totalQuestions: number = 40
  ): number => {
    const percentage = (correctAnswers / totalQuestions) * 100;
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

  const getTestTypeName = (testId: string): string => {
    if (!tests || !testTypes) return 'Test';
    const test = tests.find((t) => t.testId === testId);
    const testType = testTypes.find((tt) => tt.testTypeId === test?.testTypeId);
    return testType?.name || 'Test';
  };

  const getSkillColor = (skill: string): string => {
    const colors: { [key: string]: string } = {
      Listening: 'text-blue-400 bg-blue-400/20',
      Reading: 'text-green-400 bg-green-400/20',
      Writing: 'text-purple-400 bg-purple-400/20',
      Speaking: 'text-yellow-400 bg-yellow-400/20',
    };
    return colors[skill] || 'text-gray-400 bg-gray-400/20';
  };

  // Fetch data when user is available
  useEffect(() => {
    if (!user?.userId || !isAuthenticated) {
      return;
    }

    fetchUserTests(user.userId, { page: 1, limit: 100 }).catch((error) =>
      console.error('Failed to fetch user tests:', error)
    );

    fetchTestTypes().catch((error) =>
      console.error('Failed to fetch test types:', error)
    );

    fetchAllTests({ page: 1, limit: 100 }).catch((error) =>
      console.error('Failed to fetch tests:', error)
    );
  }, [user?.userId, isAuthenticated]);

  // GSAP animations
  useEffect(() => {
    if (containerRef.current && !authLoading && !testsLoading) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.dashboard-card'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [authLoading, testsLoading]);

  // Navigation functions
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-white text-lg">Loading progress...</div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please log in to view your progress
          </h1>
          <Button
            onClick={() => navigateTo('/auth/login')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-gray-200 pt-20"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="dashboard-card mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-gray-100">
                Your <span className="text-blue-400">Progress</span>
              </h1>
              <p className="text-gray-500 text-lg">
                Track your IELTS preparation journey and identify areas for
                improvement
              </p>
            </div>

            {/* Period Selector */}
            <div className="mt-4 md:mt-0">
              <div className="flex bg-gray-800/50 rounded-lg p-1">
                {(['week', 'month', 'year'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">
                Total Tests
              </CardTitle>
              <CardDescription className="text-gray-500">
                All attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="text-3xl font-bold text-blue-400">
                  {stats.totalTests}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">Completed</CardTitle>
              <CardDescription className="text-gray-500">
                Finished tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="text-3xl font-bold text-green-400">
                  {stats.completedTests}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">
                Average Score
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="text-3xl font-bold text-purple-400">
                  {stats.averageScore > 0 ? `${stats.averageScore}/40` : 'N/A'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">
                Current Streak
              </CardTitle>
              <CardDescription className="text-gray-500">
                Consecutive days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="text-3xl font-bold text-yellow-400">
                  {stats.currentStreak}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills Breakdown */}
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">
                Skills Performance
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your performance by skill type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading || testTypesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : Object.keys(stats.skillBreakdown).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.skillBreakdown).map(([skill, data]) => {
                    const bandScore = calculateBandScore(data.averageScore);
                    const bestBandScore = calculateBandScore(data.bestScore);

                    return (
                      <div
                        key={skill}
                        className="p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillColor(
                                skill
                              )}`}
                            >
                              {skill}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {data.tests} tests
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-200">
                              Band {bandScore}
                            </div>
                            <div className="text-sm text-gray-400">
                              Best: {bestBandScore}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(bandScore / 9) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No skill data available</p>
                  <Button
                    onClick={() => navigateTo('/tests')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Take a Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your latest test attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((test, index) => {
                    const testName = getTestTypeName(test.testId);
                    const bandScore = calculateBandScore(
                      test.numCorrectAnswer || 0
                    );
                    const endTime = test.endTime || test.startTime;
                    const timeAgo = endTime
                      ? Math.ceil(
                          (Date.now() - new Date(endTime).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0;

                    return (
                      <div
                        key={test.userTestId || index}
                        className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg hover:bg-gray-800/90 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              getSkillColor(testName).includes('blue')
                                ? 'bg-blue-600'
                                : getSkillColor(testName).includes('green')
                                ? 'bg-green-600'
                                : getSkillColor(testName).includes('purple')
                                ? 'bg-purple-600'
                                : 'bg-yellow-600'
                            }`}
                          >
                            {testName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-gray-200 font-medium">
                              {testName} Practice
                            </p>
                            <p className="text-gray-500 text-sm">
                              Band {bandScore} • {test.numCorrectAnswer || 0}/40
                              correct
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">
                            {timeAgo > 0
                              ? `${timeAgo} day${timeAgo !== 1 ? 's' : ''} ago`
                              : 'Today'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No recent activity</p>
                  <Button
                    onClick={() => navigateTo('/tests')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Practicing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress Chart */}
        {stats.monthlyProgress.length > 0 && (
          <Card className="dashboard-card bg-gray-900/80 border-gray-800 mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">
                Monthly Progress
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your test completion and performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.monthlyProgress.map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <div className="text-lg font-semibold text-gray-200">
                        {month.month}
                      </div>
                      <div className="text-sm text-gray-400">
                        {month.testsCompleted} test
                        {month.testsCompleted !== 1 ? 's' : ''} completed
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-400">
                        {month.averageScore > 0
                          ? `${Math.round(month.averageScore * 10) / 10}/40`
                          : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">Average score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="dashboard-card mt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigateTo('/tests')}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
            >
              Take a Practice Test
            </Button>
            <Button
              onClick={() => navigateTo('/learner/dashboard')}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/20 px-8 py-6 text-lg"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
