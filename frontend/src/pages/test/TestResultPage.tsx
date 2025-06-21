import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/auth';
import { useAuth } from '@/hooks/useAuthApi';
import { gsap } from 'gsap';
import api from '@/api/indexApi';
import type { UserTest, UserResponse, TestFull, TestType } from '@/types';

interface ProcessedTestResult {
  userTest: UserTest;
  test: TestFull;
  testType: TestType;
  responses: UserResponse[];
  totalQuestions: number;
  correctAnswers: number;
  totalMarksAwarded: number;
  totalPossibleMarks: number;
  percentage: number;
  bandScore: number;
  sectionScores: SectionScore[];
  aiAnalysis?: AIWritingAnalysis;
}

interface SectionScore {
  sectionId: string;
  sectionNumber: number;
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface AIWritingAnalysis {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalAccuracy: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
}

const TestResultPage: React.FC = () => {
  const { testId, resultId } = useParams<{
    testId: string;
    resultId: string;
  }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  const [result, setResult] = useState<ProcessedTestResult | null>(null);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth/login');
      return;
    }

    if (!testId || !resultId) {
      navigate('/learner/dashboard');
      return;
    }

    fetchTestResult();
  }, [testId, resultId, isAuthenticated, user, navigate]);

  useEffect(() => {
    const checkForWritingTestAndRedirect = async () => {
      if (!isAuthenticated || !user || !testId || !resultId) {
        return;
      }

      try {
        // Fetch test type to check if this is a writing test
        const test = await api.test.getTestById(testId);
        const testType = await api.testType.getTestTypeById(test.testTypeId);

        // If this is a writing test, redirect to writing evaluation page
        if (testType.name.toLowerCase() === 'writing') {
          console.log(
            '🔄 Detected writing test, redirecting to writing evaluation page'
          );
          navigate(`/learner/test/${testId}/writing-result/${resultId}`, {
            replace: true,
          });
          return;
        }

        // If not a writing test, continue with normal flow
        console.log('✅ Non-writing test, proceeding with normal results');
      } catch (error) {
        console.error('❌ Error checking test type for redirect:', error);
        // Continue with normal flow if error occurs
      }
    };

    // Check for writing test redirect before fetching normal results
    checkForWritingTestAndRedirect();
  }, [testId, resultId, isAuthenticated, user, navigate]);

  const fetchTestResult = async () => {
    try {
      setLoading(true);
      setError(null);

      // Type guards for required parameters
      if (!testId || !resultId || !user?.userId) {
        throw new Error('Missing required parameters');
      }

      // Fetch user test result
      const userTest = await api.userTest.getUserTestById(resultId);

      // Verify this belongs to the current user
      if (userTest.userId !== user.userId) {
        throw new Error('Unauthorized access to test result');
      }

      // Fetch test details
      const test = await api.test.getTestById(testId);

      // Fetch test type details
      const testType = await api.testType.getTestTypeById(test.testTypeId);

      let responses: UserResponse[] = [];

      // Try to fetch user responses
      try {
        console.log('🔄 Fetching user responses...');
        responses = await api.userResponse.getResponsesByUserTestId(resultId);
        console.log('✅ Successfully fetched', responses.length, 'responses');

        // Debug: Log sample response to verify MarksAwarded field
        if (responses.length > 0) {
          console.log('🔍 Sample response structure:', {
            responseId: responses[0].responseId,
            marksAwarded: responses[0].marksAwarded,
            hasMarksAwarded: 'marksAwarded' in responses[0],
            keys: Object.keys(responses[0]),
          });
        }
      } catch (responseError) {
        console.warn(
          '⚠️ Failed to fetch responses from backend:',
          responseError
        );

        // Set error to show user the issue, but don't prevent showing basic results
        console.log('📊 Will calculate from UserTest feedback if possible');
        responses = []; // Empty responses, will show summary only
      }

      // Process the data
      const processedResult = processTestResult(
        userTest,
        test,
        testType,
        responses
      );
      setResult(processedResult);
    } catch (err) {
      console.error('Error fetching test result:', err);
      setError('Failed to load test result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function để extract scores từ UserTest.feedback
  const extractCorrectAnswersFromFeedback = (
    feedback: string | undefined,
    _totalQuestions: number
  ): number => {
    if (!feedback) return 0;

    // Extract from format: "Test completed with 15 out of 15 questions correct. Score: 15/15 (100%)"
    const match = feedback.match(/with (\d+) out of (\d+) questions correct/);
    if (match) {
      const correct = parseInt(match[1], 10);
      console.log('📊 Extracted from feedback:', { correct, total: match[2] });
      return correct;
    }

    return 0;
  };

  // ✅ Updated processTestResult - Sử dụng điểm từ frontend scoring
  const processTestResult = (
    userTest: UserTest,
    test: TestFull,
    testType: TestType,
    responses: UserResponse[]
  ): ProcessedTestResult => {
    // Calculate section scores based on marksAwarded from responses
    const sectionScores = calculateSectionScores(test, responses);

    // Calculate overall statistics - sử dụng marksAwarded đã được frontend tính
    const totalQuestions = getTotalQuestions(test);

    let correctAnswers = 0;
    let totalMarksAwarded = 0;

    if (responses.length > 0) {
      // Use detailed responses if available
      correctAnswers = responses.filter((r) => r.marksAwarded > 0).length;
      totalMarksAwarded = responses.reduce(
        (sum, r) => sum + (r.marksAwarded || 0),
        0
      );
    } else {
      // Fallback: Extract from UserTest.feedback if responses unavailable
      correctAnswers = extractCorrectAnswersFromFeedback(
        userTest.feedback,
        totalQuestions
      );
      totalMarksAwarded = correctAnswers; // Assume 1 mark per question
    }

    const totalPossibleMarks = getTotalPossibleMarks(test);

    // Calculate percentage based on marks
    const percentage =
      totalPossibleMarks > 0
        ? Math.round((totalMarksAwarded / totalPossibleMarks) * 100)
        : totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    const bandScore = calculateBandScore(percentage);

    // Generate AI analysis for writing tests
    const aiAnalysis =
      testType.name.toLowerCase() === 'writing' && responses.length > 0
        ? generateAIWritingAnalysis(responses)
        : undefined;

    // Debug log
    console.log('🎯 Test Result Analysis:', {
      mode: responses.length > 0 ? 'DETAILED_RESPONSES' : 'FEEDBACK_FALLBACK',
      totalQuestions,
      responsesReceived: responses.length,
      correctAnswers,
      totalMarksAwarded,
      totalPossibleMarks,
      percentage,
      bandScore,
      userTestNumCorrect: userTest.numCorrectAnswer,
      userTestFeedback: userTest.feedback,
      note:
        responses.length > 0
          ? 'Using detailed response data for scoring'
          : 'Using feedback extraction due to response fetch failure',
    });

    return {
      userTest,
      test,
      testType,
      responses,
      totalQuestions,
      correctAnswers,
      totalMarksAwarded,
      totalPossibleMarks,
      percentage,
      bandScore,
      sectionScores,
      aiAnalysis,
    };
  };

  // Helper để tính tổng điểm có thể đạt được
  const getTotalPossibleMarks = (test: TestFull): number => {
    return (
      test.testParts?.reduce(
        (total, part) =>
          total +
          (part.sections?.reduce(
            (sectionTotal, section) =>
              sectionTotal +
              (section.questions?.reduce(
                (questionTotal, question) =>
                  questionTotal + (question.marks || 1),
                0
              ) || 0),
            0
          ) || 0),
        0
      ) || 0
    );
  };

  // ✅ Updated calculateSectionScores để handle marks correctly
  const calculateSectionScores = (
    test: TestFull,
    responses: UserResponse[]
  ): SectionScore[] => {
    const sectionScores: SectionScore[] = [];

    test.testParts?.forEach((part) => {
      part.sections?.forEach((section, sectionIndex) => {
        const sectionQuestions = section.questions || [];
        const sectionResponses = responses.filter((response) =>
          sectionQuestions.some((q) => q.questionId === response.questionId)
        );

        // Count correct answers (any response with marks > 0)
        const correctAnswers = sectionResponses.filter(
          (r) => r.marksAwarded > 0
        ).length;

        // Sum actual marks awarded
        const marksAwarded = sectionResponses.reduce(
          (sum, r) => sum + (r.marksAwarded || 0),
          0
        );

        // Calculate max possible marks for this section
        const maxPossibleMarks = sectionQuestions.reduce(
          (sum, q) => sum + (q.marks || 1),
          0
        );

        const totalQuestions = sectionQuestions.length;
        const percentage =
          totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0;

        sectionScores.push({
          sectionId: section.sectionId,
          sectionNumber: sectionIndex + 1,
          score: marksAwarded,
          maxScore: maxPossibleMarks,
          percentage,
          correctAnswers,
          totalQuestions,
        });
      });
    });

    return sectionScores;
  };

  const getTotalQuestions = (test: TestFull): number => {
    return (
      test.testParts?.reduce(
        (total, part) =>
          total +
          (part.sections?.reduce(
            (sectionTotal, section) =>
              sectionTotal + (section.questions?.length || 0),
            0
          ) || 0),
        0
      ) || 0
    );
  };

  const calculateBandScore = (percentage: number): number => {
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

  const generateAIWritingAnalysis = (
    responses: UserResponse[]
  ): AIWritingAnalysis => {
    const writingResponse = responses.find(
      (r) => r.userAnswer && r.userAnswer.length > 100
    );

    if (!writingResponse) {
      return {
        taskAchievement: 5.0,
        coherenceCohesion: 5.0,
        lexicalResource: 5.0,
        grammaticalAccuracy: 5.0,
        overallScore: 5.0,
        feedback: 'No substantial writing response found for analysis.',
        suggestions: [
          'Ensure you provide complete responses to writing tasks.',
        ],
      };
    }

    const wordCount = writingResponse.userAnswer.split(/\s+/).length;
    const sentences = writingResponse.userAnswer
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    // Simple scoring algorithm
    const taskAchievement = Math.min(9, Math.max(4, 4 + wordCount / 50));
    const coherenceCohesion = Math.min(
      8,
      Math.max(4, 4 + sentences.length / 10)
    );
    const lexicalResource = Math.min(8, Math.max(4, 4 + wordCount / 75));
    const grammaticalAccuracy = Math.min(8, Math.max(4, 5 + Math.random()));

    const overallScore =
      (taskAchievement +
        coherenceCohesion +
        lexicalResource +
        grammaticalAccuracy) /
      4;

    return {
      taskAchievement: Math.round(taskAchievement * 10) / 10,
      coherenceCohesion: Math.round(coherenceCohesion * 10) / 10,
      lexicalResource: Math.round(lexicalResource * 10) / 10,
      grammaticalAccuracy: Math.round(grammaticalAccuracy * 10) / 10,
      overallScore: Math.round(overallScore * 10) / 10,
      feedback: generateWritingFeedback(wordCount, overallScore),
      suggestions: generateWritingSuggestions(overallScore),
    };
  };

  const generateWritingFeedback = (
    wordCount: number,
    score: number
  ): string => {
    const feedbacks = [
      `Your essay contains ${wordCount} words. `,
      score >= 7
        ? 'You demonstrate good command of English writing. '
        : 'There is room for improvement in your writing skills. ',
      wordCount >= 250
        ? 'You met the word count requirement effectively. '
        : 'Consider expanding your ideas to meet the recommended word count. ',
      'Continue practicing to enhance your writing fluency and accuracy.',
    ];
    return feedbacks.join('');
  };

  const generateWritingSuggestions = (score: number): string[] => {
    const suggestions = [
      'Practice organizing your ideas with clear topic sentences',
      'Use a variety of sentence structures to improve flow',
      'Expand your vocabulary with more precise word choices',
      'Review grammar fundamentals, especially verb tenses',
    ];

    if (score >= 7) {
      return [
        'Focus on advanced cohesive devices',
        'Incorporate more sophisticated vocabulary',
        'Practice complex sentence structures',
      ];
    }

    return suggestions;
  };

  const getBandScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-400 border-green-400';
    if (score >= 7) return 'text-blue-400 border-blue-400';
    if (score >= 6) return 'text-yellow-400 border-yellow-400';
    if (score >= 5) return 'text-orange-400 border-orange-400';
    return 'text-red-400 border-red-400';
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
      return { label: 'Excellent', color: 'text-green-400' };
    if (percentage >= 80) return { label: 'Very Good', color: 'text-blue-400' };
    if (percentage >= 70) return { label: 'Good', color: 'text-yellow-400' };
    if (percentage >= 60)
      return { label: 'Satisfactory', color: 'text-orange-400' };
    return { label: 'Needs Improvement', color: 'text-red-400' };
  };

  const getTestDuration = (): number => {
    if (!result?.userTest.startTime || !result?.userTest.endTime) return 0;
    const start = new Date(result.userTest.startTime).getTime();
    const end = new Date(result.userTest.endTime).getTime();
    return Math.floor((end - start) / 1000 / 60); // minutes
  };

  // Helper function để tìm question trong test structure
  const findQuestionInTest = (questionId: string, test: TestFull): any => {
    for (const part of test.testParts || []) {
      for (const section of part.sections || []) {
        const question = section.questions?.find(
          (q) => q.questionId === questionId
        );
        if (question) return question;
      }
    }
    return undefined;
  };

  const generateFeedback = () => {
    if (!result)
      return {
        overall: '',
        strengths: [],
        improvements: [],
        recommendations: [],
      };

    const {
      percentage,
      bandScore,
      testType,
      totalMarksAwarded,
      totalPossibleMarks,
      responses,
    } = result;

    const overall = `You achieved a band score of ${bandScore} with ${percentage}% accuracy (${totalMarksAwarded}/${totalPossibleMarks} marks). ${
      percentage >= 70
        ? 'This is a strong performance that demonstrates good command of English.'
        : 'There are opportunities to improve your performance with focused practice.'
    }`;

    const strengths = [];
    const improvements = [];
    const recommendations = [];

    if (percentage >= 80) {
      strengths.push('Excellent overall comprehension and accuracy');
      strengths.push('Consistent performance across sections');
    } else if (percentage >= 60) {
      strengths.push('Good understanding of most concepts');
      improvements.push('Focus on challenging question types');
    } else {
      improvements.push('Review fundamental concepts and strategies');
      improvements.push('Practice more questions of this difficulty level');
    }

    // Check for partial credit performance (only if detailed responses available)
    if (responses.length > 0) {
      const partialCreditQuestions = responses.filter((r) => {
        const question = findQuestionInTest(r.questionId, result.test);
        const maxMarks = question?.marks || 1;
        return r.marksAwarded > 0 && r.marksAwarded < maxMarks;
      }).length;

      if (partialCreditQuestions > 0) {
        strengths.push(
          `Earned partial credit on ${partialCreditQuestions} questions`
        );
      }
    }

    // Skill-specific recommendations
    switch (testType.name.toLowerCase()) {
      case 'reading':
        recommendations.push('Practice skimming and scanning techniques');
        recommendations.push('Build vocabulary through extensive reading');
        break;
      case 'listening':
        recommendations.push('Listen to various English accents regularly');
        recommendations.push('Practice note-taking while listening');
        break;
      case 'writing':
        recommendations.push('Study high-scoring essay examples');
        recommendations.push('Practice organizing ideas clearly');
        break;
      default:
        recommendations.push('Continue regular practice');
    }

    return { overall, strengths, improvements, recommendations };
  };

  // GSAP Animations
  useEffect(() => {
    if (containerRef.current && result && !loading) {
      // Animate score reveal
      gsap.fromTo(
        containerRef.current.querySelector('.score-circle'),
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1, ease: 'back.out(1.7)' }
      );

      // Animate progress bars
      gsap.fromTo(
        containerRef.current.querySelectorAll('.progress-bar'),
        { width: 0 },
        {
          width: (_i, target) => target.getAttribute('data-width') + '%',
          duration: 1.5,
          delay: 0.5,
          stagger: 0.1,
        }
      );

      // Animate cards
      gsap.fromTo(
        containerRef.current.querySelectorAll('.result-card'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.8,
        }
      );
    }
  }, [result, loading]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-white text-lg">Loading test results...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <div className="space-x-4">
            <Button
              onClick={() => navigate('/learner/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={fetchTestResult}
              variant="outline"
              className="border-gray-700 text-gray-400"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No result data
  if (!result) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Test result not found</div>
          <Button
            onClick={() => navigate('/learner/dashboard')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(result.percentage);
  const feedback = generateFeedback();
  const testDuration = getTestDuration();

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-gray-200 pt-20"
    >
      {/* Header Section */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-100">
              Test Results
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {result.test.testName} - {result.testType.name} - Completed on{' '}
              {result.userTest.endTime
                ? new Date(result.userTest.endTime).toLocaleDateString()
                : new Date(result.userTest.startTime).toLocaleDateString()}
            </p>

            {/* ✅ Data source indicator */}
            {result.responses.length === 0 && (
              <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/50 rounded-lg max-w-md mx-auto">
                <p className="text-blue-300 text-sm">
                  📊 Results calculated from test completion data
                </p>
              </div>
            )}
          </div>

          {/* Overall Score */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/80 border-gray-800 mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <h2 className="text-2xl font-bold text-gray-200 mb-2">
                      Overall Performance
                    </h2>
                    <p className={`text-lg ${performance.color} font-semibold`}>
                      {performance.label}
                    </p>
                    <p className="text-gray-500 mt-2">
                      Time taken:{' '}
                      {testDuration > 0
                        ? `${testDuration} minutes`
                        : 'Not recorded'}
                    </p>
                    <p className="text-gray-500">
                      Status:{' '}
                      <span className="capitalize text-green-400">
                        {result.userTest.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div
                        className={`score-circle w-24 h-24 rounded-full border-4 ${getBandScoreColor(
                          result.bandScore
                        )} flex items-center justify-center mb-2`}
                      >
                        <span className="text-2xl font-bold">
                          {result.bandScore}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Band Score</p>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {result.percentage}%
                      </div>
                      <p className="text-sm text-gray-500">
                        {result.totalMarksAwarded}/{result.totalPossibleMarks}{' '}
                        marks
                      </p>
                      <p className="text-xs text-gray-600">
                        {result.correctAnswers}/{result.totalQuestions} correct
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section Scores */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold text-gray-200 mb-6">
                Section Breakdown
              </h3>

              {result.sectionScores.map((section) => (
                <Card
                  key={section.sectionId}
                  className="result-card bg-gray-900/80 border-gray-800"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-200">
                      Section {section.sectionNumber}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Score</span>
                        <span className="text-gray-200 font-semibold">
                          {section.score}/{section.maxScore}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-500">
                            {section.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3">
                          <div
                            className="progress-bar bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                            data-width={section.percentage}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Correct Answers</span>
                        <span className="text-gray-400">
                          {section.correctAnswers}/{section.totalQuestions}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Question Review - Show detailed if responses available, summary if not */}
              <Card className="result-card bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-200">
                    {result.responses.length > 0
                      ? 'Detailed Question Review'
                      : 'Test Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.responses.length > 0 ? (
                    // Detailed question review
                    <div className="space-y-3">
                      {result.responses
                        .slice(0, showDetailedFeedback ? undefined : 5)
                        .map((response, index) => {
                          const question = findQuestionInTest(
                            response.questionId,
                            result.test
                          );
                          const maxMarks = question?.marks || 1;
                          const isPartialCredit =
                            response.marksAwarded > 0 &&
                            response.marksAwarded < maxMarks;

                          return (
                            <div
                              key={response.responseId}
                              className="p-4 bg-gray-800/70 rounded-lg border border-gray-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-3">
                                    Q{question?.questionNumber || index + 1}
                                  </span>
                                  <span
                                    className={`w-3 h-3 rounded-full mr-3 ${
                                      response.marksAwarded === maxMarks
                                        ? 'bg-green-500'
                                        : response.marksAwarded > 0
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                  ></span>
                                  <span className="text-gray-200">
                                    {response.marksAwarded === maxMarks
                                      ? 'Correct'
                                      : response.marksAwarded > 0
                                      ? 'Partial Credit'
                                      : 'Incorrect'}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-gray-400 mr-2">
                                    Score: {response.marksAwarded}/{maxMarks}
                                  </span>
                                  {isPartialCredit && (
                                    <span className="text-yellow-400 text-xs">
                                      (
                                      {Math.round(
                                        (response.marksAwarded / maxMarks) * 100
                                      )}
                                      %)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-sm text-gray-500">
                                <div className="mb-1">
                                  <strong>Your answer:</strong>{' '}
                                  {response.userAnswer.length > 50
                                    ? `${response.userAnswer.substring(
                                        0,
                                        50
                                      )}...`
                                    : response.userAnswer}
                                </div>

                                {question?.answer && (
                                  <div className="text-gray-600">
                                    <strong>Correct answer:</strong>{' '}
                                    {question.answer.correctAnswer}
                                    {question.answer.explanation && (
                                      <div className="mt-1 text-xs italic">
                                        {question.answer.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                      {result.responses.length > 5 && (
                        <Button
                          variant="outline"
                          className="w-full border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/50"
                          onClick={() =>
                            setShowDetailedFeedback(!showDetailedFeedback)
                          }
                        >
                          {showDetailedFeedback
                            ? 'Show Less'
                            : `View All ${result.responses.length} Questions`}
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Summary mode - No detailed responses available
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h4 className="text-blue-300 font-medium mb-2">
                          Test Completion Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">
                              Total Questions:
                            </span>
                            <span className="text-gray-200 ml-2 font-semibold">
                              {result.totalQuestions}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Correct Answers:
                            </span>
                            <span className="text-green-400 ml-2 font-semibold">
                              {result.correctAnswers}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Marks:</span>
                            <span className="text-gray-200 ml-2 font-semibold">
                              {result.totalMarksAwarded}/
                              {result.totalPossibleMarks}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Accuracy:</span>
                            <span className="text-blue-400 ml-2 font-semibold">
                              {result.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Test Statistics */}
              <Card className="result-card bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-200">
                    Test Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">
                        Questions Answered
                      </div>
                      <div className="text-gray-200 font-semibold">
                        {result.responses.length > 0
                          ? result.responses.length
                          : result.totalQuestions}{' '}
                        / {result.totalQuestions}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Correct Answers</div>
                      <div className="font-semibold text-green-400">
                        {result.correctAnswers}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">
                        Total Marks Earned
                      </div>
                      <div className="text-gray-200 font-semibold">
                        {result.totalMarksAwarded} / {result.totalPossibleMarks}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Accuracy Rate</div>
                      <div className="text-gray-200 font-semibold">
                        {result.percentage}%
                      </div>
                    </div>
                    {result.responses.length > 0 && (
                      <>
                        <div>
                          <div className="text-gray-500 mb-1">
                            Partial Credit Given
                          </div>
                          <div className="text-gray-200 font-semibold">
                            {
                              result.responses.filter((r) => {
                                const question = findQuestionInTest(
                                  r.questionId,
                                  result.test
                                );
                                const maxMarks = question?.marks || 1;
                                return (
                                  r.marksAwarded > 0 &&
                                  r.marksAwarded < maxMarks
                                );
                              }).length
                            }{' '}
                            questions
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">
                            Test Duration
                          </div>
                          <div className="text-gray-200 font-semibold">
                            {testDuration} minutes
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback & Recommendations */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-200 mb-6">
                Feedback
              </h3>

              {/* Overall Feedback */}
              <Card className="result-card bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-200">
                    Overall Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feedback.overall}
                  </p>
                </CardContent>
              </Card>

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <Card className="result-card bg-gray-900/80 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-200 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.strengths.map((strength, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-400 flex items-start"
                        >
                          <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Areas for Improvement */}
              {feedback.improvements.length > 0 && (
                <Card className="result-card bg-gray-900/80 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-200 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.improvements.map((improvement, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-400 flex items-start"
                        >
                          <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="result-card bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-200 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-400"
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
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.recommendations.map((recommendation, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-400 flex items-start"
                      >
                        <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* AI Writing Analysis */}
              {result.aiAnalysis && (
                <Card className="result-card bg-gray-900/80 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-200 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      AI Writing Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">
                            Task Achievement
                          </div>
                          <div className="text-gray-200 font-semibold">
                            {result.aiAnalysis.taskAchievement}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">
                            Coherence & Cohesion
                          </div>
                          <div className="text-gray-200 font-semibold">
                            {result.aiAnalysis.coherenceCohesion}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">
                            Lexical Resource
                          </div>
                          <div className="text-gray-200 font-semibold">
                            {result.aiAnalysis.lexicalResource}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Grammar</div>
                          <div className="text-gray-200 font-semibold">
                            {result.aiAnalysis.grammaticalAccuracy}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800">
                        <p className="text-sm text-gray-400 mb-3">
                          {result.aiAnalysis.feedback}
                        </p>
                        {result.aiAnalysis.suggestions.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-300 mb-2">
                              Suggestions:
                            </div>
                            <ul className="space-y-1">
                              {result.aiAnalysis.suggestions.map(
                                (suggestion, index) => (
                                  <li
                                    key={index}
                                    className="text-xs text-gray-500 flex items-start"
                                  >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {suggestion}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tests">
                <Button className="bg-blue-600/90 hover:bg-blue-600 text-gray-100 px-8 py-3">
                  Take Another Test
                </Button>
              </Link>
              <Link to="/learner/progress">
                <Button
                  variant="outline"
                  className="border-blue-500/80 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 px-8 py-3"
                >
                  View Progress
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/50 px-8 py-3"
                onClick={() => window.print()}
              >
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestResultPage;
