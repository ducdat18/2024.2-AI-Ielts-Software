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
import { useAuth } from '../../hooks/useAuthApi';
import api from '@/api/indexApi';

interface DashboardStats {
  totalUsers: number;
  activeTests: number;
  testAttempts: number;
  averageScore: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'test_completed';
  description: string;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { userName } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch data from multiple endpoints
        const [usersResponse, testsResponse, userTestsResponse] =
          await Promise.all([
            api.user.getUsers({ page: 1, limit: 1000 }), // Get all users for count
            api.test.getTests({ page: 1, limit: 1000 }), // Get all tests for count
            api.userTest.getUserTests({ page: 1, limit: 1000 }), // Get all user tests for statistics
          ]);

        // Calculate statistics
        const totalUsers = usersResponse.length;
        const activeTests = testsResponse.filter(
          (test) => test.isActive
        ).length;
        const testAttempts = userTestsResponse.length;

        // Calculate average score from completed tests
        const completedTests = userTestsResponse.filter(
          (ut) => ut.status === 'completed'
        );
        const averageScore =
          completedTests.length > 0
            ? completedTests.reduce((sum, ut) => sum + ut.numCorrectAnswer, 0) /
              completedTests.length
            : 0;

        setStats({
          totalUsers,
          activeTests,
          testAttempts,
          averageScore,
        });

        // Generate recent activities from user tests
        const recentActivities: RecentActivity[] = userTestsResponse
          .filter((ut) => ut.status === 'completed')
          .slice(0, 5)
          .map((ut, index) => ({
            id: `activity-${index}`,
            type: 'test_completed',
            description: `User completed a test with score ${ut.numCorrectAnswer}`,
            timestamp: ut.endTime || ut.startTime,
          }));

        setActivities(recentActivities);
      } catch (err) {
        setError('Error loading dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
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
  }, [loading]);

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return '+1 User';
      case 'test_completed':
        return 'Completed';
      default:
        return 'Info';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return 'text-green-400';
      case 'test_completed':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-200 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-gray-200 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retry
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
        {/* Welcome Section */}
        <div className="dashboard-card mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-100">
            Admin Dashboard -{' '}
            <span className="text-blue-400">{userName || 'Administrator'}</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Manage your IELTS platform, users, and content from here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">
                Total Users
              </CardTitle>
              <CardDescription className="text-gray-500">
                Registered learners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {stats?.totalUsers || 0}
              </div>
              <p className="text-green-400 text-sm">Platform users</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">
                Active Tests
              </CardTitle>
              <CardDescription className="text-gray-500">
                Published tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {stats?.activeTests || 0}
              </div>
              <p className="text-blue-400 text-sm">Available tests</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">
                Test Attempts
              </CardTitle>
              <CardDescription className="text-gray-500">
                Total attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {stats?.testAttempts || 0}
              </div>
              <p className="text-green-400 text-sm">Platform engagement</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-200">Avg Score</CardTitle>
              <CardDescription className="text-gray-500">
                Platform average
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                {stats?.averageScore?.toFixed(1) || '0.0'}
              </div>
              <p className="text-blue-400 text-sm">Average points</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Management Actions */}
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">
                Quick Management
              </CardTitle>
              <CardDescription className="text-gray-500">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Link to="/admin/tests">
                  <Button className="w-full bg-blue-600/90 hover:bg-blue-600 text-gray-100 justify-start">
                    <svg
                      className="w-5 h-5 mr-3"
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
                    Manage Tests
                  </Button>
                </Link>
                <Link to="/admin/users">
                  <Button className="w-full bg-green-600/90 hover:bg-green-600 text-gray-100 justify-start">
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    Manage Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-500">
                Latest test completions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {activities.length > 0 ? (
                  activities.slice(0, 3).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg"
                    >
                      <div>
                        <p className="text-gray-200 font-medium">
                          {activity.description}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {formatActivityTime(activity.timestamp)}
                        </p>
                      </div>
                      <div
                        className={`text-sm ${getActivityColor(activity.type)}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No recent activities
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
