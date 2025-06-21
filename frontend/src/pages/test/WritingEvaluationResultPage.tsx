import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/auth';
import { useAuth } from '@/hooks/useAuthApi';
import { gsap } from 'gsap';
import api from '@/api/indexApi';
import WritingEvaluationService, {
  type WritingEvaluationResponse,
} from '@/service/WritingEvaluationService';
import type {
  UserTest,
  UserResponse,
  TestFull,
  TestType,
  Question,
} from '@/types';

interface WritingTask {
  questionId: string;
  questionNumber: number;
  taskType: 'Task 1' | 'Task 2';
  questionText: string;
  userEssay: string;
  wordCount: number;
  evaluation?: WritingEvaluationResponse;
  isEvaluatable: boolean;
  sectionNumber: number;
}

interface ProcessedWritingResult {
  userTest: UserTest;
  test: TestFull;
  testType: TestType;
  writingTasks: WritingTask[];
  overallBandScore: number;
  totalWords: number;
  evaluatedTasks: number;
}

const WritingEvaluationResultPage: React.FC = () => {
  const { testId, resultId } = useParams<{
    testId: string;
    resultId: string;
  }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  const [result, setResult] = useState<ProcessedWritingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluationProgress, setEvaluationProgress] = useState<{
    current: number;
    total: number;
    currentTask: string;
  }>({ current: 0, total: 0, currentTask: '' });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth/login');
      return;
    }

    if (!testId || !resultId) {
      navigate('/learner/dashboard');
      return;
    }

    fetchAndEvaluateWritingTest();
  }, [testId, resultId, isAuthenticated, user, navigate]);

  const fetchAndEvaluateWritingTest = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Starting writing evaluation process...');

      // Fetch user test result
      const userTest = await api.userTest.getUserTestById(resultId!);

      if (userTest.userId !== user!.userId) {
        throw new Error('Unauthorized access to test result');
      }

      // Fetch test details
      const test = await api.test.getTestById(testId!);
      const testType = await api.testType.getTestTypeById(test.testTypeId);

      // Verify this is a writing test
      if (testType.name.toLowerCase() !== 'writing') {
        console.log('❌ Not a writing test, redirecting to regular results');
        navigate(`/learner/test/${testId}/result/${resultId}`);
        return;
      }

      // Fetch user responses
      const responses = await api.userResponse.getResponsesByUserTestId(
        resultId!
      );

      console.log('📝 Processing writing responses:', responses.length);

      // Process writing tasks
      const writingTasks = await processWritingTasks(test, responses);

      console.log('🎯 Found writing tasks:', writingTasks.length);

      // Evaluate each task
      await evaluateWritingTasks(writingTasks);

      // Calculate overall results
      const processedResult = calculateOverallResults(
        userTest,
        test,
        testType,
        writingTasks
      );

      setResult(processedResult);
    } catch (err) {
      console.error('❌ Error in writing evaluation:', err);
      setError('Failed to evaluate writing test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processWritingTasks = async (
    test: TestFull,
    responses: UserResponse[]
  ): Promise<WritingTask[]> => {
    const tasks: WritingTask[] = [];
    let sectionNumber = 1;

    for (const part of test.testParts || []) {
      for (const section of part.sections || []) {
        for (const question of section.questions || []) {
          const response = responses.find(
            (r) => r.questionId === question.questionId
          );

          if (response && response.userAnswer.trim()) {
            const questionText = extractQuestionText(question);
            const wordCount = WritingEvaluationService.getWordCount(
              response.userAnswer
            );
            const isEvaluatable = WritingEvaluationService.isEvaluatable(
              question,
              sectionNumber
            );

            // Determine task type based on question content or section number
            const taskType = determineTaskType(question, sectionNumber);

            tasks.push({
              questionId: question.questionId,
              questionNumber: question.questionNumber || sectionNumber,
              taskType,
              questionText,
              userEssay: response.userAnswer,
              wordCount,
              isEvaluatable,
              sectionNumber,
            });
          }
        }
        sectionNumber++;
      }
    }

    return tasks;
  };

  const evaluateWritingTasks = async (tasks: WritingTask[]) => {
    const evaluatableTasks = tasks.filter((task) => task.isEvaluatable);

    setEvaluationProgress({
      current: 0,
      total: evaluatableTasks.length,
      currentTask: '',
    });

    for (let i = 0; i < evaluatableTasks.length; i++) {
      const task = evaluatableTasks[i];

      setEvaluationProgress({
        current: i + 1,
        total: evaluatableTasks.length,
        currentTask: `${task.taskType} - ${task.wordCount} words`,
      });

      try {
        console.log(`🔍 Evaluating ${task.taskType}:`, {
          questionId: task.questionId,
          wordCount: task.wordCount,
        });

        const evaluation = await WritingEvaluationService.evaluateEssay({
          question: task.questionText,
          essay: task.userEssay,
        });

        task.evaluation = evaluation;

        console.log(`✅ ${task.taskType} evaluated:`, {
          score: evaluation.score,
          feedbackLength: evaluation.evaluation_text.length,
        });

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error evaluating ${task.taskType}:`, error);
        task.evaluation = {
          score: '5.0',
          evaluation_text: `Error: Could not evaluate this task. ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        };
      }
    }
  };

  const calculateOverallResults = (
    userTest: UserTest,
    test: TestFull,
    testType: TestType,
    tasks: WritingTask[]
  ): ProcessedWritingResult => {
    const evaluatedTasks = tasks.filter((task) => task.evaluation);
    const totalWords = tasks.reduce((sum, task) => sum + task.wordCount, 0);

    let overallBandScore = 5.0;
    if (evaluatedTasks.length > 0) {
      const totalScore = evaluatedTasks.reduce(
        (sum, task) => sum + parseFloat(task.evaluation!.score),
        0
      );
      overallBandScore = totalScore / evaluatedTasks.length;
    }

    return {
      userTest,
      test,
      testType,
      writingTasks: tasks,
      overallBandScore: Math.round(overallBandScore * 10) / 10,
      totalWords,
      evaluatedTasks: evaluatedTasks.length,
    };
  };

  const extractQuestionText = (question: Question): string => {
    try {
      let content = question.content;

      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch {
          return content;
        }
      }

      if (typeof content === 'object' && content !== null) {
        return content.question || content.text || JSON.stringify(content);
      }

      return String(content);
    } catch (error) {
      return 'Question text unavailable';
    }
  };

  const determineTaskType = (
    question: Question,
    sectionNumber: number
  ): 'Task 1' | 'Task 2' => {
    const questionText = extractQuestionText(question).toLowerCase();

    // Task 1 indicators
    const task1Keywords = [
      'chart',
      'graph',
      'table',
      'diagram',
      'map',
      'process',
      'describe',
    ];
    const hasTask1Keywords = task1Keywords.some((keyword) =>
      questionText.includes(keyword)
    );

    // Task 2 indicators
    const task2Keywords = [
      'discuss',
      'agree',
      'opinion',
      'extent',
      'advantages',
      'essay',
    ];
    const hasTask2Keywords = task2Keywords.some((keyword) =>
      questionText.includes(keyword)
    );

    if (hasTask2Keywords && !hasTask1Keywords) return 'Task 2';
    if (hasTask1Keywords && !hasTask2Keywords) return 'Task 1';

    // Fallback to section number
    return sectionNumber === 1 ? 'Task 1' : 'Task 2';
  };

  const getBandScoreColor = (score: string): string => {
    const numScore = parseFloat(score);
    if (numScore >= 8.0)
      return 'text-green-400 border-green-400 bg-green-400/10';
    if (numScore >= 7.0) return 'text-blue-400 border-blue-400 bg-blue-400/10';
    if (numScore >= 6.0)
      return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
    if (numScore >= 5.0)
      return 'text-orange-400 border-orange-400 bg-orange-400/10';
    return 'text-red-400 border-red-400 bg-red-400/10';
  };

  const getBandScoreDescription = (score: string): string => {
    const numScore = parseFloat(score);
    if (numScore >= 8.5) return 'Expert User';
    if (numScore >= 7.5) return 'Very Good User';
    if (numScore >= 6.5) return 'Good User';
    if (numScore >= 5.5) return 'Modest User';
    if (numScore >= 4.5) return 'Limited User';
    return 'Extremely Limited User';
  };

  const getTaskFeedback = (task: WritingTask): string[] => {
    const feedback: string[] = [];

    if (task.taskType === 'Task 1') {
      const minWords = 150;
      if (task.wordCount < minWords) {
        feedback.push(
          `⚠️ Word count too low: ${task.wordCount}/${minWords} words`
        );
      } else {
        feedback.push(`✅ Good word count: ${task.wordCount} words`);
      }

      if (!task.isEvaluatable) {
        feedback.push(
          '📊 Task 1 requires manual evaluation due to visual elements'
        );
      }
    } else {
      const minWords = 250;
      if (task.wordCount < minWords) {
        feedback.push(
          `⚠️ Word count too low: ${task.wordCount}/${minWords} words`
        );
      } else {
        feedback.push(`✅ Good word count: ${task.wordCount} words`);
      }
    }

    return feedback;
  };

  // GSAP Animations
  useEffect(() => {
    if (containerRef.current && result && !loading) {
      // Animate overall score
      gsap.fromTo(
        containerRef.current.querySelector('.overall-score'),
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1, ease: 'back.out(1.7)' }
      );

      // Animate task cards
      gsap.fromTo(
        containerRef.current.querySelectorAll('.task-card'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          delay: 0.5,
        }
      );
    }
  }, [result, loading]);

  // Loading state with progress
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 max-w-md mx-4">
          <LoadingSpinner size="lg" />

          <div className="text-center">
            <div className="text-white text-xl mb-2">
              Evaluating Your Writing
            </div>
            <div className="text-gray-400 text-sm">
              AI is analyzing your essays and providing detailed feedback...
            </div>
          </div>

          {evaluationProgress.total > 0 && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>
                  Progress: {evaluationProgress.current}/
                  {evaluationProgress.total}
                </span>
                <span>
                  {Math.round(
                    (evaluationProgress.current / evaluationProgress.total) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (evaluationProgress.current / evaluationProgress.total) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              {evaluationProgress.currentTask && (
                <div className="text-center text-gray-500 text-sm mt-2">
                  Evaluating: {evaluationProgress.currentTask}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-400 mb-4 text-lg">{error}</div>
          <div className="space-x-4">
            <Button
              onClick={() => navigate('/learner/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={fetchAndEvaluateWritingTest}
              variant="outline"
              className="border-gray-700 text-gray-400"
            >
              Retry Evaluation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            Writing evaluation not available
          </div>
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
              Writing Test Results
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {result.test.testName} - AI Evaluation Complete
            </p>
          </div>

          {/* Overall Score Display */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/80 border-gray-800 mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <h2 className="text-2xl font-bold text-gray-200 mb-2">
                      Overall Writing Performance
                    </h2>
                    <p className="text-gray-400">
                      {result.writingTasks.length} task
                      {result.writingTasks.length > 1 ? 's' : ''} completed •{' '}
                      {result.totalWords} total words
                    </p>
                    <p className="text-gray-500 text-sm">
                      {result.evaluatedTasks} task
                      {result.evaluatedTasks > 1 ? 's' : ''} evaluated by AI
                    </p>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div
                        className={`overall-score w-32 h-32 rounded-full border-4 ${getBandScoreColor(
                          result.overallBandScore.toString()
                        )} flex flex-col items-center justify-center mb-2`}
                      >
                        <span className="text-3xl font-bold">
                          {result.overallBandScore}
                        </span>
                        <span className="text-xs">IELTS Band</span>
                      </div>
                      <p className="text-sm text-gray-500">Overall Score</p>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-2">
                        {result.totalWords}
                      </div>
                      <p className="text-sm text-gray-500">Total Words</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Writing Tasks Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-200 mb-8 text-center">
              Individual Task Results
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {result.writingTasks.map((task, _index) => (
                <Card
                  key={task.questionId}
                  className={`task-card bg-gray-900/80 border-gray-800 ${
                    task.evaluation
                      ? 'border-blue-500/30'
                      : 'border-yellow-500/30'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-gray-200">
                        {task.taskType}
                        <span className="text-sm font-normal text-gray-400 ml-2">
                          Question {task.questionNumber}
                        </span>
                      </CardTitle>

                      {task.evaluation ? (
                        <div
                          className={`px-4 py-2 rounded-lg border-2 ${getBandScoreColor(
                            task.evaluation.score
                          )}`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {task.evaluation.score}
                            </div>
                            <div className="text-xs">Band Score</div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                          Manual Review Required
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Task Statistics */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg">
                      <div>
                        <div className="text-gray-400 text-sm">Word Count</div>
                        <div
                          className={`text-lg font-semibold ${
                            task.wordCount >=
                            (task.taskType === 'Task 1' ? 150 : 250)
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {task.wordCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Status</div>
                        <div
                          className={`text-sm font-medium ${
                            task.evaluation
                              ? 'text-green-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {task.evaluation ? 'AI Evaluated' : 'Pending Review'}
                        </div>
                      </div>
                    </div>

                    {/* Task Feedback */}
                    <div>
                      <div className="text-gray-300 font-medium mb-2">
                        Quick Feedback:
                      </div>
                      <div className="space-y-1">
                        {getTaskFeedback(task).map((feedback, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-400 p-2 bg-gray-800/30 rounded"
                          >
                            {feedback}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Evaluation */}
                    {task.evaluation && (
                      <div>
                        <div className="text-gray-300 font-medium mb-2">
                          AI Evaluation:
                        </div>
                        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                          <div className="text-gray-300 text-sm leading-relaxed">
                            {task.evaluation.evaluation_text.substring(0, 300)}
                            {task.evaluation.evaluation_text.length > 300 && (
                              <span className="text-blue-400">
                                {' '}
                                ...read more below
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Essay Preview */}
                    <details className="group">
                      <summary className="cursor-pointer text-gray-400 hover:text-gray-300 text-sm">
                        📝 View Your Essay ({task.wordCount} words)
                      </summary>
                      <div className="mt-3 p-4 bg-gray-800/20 rounded-lg border border-gray-700 max-h-32 overflow-y-auto">
                        <div className="text-gray-300 text-sm whitespace-pre-wrap">
                          {task.userEssay}
                        </div>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed AI Feedback Section */}
            {result.writingTasks.some((task) => task.evaluation) && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-200 mb-6">
                  Detailed AI Feedback
                </h3>

                {result.writingTasks
                  .filter((task) => task.evaluation)
                  .map((task, _index) => (
                    <Card
                      key={`detailed-${task.questionId}`}
                      className="bg-gray-900/80 border-gray-800 mb-6"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-200">
                          {task.taskType} - Detailed Analysis
                          <span
                            className={`ml-4 px-3 py-1 rounded-full text-sm ${getBandScoreColor(
                              task.evaluation!.score
                            )}`}
                          >
                            Band {task.evaluation!.score} -{' '}
                            {getBandScoreDescription(task.evaluation!.score)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {task.evaluation!.evaluation_text}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-12 text-center">
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
                  Print Results
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WritingEvaluationResultPage;
