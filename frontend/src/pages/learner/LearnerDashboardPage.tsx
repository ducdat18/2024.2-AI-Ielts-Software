import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
import type { UserTest, TestType } from '@/types';
import { LoadingSpinner } from '@/components/auth';

interface DashboardStats {
  testsCompleted: number;
  averageScore: number;
  recentTests: UserTest[];
}

const LearnerDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    testsCompleted: 0,
    averageScore: 0,
    recentTests: [],
  });

  // API calls for dashboard data
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

  // Calculate dashboard statistics
  useEffect(() => {
    if (userTests && Array.isArray(userTests) && userTests.length > 0) {
      const completedTests = userTests.filter(
        (test) => test.status === 'completed'
      );
      const totalScore = completedTests.reduce(
        (sum, test) => sum + (test.numCorrectAnswer || 0),
        0
      );
      const avgScore =
        completedTests.length > 0
          ? (totalScore / completedTests.length) * 0.25
          : 0; // Assuming max 40 questions, scale to 10

      setStats({
        testsCompleted: completedTests.length,
        averageScore: Math.round(avgScore * 10) / 10,
        recentTests: completedTests
          .sort((a, b) => {
            const aTime = new Date(b.endTime || b.startTime).getTime();
            const bTime = new Date(a.endTime || a.startTime).getTime();
            return aTime - bTime;
          })
          .slice(0, 3),
      });
    } else {
      setStats({
        testsCompleted: 0,
        averageScore: 0,
        recentTests: [],
      });
    }
  }, [userTests]);

  // Fetch data when user is available
  useEffect(() => {
    // ✅ Better validation
    if (!user?.userId || !isAuthenticated) {
      console.log('User not ready:', { userId: user?.userId, isAuthenticated });
      return;
    }

    console.log('Fetching data for user:', user.userId);

    // ✅ FIXED: Correct function signature with error handling
    fetchUserTests(user.userId, { page: 1, limit: 50 })
      .then(() => console.log('User tests loaded successfully'))
      .catch((error) => {
        console.error('Failed to fetch user tests:', error);
      });

    fetchTestTypes()
      .then(() => console.log('Test types loaded successfully'))
      .catch((error) => {
        console.error('Failed to fetch test types:', error);
      });
  }, [user?.userId, isAuthenticated]); // ✅ Removed function dependencies to prevent infinite loop

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

  // Helper function to get test type name
  const getTestTypeName = (testTypeId: string): string => {
    if (!testTypes || !Array.isArray(testTypes) || testTypes.length === 0)
      return 'Test';
    const testType = testTypes.find(
      (tt: TestType) => tt.testTypeId === testTypeId
    );
    return testType?.name || 'Test';
  };

  // Helper function to calculate band score from percentage
  const calculateBandScore = (
    correctAnswers: number = 0,
    totalQuestions: number = 40
  ): number => {
    if (!correctAnswers || correctAnswers === 0) return 0;
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

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-white text-lg">Loading dashboard...</div>
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
            Please log in to access your dashboard
          </h1>
          <Link to="/auth/login">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </Link>
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
        {/* Welcome Section */}
        <div className="dashboard-card mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-100">
            Welcome back,{' '}
            <span className="text-blue-400">
              {user.firstName || 'Learner'}!
            </span>
          </h1>
          <p className="text-gray-500 text-lg">
            Continue your IELTS preparation journey. You're doing great!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">
                Tests Completed
              </CardTitle>
              <CardDescription className="text-gray-500">
                Practice sessions finished
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-blue-400">
                  {stats.testsCompleted}
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
                Your overall performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-green-400">
                  {stats.averageScore > 0 ? `${stats.averageScore}/9` : 'N/A'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">
                Member Since
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {user.registrationDate
                  ? new Date(user.registrationDate).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        year: 'numeric',
                      }
                    )
                  : 'Recently'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Test */}
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">
                Quick Practice
              </CardTitle>
              <CardDescription className="text-gray-500">
                Start a practice test to improve your skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testTypesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : testTypes &&
                Array.isArray(testTypes) &&
                testTypes.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {testTypes.map((testType: TestType) => {
                    const colors = {
                      Listening: 'bg-blue-600/90 hover:bg-blue-600',
                      Reading: 'bg-green-600/90 hover:bg-green-600',
                      Writing: 'bg-purple-600/90 hover:bg-purple-600',
                      Speaking: 'bg-yellow-600/90 hover:bg-yellow-600',
                    };
                    const icons = {
                      Listening: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343a9 9 0 000 12.728m2.829-9.9a5 5 0 000 7.072M9 12h6"
                        />
                      ),
                      Reading: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      ),
                      Writing: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      ),
                      Speaking: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      ),
                    };

                    return (
                      <Link
                        key={testType.testTypeId}
                        to={`/tests?type=${testType.name.toLowerCase()}`}
                      >
                        <Button
                          className={`w-full text-gray-100 justify-start ${
                            colors[testType.name as keyof typeof colors] ||
                            'bg-gray-600/90 hover:bg-gray-600'
                          }`}
                        >
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {icons[testType.name as keyof typeof icons]}
                          </svg>
                          {testType.name} Practice
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No test types available</p>
                  <p className="text-sm">
                    Please contact administrator to add test types.
                  </p>
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
                Your latest practice sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : stats.recentTests && stats.recentTests.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentTests.map((test, index) => {
                    const bandScore = calculateBandScore(
                      test.numCorrectAnswer || 0
                    );
                    const testName = getTestTypeName(test.testId); // This might need the actual test data
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
                        className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg"
                      >
                        <div>
                          <p className="text-gray-200 font-medium">
                            {testName} Practice
                          </p>
                          <p className="text-gray-500 text-sm">
                            Score: {bandScore} •{' '}
                            {timeAgo > 0
                              ? `${timeAgo} day${timeAgo !== 1 ? 's' : ''} ago`
                              : 'Today'}
                          </p>
                        </div>
                        <div className="text-green-400 font-semibold">
                          {test.status === 'completed'
                            ? 'Completed'
                            : 'In Progress'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No recent activity</p>
                  <Link to="/tests">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Take Your First Test
                    </Button>
                  </Link>
                </div>
              )}

              {stats.recentTests.length > 0 && (
                <Link to="/learner/progress">
                  <Button
                    variant="outline"
                    className="w-full border-blue-500/80 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                  >
                    View All Progress
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links */}
        <div className="dashboard-card mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/learner/tests">
              <Button
                variant="outline"
                className="w-full h-20 flex-col border-gray-700 text-gray-400 hover:border-blue-500/80 hover:text-blue-400 hover:bg-gray-800/50"
              >
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                All Tests
              </Button>
            </Link>

            <Link to="/learner/progress">
              <Button
                variant="outline"
                className="w-full h-20 flex-col border-gray-700 text-gray-400 hover:border-green-500/80 hover:text-green-400 hover:bg-gray-800/50"
              >
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Progress
              </Button>
            </Link>

            <Link to="/learner/profile">
              <Button
                variant="outline"
                className="w-full h-20 flex-col border-gray-700 text-gray-400 hover:border-purple-500/80 hover:text-purple-400 hover:bg-gray-800/50"
              >
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </Button>
            </Link>

            <Link to="/tests">
              <Button
                variant="outline"
                className="w-full h-20 flex-col border-gray-700 text-gray-400 hover:border-yellow-500/80 hover:text-yellow-400 hover:bg-gray-800/50"
              >
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Quick Test
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;
