import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { gsap } from 'gsap';
import api from '@/api/indexApi';
import type { TestType, TestSkill } from '@/types';
import { LoadingSpinner } from '@/components/auth';
import { useAuth } from '@/hooks/useAuthApi';

// Frontend display interface
interface TestDisplayData {
  id: string;
  title: string;
  description: string;
  skill: string;
  duration: number;
  totalQuestions: number;
  totalScore: number;
  isActive: boolean;
  creationDate: string;
}

const TestListPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isLearnerArea = location.pathname.startsWith('/learner');
  const { isAuthenticated } = useAuth();

  // State management
  const [tests, setTests] = useState<TestDisplayData[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    skill: searchParams.get('type')?.toLowerCase() || '',
    search: '',
  });

  const [filteredTests, setFilteredTests] = useState<TestDisplayData[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tests and test types in parallel
        const [testsResponse, testTypesResponse] = await Promise.all([
          api.test.getTests({ page: 1, limit: 100 }),
          api.testType.getTestTypes(),
        ]);

        setTestTypes(testTypesResponse);

        // Convert backend data to frontend format
        const testsDisplayData: TestDisplayData[] = testsResponse
          .filter((test) => test.isActive) // Only show active tests
          .map((test) => {
            const testType = testTypesResponse.find(
              (tt) => tt.testTypeId === test.testTypeId
            );

            return {
              id: test.testId,
              title: test.testName,
              description: testType?.description || 'IELTS practice test',
              skill: testType?.name || 'Reading',
              duration: testType?.timeLimit || 60,
              totalQuestions: testType?.totalMarks || 40, // Assuming 1 mark per question
              totalScore: testType?.totalMarks || 40,
              isActive: test.isActive,
              creationDate: test.creationDate,
            };
          });

        setTests(testsDisplayData);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tests based on current filters
  useEffect(() => {
    let filtered = tests.filter((test) => {
      const matchesSkill =
        !filters.skill || test.skill.toLowerCase() === filters.skill;
      const matchesSearch =
        !filters.search ||
        test.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        test.description.toLowerCase().includes(filters.search.toLowerCase());

      return matchesSkill && matchesSearch;
    });

    setFilteredTests(filtered);
  }, [tests, filters]);

  // GSAP animations
  useEffect(() => {
    if (containerRef.current && !loading) {
      gsap.fromTo(
        containerRef.current.querySelector('.header-section'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 }
      );

      gsap.fromTo(
        containerRef.current.querySelectorAll('.test-card'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.3,
        }
      );
    }
  }, [loading, filteredTests]);

  const getSkillIcon = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'listening':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343a9 9 0 000 12.728m2.829-9.9a5 5 0 000 7.072M9 12h6"
            />
          </svg>
        );
      case 'reading':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case 'writing':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        );
      case 'speaking':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-6 h-6"
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
        );
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'listening':
        return 'bg-purple-500/20 text-purple-400';
      case 'reading':
        return 'bg-green-500/20 text-green-400';
      case 'writing':
        return 'bg-blue-500/20 text-blue-400';
      case 'speaking':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-200 pt-20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading tests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-gray-200 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Error Loading Tests
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
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
      {/* Header Section */}
      <section className="header-section py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-100">
              {isLearnerArea ? 'My Tests' : 'Practice Tests'}
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {isLearnerArea
                ? 'Continue your IELTS preparation with our comprehensive test collection.'
                : 'Explore our collection of IELTS practice tests. Sign up to access full features!'}
            </p>
          </div>

          {/* Filters */}
          <div className="max-w-4xl mx-auto bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Skill
                </label>
                <select
                  value={filters.skill}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      skill: e.target.value as TestSkill | '',
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Skills</option>
                  {testTypes.map((testType) => (
                    <option
                      key={testType.testTypeId}
                      value={testType.name.toLowerCase()}
                    >
                      {testType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() =>
                    setFilters({ skill: '' as TestSkill | '', search: '' })
                  }
                  variant="outline"
                  className="w-full border-blue-500/80 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tests Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="mb-8 text-center">
            <p className="text-gray-400">
              Showing {filteredTests.length} of {tests.length} available tests
            </p>
          </div>

          {filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469.81-6.172 2.172M12 3v3.75m0 0c-1.036 0-2.036.201-3 .566m3-.566c1.036 0 2.036.201 3 .566M21 21H3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No tests found
              </h3>
              <p className="text-gray-600 mb-4">
                {tests.length === 0
                  ? 'No tests are currently available. Please check back later.'
                  : 'Try adjusting your filters to see more results.'}
              </p>
              {tests.length === 0 && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-blue-500/80 text-blue-400 hover:bg-blue-500/20"
                >
                  Refresh
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <Card
                  key={test.id}
                  className="test-card bg-gray-900/80 border-gray-800 hover:border-blue-500/80 transition-all duration-300 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-2 rounded-lg ${getSkillColor(
                          test.skill
                        )}`}
                      >
                        {getSkillIcon(test.skill)}
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {test.skill}
                      </span>
                    </div>

                    <CardTitle className="text-xl text-gray-200 group-hover:text-blue-400 transition-colors">
                      {test.title}
                    </CardTitle>
                    <CardDescription className="text-gray-500 line-clamp-2">
                      {test.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {formatDuration(test.duration)}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
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
                          {test.totalQuestions} questions
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Total Score: {test.totalScore}</span>
                        <span className="text-xs text-gray-600">
                          Created:{' '}
                          {new Date(test.creationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/test/${test.id}`} className="flex-1">
                        <Button className="w-full bg-blue-600/90 hover:bg-blue-600 text-gray-100">
                          {isLearnerArea ? 'Start Test' : 'Preview Test'}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-700 text-gray-500 hover:border-gray-600 hover:bg-gray-800/50"
                        title="Test Details"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section for non-authenticated users */}
      {!isLearnerArea && tests.length > 0 && !isAuthenticated && (
        <section className="py-16 bg-gradient-to-t from-gray-900 to-black">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-100">
              Ready to Start Your IELTS Preparation?
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Sign up now to access full test features, detailed AI feedback,
              and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button className="bg-blue-600/90 hover:bg-blue-600 text-gray-100 px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button
                  variant="outline"
                  className="border-blue-500/80 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 px-8 py-6 text-lg"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TestListPage;
