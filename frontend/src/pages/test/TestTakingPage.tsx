import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/auth';
import { useAuth } from '@/hooks/useAuthApi';
import api from '@/api/indexApi';
import type {
  TestFull,
  TestType,
  UserAnswer,
  CreateUserTestDto,
  Question,
} from '@/types';
import AnswerComparisonService from '@/service/AnswerComparisonService';
import WritingEvaluationService from '@/service/WritingEvaluationService';
import { SimplifiedWritingPanel } from '@/components/common/WritingEvaluationPanel';

interface TestSession {
  userTestId: string;
  startTime: string;
  timeLimit: number; // in minutes
}

interface Highlight {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
}

const TestTakingPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, isAuthenticated } = useAuth();

  // Test data and session states
  const [test, setTest] = useState<TestFull | null>(null);
  const [testType, setTestType] = useState<TestType | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Section specific states
  const [notes, setNotes] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showWritingHelper, setShowWritingHelper] = useState(true);

  // Audio states for listening
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Get current section and all sections
  const allSections = test?.testParts?.flatMap((part) => part.sections) || [];
  const currentSection = allSections[currentSectionIndex] || null;
  const testSkill = testType?.name || 'Reading';

  // Get audio from test level (not part level)
  const audioPath = test?.audioPath;

  // Helper functions
  const getCurrentAnswer = (questionId: string): string | string[] => {
    return answers.find((ans) => ans.questionId === questionId)?.answer || '';
  };

  const getAnsweredCount = (): number => {
    return answers.filter(
      (ans) => ans.answer && ans.answer.toString().trim() !== ''
    ).length;
  };

  const getMarkedCount = (): number => {
    return answers.filter((ans) => ans.isMarked).length;
  };

  const getTotalQuestions = (): number => {
    return allSections.reduce(
      (total, section) => total + (section.questions?.length || 0),
      0
    );
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize test session
  useEffect(() => {
    const initializeTest = async () => {
      if (!testId || !user?.userId || !isAuthenticated) {
        navigate('/tests');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch test details
        const testData = await api.test.getTestById(testId);
        setTest(testData);

        // Debug: Log test structure
        console.log('📚 Test Data Structure:', {
          testParts: testData.testParts?.length,
          sections: testData.testParts?.reduce(
            (sum, part) => sum + (part.sections?.length || 0),
            0
          ),
          questions: testData.testParts?.reduce(
            (sum, part) =>
              sum +
              (part.sections?.reduce(
                (sSum, section) => sSum + (section.questions?.length || 0),
                0
              ) || 0),
            0
          ),
          audioPath: testData.audioPath, // Debug audio path
          testTypeName: testData.testTypeName,
        });

        // Fetch test type details
        const testTypeData = await api.testType.getTestTypeById(
          testData.testTypeId
        );
        setTestType(testTypeData);

        // Create user test session
        const userTestData: CreateUserTestDto = {
          userId: user.userId,
          testId: testId,
          startTime: new Date().toISOString(),
          endTime: new Date(
            Date.now() + (testTypeData.timeLimit || 60) * 60 * 1000
          ).toISOString(),
          status: 'in progress',
          numCorrectAnswer: 0,
          feedback: '',
        };

        const userTest = await api.userTest.startTest(userTestData);

        setSession({
          userTestId: userTest.userTestId,
          startTime: userTestData.startTime,
          timeLimit: testTypeData.timeLimit || 60,
        });

        // Set timer
        setTimeRemaining((testTypeData.timeLimit || 60) * 60);

        // Initialize answers for all questions
        const initialAnswers: UserAnswer[] = [];
        testData.testParts?.forEach((part) => {
          part.sections?.forEach((section) => {
            section.questions?.forEach((question) => {
              initialAnswers.push({
                questionId: question.questionId,
                answer: '',
                timeSpent: 0,
                isMarked: false,
              });
            });
          });
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error initializing test:', err);
        setError('Failed to load test. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeTest();
  }, [testId, user?.userId, isAuthenticated, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitting && !loading) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && session && !isSubmitting) {
      handleSubmitTest();
    }
  }, [timeRemaining, session, isSubmitting, loading]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioPath) return;

    console.log('🎵 Setting up audio with path:', audioPath);

    const checkAndUpdateAudioState = () => {
      // Force check current audio state
      if (audio.readyState >= 2 && audio.duration > 0) {
        console.log('🎵 Audio is ready, updating state:', {
          readyState: audio.readyState,
          duration: audio.duration,
          currentlyLoaded: audioLoaded,
        });
        setAudioDuration(audio.duration);
        setAudioLoaded(true);
        setAudioError(null);
        return true;
      }
      return false;
    };

    const handleLoadStart = () => {
      console.log('🔄 Audio load started');
      setAudioLoaded(false);
      setAudioError(null);
    };

    const handleCanPlay = () => {
      console.log('🎵 Audio can play');
      checkAndUpdateAudioState();
    };

    const handleLoadedMetadata = () => {
      console.log('🎵 Audio metadata loaded');
      checkAndUpdateAudioState();
    };

    const handleLoadedData = () => {
      console.log('🎵 Audio data loaded');
      checkAndUpdateAudioState();
    };

    const handleTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioCurrentTime(audio.duration);
    };

    const handleError = (e: any) => {
      console.error('🚨 Audio error:', e);
      console.error('🚨 Audio src:', audio.src);
      console.error('🚨 Audio readyState:', audio.readyState);
      console.error('🚨 Audio networkState:', audio.networkState);
      console.error('🚨 Audio error details:', audio.error);

      let errorMessage = 'Failed to load audio file';
      if (audio.error) {
        switch (audio.error.code) {
          case audio.error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted';
            break;
          case audio.error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio';
            break;
          case audio.error.MEDIA_ERR_DECODE:
            errorMessage = 'Audio file format not supported';
            break;
          case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio source not supported';
            break;
        }
      }

      setAudioError(errorMessage);
      setAudioLoaded(false);
    };

    // Reset states
    setAudioLoaded(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setIsPlaying(false);
    setAudioError(null);

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Initial state check - if audio is already loaded
    const initialCheck = () => {
      if (checkAndUpdateAudioState()) {
        console.log('🎵 Audio was already loaded on mount');
      } else if (audio.readyState === 0) {
        console.log('🔄 Forcing audio load...');
        audio.load();
      }
    };

    // Check immediately and after a short delay
    initialCheck();
    const delayedCheck = setTimeout(initialCheck, 1000);

    // Auto-retry if audio doesn't load within 10 seconds
    const loadTimeout = setTimeout(() => {
      if (!checkAndUpdateAudioState()) {
        console.warn('🚨 Audio loading timeout, trying to reload...');
        setAudioError(
          'Audio loading is taking too long. Click "Reload" to try again.'
        );
      }
    }, 10000);

    return () => {
      clearTimeout(loadTimeout);
      clearTimeout(delayedCheck);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioPath, audioLoaded]); // Add audioLoaded to dependencies

  // Periodic check for stuck loading state
  useEffect(() => {
    if (!audioLoaded && !audioError && audioPath) {
      const checkInterval = setInterval(() => {
        const audio = audioRef.current;
        if (audio && audio.readyState >= 2 && audio.duration > 0) {
          console.log('🔄 Periodic check: Audio is ready, updating state');
          setAudioDuration(audio.duration);
          setAudioLoaded(true);
          setAudioError(null);
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(checkInterval);
    }
  }, [audioLoaded, audioError, audioPath]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    if (session && answers.length > 0) {
      const saveInterval = setInterval(() => {
        console.log('Auto-saving progress...');
      }, 30000);
      return () => clearInterval(saveInterval);
    }
  }, [session, answers]);

  // Audio control functions
  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio || !audioLoaded) {
      console.warn('🎵 Audio not ready for playback');
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('🚨 Play failed:', error);
        setAudioError('Failed to play audio. Try clicking play again.');
      });
    }
  };

  const seekAudio = (time: number) => {
    const audio = audioRef.current;
    if (!audio || !audioLoaded) {
      console.warn('🎵 Audio not ready for seeking');
      return;
    }

    audio.currentTime = time;
    setAudioCurrentTime(time);
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setAudioCurrentTime(0);
    setIsPlaying(false);
    audio.pause();
  };

  const forceCheckAudioState = () => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('🔍 Force checking audio state...');
    console.log('Current audio state:', {
      readyState: audio.readyState,
      duration: audio.duration,
      currentTime: audio.currentTime,
      paused: audio.paused,
      error: audio.error,
      src: audio.src,
      networkState: audio.networkState,
    });

    // Force update state based on actual audio state
    if (audio.readyState >= 2 && audio.duration > 0) {
      console.log('🎵 Audio is actually ready, forcing state update');
      setAudioDuration(audio.duration);
      setAudioLoaded(true);
      setAudioError(null);
      setAudioCurrentTime(audio.currentTime);
    } else {
      console.log('❌ Audio not ready yet');
      setAudioLoaded(false);
    }
  };

  const handleAnswerChange = (
    questionId: string,
    answer: string | string[]
  ) => {
    const newAnswers = answers.map((ans) =>
      ans.questionId === questionId ? { ...ans, answer } : ans
    );
    setAnswers(newAnswers);
  };

  const toggleMarkQuestion = (questionId: string) => {
    const newAnswers = answers.map((ans) =>
      ans.questionId === questionId ? { ...ans, isMarked: !ans.isMarked } : ans
    );
    setAnswers(newAnswers);
  };

  const goToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < allSections.length) {
      setCurrentSectionIndex(sectionIndex);

      // Reset audio when switching sections in listening tests
      if (testSkill.toLowerCase() === 'listening') {
        resetAudio();
      }
    }
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

  // Helper function to find section index for a question

  const handleSubmitTest = async () => {
    if (!session || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const answersToScore = answers
        .filter(
          (answer) => answer.answer && answer.answer.toString().trim() !== ''
        )
        .map((answer) => ({
          questionId: answer.questionId,
          answer: answer.answer,
        }));

      console.log(
        '🎯 Starting test submission for',
        answersToScore.length,
        'answers'
      );

      let scoringResults = [];

      if (testSkill.toLowerCase() === 'writing') {
        scoringResults = answersToScore.map((answer) => ({
          questionId: answer.questionId,
          result: {
            isCorrect: true,
            marksAwarded: 0,
            maxMarks: test
              ? findQuestionInTest(answer.questionId, test)?.marks || 1
              : 1,
            feedback: 'Writing submitted - pending AI evaluation',
          },
        }));
      } else {
        scoringResults = AnswerComparisonService.scoreAllAnswers(
          answersToScore,
          test
        );
      }

      const stats = AnswerComparisonService.generateStatistics(scoringResults);

      const responsesToSubmit = scoringResults.map((result) => {
        const userAnswer = answersToScore.find(
          (a) => a.questionId === result.questionId
        );
        return {
          UserTestId: session.userTestId,
          QuestionId: result.questionId,
          UserAnswer: Array.isArray(userAnswer?.answer)
            ? userAnswer.answer.join(',')
            : userAnswer?.answer?.toString() || '',
          MarksRewarded: result.result.marksAwarded,
        };
      });

      if (responsesToSubmit.length > 0) {
        await api.userResponse.submitMultipleAnswers(responsesToSubmit as any);
      }

      // Create feedback message
      let feedback = `Test completed with ${stats.correctAnswers} out of ${stats.totalQuestions} questions answered.`;

      if (testSkill.toLowerCase() === 'writing') {
        const totalWords = answersToScore.reduce((sum, answer) => {
          return (
            sum + WritingEvaluationService.getWordCount(answer.answer as string)
          );
        }, 0);

        feedback += ` Writing tasks submitted with ${totalWords} total words. AI evaluation pending.`;
      } else {
        feedback += ` Score: ${stats.marksAwarded}/${stats.totalMarks} (${stats.percentage}%)`;
      }

      const userTestUpdate = {
        status: 'completed',
        feedback,
        numCorrectAnswer: stats.correctAnswers,
      };

      await api.userTest.updateUserTest(session.userTestId, userTestUpdate);

      // Navigate based on test type
      if (testSkill.toLowerCase() === 'writing') {
        // Redirect to writing evaluation page
        navigate(
          `/learner/test/${testId}/writing-result/${session.userTestId}`
        );
      } else {
        // Regular test results page
        navigate(`/learner/test/${testId}/result/${session.userTestId}`);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Text highlighting for reading
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString().trim();
      if (selectedText.length > 0) {
        const newHighlight: Highlight = {
          id: Date.now().toString(),
          text: selectedText,
          startIndex: 0,
          endIndex: selectedText.length,
        };

        setHighlights((prev) => {
          const exists = prev.some((h) => h.text === selectedText);
          if (exists) return prev;
          return [...prev, newHighlight];
        });

        selection.removeAllRanges();
      }
    }
  };

  const removeHighlight = (highlightId: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
  };

  const clearAllHighlights = () => {
    setHighlights([]);
  };

  const renderHighlightedText = (text: string): React.ReactNode => {
    if (highlights.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const textToCheck = text.toLowerCase();

    highlights.forEach((highlight, highlightIndex) => {
      const searchText = highlight.text.toLowerCase();
      let startIndex = textToCheck.indexOf(searchText, lastIndex);

      while (startIndex !== -1) {
        if (startIndex > lastIndex) {
          parts.push(text.substring(lastIndex, startIndex));
        }

        const originalText = text.substring(
          startIndex,
          startIndex + highlight.text.length
        );
        parts.push(
          <mark
            key={`${highlightIndex}-${startIndex}`}
            className="bg-yellow-300/30 px-1 rounded cursor-pointer hover:bg-yellow-300/50 transition-colors"
            onClick={() => removeHighlight(highlight.id)}
            title="Click to remove highlight"
          >
            {originalText}
          </mark>
        );

        lastIndex = startIndex + highlight.text.length;
        startIndex = textToCheck.indexOf(searchText, lastIndex);
      }
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const renderQuestion = (question: Question, index: number) => {
    if (!question) return null;

    const currentAnswer = getCurrentAnswer(question.questionId);

    // Parse question content if it's JSON
    let questionContent;
    let questionType = 'text';
    let options: Record<string, string> = {};
    let questionText = '';
    let instruction = '';

    try {
      if (typeof question.content === 'object') {
        questionContent = question.content;
        questionType = questionContent.type || 'text';
        options = questionContent.options || {};
        questionText = questionContent.question || '';
        instruction = questionContent.instruction || '';
      } else if (typeof question.content === 'string') {
        // Try to parse JSON string
        try {
          questionContent = JSON.parse(question.content);
          questionType = questionContent.type || 'text';
          options = questionContent.options || {};
          questionText = questionContent.question || question.content;
          instruction = questionContent.instruction || '';
        } catch {
          // If not JSON, treat as plain text
          questionText = question.content;
          questionType = 'text';
        }
      }
    } catch (error) {
      console.error('Error parsing question content:', error);
      questionText =
        typeof question.content === 'string'
          ? question.content
          : JSON.stringify(question.content);
      questionType = 'text';
    }

    const isMarked = answers.find(
      (ans) => ans.questionId === question.questionId
    )?.isMarked;

    return (
      <Card
        key={question.questionId}
        className="bg-gray-800/50 border-gray-700 mb-6"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-200">
              Question {question.questionNumber || index + 1}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({question.marks} mark{question.marks !== 1 ? 's' : ''})
              </span>
            </CardTitle>
            <Button
              onClick={() => toggleMarkQuestion(question.questionId)}
              variant="outline"
              size="sm"
              className={`${
                isMarked
                  ? 'border-yellow-500/80 text-yellow-400 bg-yellow-500/20'
                  : 'border-gray-700 text-gray-500'
              }`}
            >
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
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {isMarked ? 'Marked' : 'Mark'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Question Text */}
            <div className="text-gray-200 mb-4">{questionText}</div>

            {/* Instruction */}
            {instruction && (
              <div className="text-sm text-gray-400 mb-4 p-2 bg-gray-800/30 rounded italic">
                {instruction}
              </div>
            )}

            {/* Render different question types */}
            {questionType === 'multiple_choice' &&
            Object.keys(options).length > 0 ? (
              // Multiple Choice Questions
              <div className="space-y-3">
                {Object.entries(options).map(([key, value]) => (
                  <label
                    key={key}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      currentAnswer === key
                        ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.questionId}`}
                      value={key}
                      checked={currentAnswer === key}
                      onChange={(e) =>
                        handleAnswerChange(question.questionId, e.target.value)
                      }
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="text-sm leading-relaxed">{value}</div>
                    </div>
                  </label>
                ))}

                {/* Show selected answer */}
                {currentAnswer && (
                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-300 text-sm">
                    ✓ Selected: {currentAnswer}
                  </div>
                )}
              </div>
            ) : (
              // Default text input for other question types
              <div className="space-y-3">
                <input
                  type="text"
                  value={currentAnswer as string}
                  onChange={(e) =>
                    handleAnswerChange(question.questionId, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500">
                  Tip: For multiple answers, separate with commas
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Writing question renderer
  const renderWritingQuestion = (question: Question, index: number) => {
    if (!question) return null;

    const currentAnswer = getCurrentAnswer(question.questionId) as string;
    const wordCount = WritingEvaluationService.getWordCount(currentAnswer);

    // Parse question content
    let questionContent;
    let questionText = '';
    let instruction = '';

    try {
      if (typeof question.content === 'object') {
        questionContent = question.content;
      } else if (typeof question.content === 'string') {
        try {
          questionContent = JSON.parse(question.content);
        } catch {
          questionText = question.content;
        }
      }

      if (questionContent) {
        questionText = questionContent.question || questionContent.text || '';
        instruction = questionContent.instruction || '';
      }
    } catch (error) {
      console.error('Error parsing question content:', error);
      questionText =
        typeof question.content === 'string'
          ? question.content
          : JSON.stringify(question.content);
    }

    const isMarked = answers.find(
      (ans) => ans.questionId === question.questionId
    )?.isMarked;
    const taskType = currentSectionIndex === 0 ? 'Task 1' : 'Task 2';
    const minWords = taskType === 'Task 1' ? 150 : 250;

    return (
      <Card
        key={question.questionId}
        className="bg-gray-800/50 border-gray-700 mb-6"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-200">
              {taskType} - Question {question.questionNumber || index + 1}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({question.marks} mark{question.marks !== 1 ? 's' : ''})
              </span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {/* Word count indicator */}
              <div className="text-center px-3 py-1 bg-gray-800/70 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400">Words</div>
                <div
                  className={`text-sm font-semibold ${
                    wordCount >= minWords
                      ? 'text-green-400'
                      : wordCount >= minWords * 0.7
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {wordCount}
                </div>
              </div>

              <Button
                onClick={() => toggleMarkQuestion(question.questionId)}
                variant="outline"
                size="sm"
                className={`${
                  isMarked
                    ? 'border-yellow-500/80 text-yellow-400 bg-yellow-500/20'
                    : 'border-gray-700 text-gray-500'
                }`}
              >
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
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {isMarked ? 'Marked' : 'Mark'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Question Text */}
            <div className="text-gray-200 mb-4">{questionText}</div>

            {/* Instruction */}
            {instruction && (
              <div className="text-sm text-gray-400 mb-4 p-2 bg-gray-800/30 rounded italic">
                {instruction}
              </div>
            )}

            {/* Writing Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  Word count:{' '}
                  <span
                    className={`font-semibold ${
                      wordCount < minWords
                        ? 'text-red-400'
                        : wordCount < minWords * 1.3
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}
                  >
                    {wordCount}
                  </span>
                </span>
                <span>
                  Target: {minWords}+ words for {taskType}
                </span>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) =>
                  handleAnswerChange(question.questionId, e.target.value)
                }
                placeholder={`Write your ${taskType.toLowerCase()} response here...\n\n${
                  taskType === 'Task 1'
                    ? 'Describe the visual information clearly and accurately. Include an overview of main trends and specific details with comparisons.'
                    : 'Present your argument clearly with examples and explanations. Structure your essay with introduction, body paragraphs, and conclusion.'
                }`}
                className="w-full h-80 px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              />

              {/* Writing Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>
                    {Math.min(100, Math.round((wordCount / minWords) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      wordCount >= minWords
                        ? 'bg-green-500'
                        : wordCount >= minWords * 0.7
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (wordCount / minWords) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span
                    className={
                      wordCount >= 20 ? 'text-green-400' : 'text-gray-500'
                    }
                  >
                    {wordCount >= 20 ? '✓' : '○'} Started (
                    {wordCount >= 20 ? 'Started' : 'Start writing'})
                  </span>
                  <span
                    className={
                      wordCount >= minWords * 0.6
                        ? 'text-green-400'
                        : 'text-gray-500'
                    }
                  >
                    {wordCount >= minWords * 0.6 ? '✓' : '○'} Developing (
                    {Math.round(minWords * 0.6)}+ words)
                  </span>
                  <span
                    className={
                      wordCount >= minWords ? 'text-green-400' : 'text-gray-500'
                    }
                  >
                    {wordCount >= minWords ? '✓' : '○'} Complete ({minWords}+
                    words)
                  </span>
                </div>

                <div className="text-blue-400">
                  {taskType === 'Task 2'
                    ? '🤖 AI evaluation after submit'
                    : '👨‍🏫 Manual review required'}
                </div>
              </div>

              {/* Quick Tips for current status */}
              {wordCount < 50 && (
                <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <div className="text-blue-300 text-sm font-medium mb-1">
                    {taskType} Quick Start:
                  </div>
                  <div className="text-blue-200 text-xs space-y-1">
                    {taskType === 'Task 1' ? (
                      <>
                        <div>1. Start with an overview of what you see</div>
                        <div>2. Describe the main trends or features</div>
                        <div>3. Include specific data and comparisons</div>
                      </>
                    ) : (
                      <>
                        <div>1. State your position in the introduction</div>
                        <div>2. Present your main arguments with examples</div>
                        <div>3. Address opposing views if relevant</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReadingSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-250px)]">
      {/* Reading Passage */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-6 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Reading Passage
              </h3>
              <div className="text-sm text-gray-500">
                Section {currentSectionIndex + 1} of {allSections.length}
              </div>
            </div>
            {highlights.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {highlights.length} highlight
                  {highlights.length > 1 ? 's' : ''}
                </span>
                <Button
                  onClick={clearAllHighlights}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400 text-xs"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-800/30 rounded">
            💡 <strong>Reading Tips:</strong> Select text to highlight it •
            Click highlights to remove
          </div>
        </div>

        {/* Section Image if exists */}
        {currentSection?.imagePath && (
          <div className="mb-6">
            <img
              src={currentSection.imagePath}
              alt="Section visual"
              className="w-full max-h-64 object-contain rounded-lg border border-gray-700"
            />
          </div>
        )}

        <div
          className="text-gray-300 leading-relaxed select-text cursor-text"
          onMouseUp={handleTextSelection}
          style={{ lineHeight: '1.8' }}
        >
          {test?.testParts?.[0]?.content
            ?.split('\n\n')
            .map((paragraph: string, index: number) => (
              <p key={index} className="mb-4 text-justify">
                {renderHighlightedText(paragraph)}
              </p>
            )) || (
            <div className="text-gray-500 italic">
              No passage content available
            </div>
          )}
        </div>

        {/* Highlights List */}
        {highlights.length > 0 && (
          <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="text-gray-300 text-sm font-medium mb-2">
              Your Highlights ({highlights.length}):
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="flex items-center justify-between p-2 bg-gray-700/50 rounded text-xs"
                >
                  <div className="text-gray-300 truncate flex-1 mr-2">
                    "{highlight.text.substring(0, 50)}
                    {highlight.text.length > 50 ? '...' : ''}"
                  </div>
                  <Button
                    onClick={() => removeHighlight(highlight.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 h-5 w-5 p-0 flex-shrink-0"
                    title="Remove highlight"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Questions Panel */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-y-auto">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Questions ({currentSection?.questions?.length || 0})
            </h3>
            {currentSection?.instructions && (
              <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-800/50 rounded-lg">
                <strong>Instructions:</strong> {currentSection.instructions}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {currentSection?.questions?.map((question, index) =>
              renderQuestion(question, index)
            ) || (
              <div className="text-center py-8 text-gray-400">
                No questions available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderListeningSection = () => (
    <div className="space-y-6">
      {/* Audio Player */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-200">
              Listening Section {currentSectionIndex + 1}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowTranscript(!showTranscript)}
                variant="outline"
                className="border-gray-700 text-gray-400"
                disabled
                title="Transcripts available after test completion"
              >
                Transcript
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentSection?.instructions && (
            <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-800/50 rounded-lg">
              <strong>Instructions:</strong> {currentSection.instructions}
            </div>
          )}

          {/* Section Image if exists */}
          {currentSection?.imagePath && (
            <div className="mb-4">
              <img
                src={currentSection.imagePath}
                alt="Section visual"
                className="w-full max-h-48 object-contain rounded-lg border border-gray-700"
              />
            </div>
          )}

          {/* Real Audio Player */}
          {audioPath ? (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={audioPath}
                preload="auto"
                crossOrigin="anonymous"
                className="hidden"
              />

              {audioError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>❌</span>
                    <span>{audioError}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Try refreshing the page or contact support if the issue
                    persists.
                  </div>
                </div>
              )}

              {/* Enhanced Loading State */}
              {!audioLoaded && !audioError && (
                <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                    <span className="text-blue-300">Loading audio file...</span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Audio URL: {audioPath}</div>
                    <div>
                      File type: {audioPath.split('.').pop()?.toUpperCase()}
                    </div>
                    <div>
                      Source:{' '}
                      {audioPath.includes('cloudinary.com')
                        ? 'Cloudinary CDN'
                        : 'External'}
                    </div>
                  </div>

                  {/* Quick URL Test */}
                  <div className="flex space-x-2 mt-2">
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch(audioPath, {
                            method: 'HEAD',
                          });
                          if (response.ok) {
                            console.log('✅ Audio URL is accessible');
                            console.log(
                              'Content-Type:',
                              response.headers.get('content-type')
                            );
                            console.log(
                              'Content-Length:',
                              response.headers.get('content-length')
                            );
                          } else {
                            console.error(
                              '❌ Audio URL not accessible:',
                              response.status
                            );
                          }
                        } catch (error) {
                          console.error('❌ Network error:', error);
                        }
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      Test URL
                    </Button>

                    <Button
                      onClick={forceCheckAudioState}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs"
                    >
                      ⚡ Force Check
                    </Button>
                  </div>

                  {/* State Mismatch Warning */}
                  {(() => {
                    const audio = audioRef.current;
                    if (audio) {
                      const readyStateTexts = {
                        0: 'HAVE_NOTHING',
                        1: 'HAVE_METADATA',
                        2: 'HAVE_CURRENT_DATA',
                        3: 'HAVE_FUTURE_DATA',
                        4: 'HAVE_ENOUGH_DATA',
                      };

                      return (
                        <div className="mt-2 p-2 bg-gray-800/50 border border-gray-600 rounded text-xs">
                          <div>
                            Ready State: {audio.readyState} (
                            {
                              readyStateTexts[
                                audio.readyState as keyof typeof readyStateTexts
                              ]
                            }
                            )
                          </div>
                          <div>Duration: {audio.duration || 'Not loaded'}</div>
                          <div>Network State: {audio.networkState}</div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Audio Ready Warning */}
                  {(() => {
                    const audio = audioRef.current;
                    if (audio && audio.readyState >= 2 && audio.duration > 0) {
                      return (
                        <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-300 text-xs">
                          ⚠️ Audio is ready but UI stuck. Click "Force Check" to
                          fix.
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Custom Audio Controls */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={toggleAudio}
                      disabled={
                        !audioLoaded &&
                        !(audioRef.current && audioRef.current.readyState >= 2)
                      }
                      className={`${
                        isPlaying
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } ${
                        !audioLoaded &&
                        !(audioRef.current && audioRef.current.readyState >= 2)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {!audioLoaded ? (
                        audioRef.current && audioRef.current.readyState >= 2 ? (
                          <div className="flex items-center space-x-2">
                            <span>⚡</span>
                            <span>{isPlaying ? 'Pause' : 'Play'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Loading...</span>
                          </div>
                        )
                      ) : isPlaying ? (
                        '⏸️ Pause'
                      ) : (
                        '▶️ Play'
                      )}
                    </Button>
                  </div>

                  <div className="text-sm text-gray-400">
                    {audioLoaded ||
                    (audioRef.current && audioRef.current.readyState >= 2)
                      ? `${formatTime(
                          Math.floor(audioCurrentTime)
                        )} / ${formatTime(
                          Math.floor(
                            audioDuration || audioRef.current?.duration || 0
                          )
                        )}`
                      : 'Loading audio...'}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div
                    className={`w-full bg-gray-700 rounded-full h-3 ${
                      audioLoaded ||
                      (audioRef.current && audioRef.current.readyState >= 2)
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      const audio = audioRef.current;
                      if (!audio || (!audioLoaded && audio.readyState < 2))
                        return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      const duration = audioDuration || audio.duration || 0;
                      const newTime = percentage * duration;
                      seekAudio(newTime);
                    }}
                  >
                    <div
                      className={`h-3 rounded-full transition-all duration-100 ${
                        audioLoaded ||
                        (audioRef.current && audioRef.current.readyState >= 2)
                          ? 'bg-blue-600'
                          : 'bg-gray-600'
                      }`}
                      style={{
                        width: (() => {
                          const duration =
                            audioDuration || audioRef.current?.duration || 0;
                          return duration > 0
                            ? `${(audioCurrentTime / duration) * 100}%`
                            : '0%';
                        })(),
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {audioLoaded ||
                    (audioRef.current && audioRef.current.readyState >= 2)
                      ? 'Click on the progress bar to seek to a specific time'
                      : 'Audio loading...'}
                  </div>
                </div>

                {/* Manual Audio Control Bypass */}
                {!audioLoaded &&
                  audioRef.current &&
                  audioRef.current.readyState >= 2 && (
                    <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-xs">
                      🎵 Audio is ready! Controls are enabled even though
                      loading indicator is stuck.
                    </div>
                  )}

                {/* Fallback HTML5 Audio Controls */}
                {audioError && (
                  <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <div className="text-gray-300 text-sm mb-2">
                      Fallback Audio Player:
                    </div>
                    <audio controls className="w-full" src={audioPath}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>

              {showTranscript && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-gray-300 font-medium mb-2">Note:</h4>
                  <div className="text-gray-400 text-sm">
                    In a real IELTS test, audio transcripts are only available
                    after completion.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300">
              <p className="text-sm">
                ⚠️ No audio file available for this listening test. Contact your
                administrator.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Expected audio at: test.audioPath
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-gray-200">
                Questions ({currentSection?.questions?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentSection?.questions?.map((question, index) =>
                  renderQuestion(question, index)
                ) || (
                  <div className="text-center py-8 text-gray-400">
                    No questions available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Area */}
        <div>
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-gray-200">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes here..."
                className="w-full h-64 px-3 py-2 bg-gray-800/80 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="text-xs text-gray-500 mt-2">
                Notes are for your reference only
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderWritingSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Writing Area */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-200">
                Writing Section {currentSectionIndex + 1}
                <span className="text-sm text-gray-400 ml-2">
                  ({currentSection?.questions?.length || 0} task
                  {(currentSection?.questions?.length || 0) !== 1 ? 's' : ''})
                </span>
              </CardTitle>
              <Button
                onClick={() => setShowWritingHelper(!showWritingHelper)}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-400 hover:border-gray-600"
              >
                {showWritingHelper ? 'Hide' : 'Show'} Writing Assistant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentSection?.instructions && (
              <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-800/50 rounded-lg">
                <strong>Instructions:</strong> {currentSection.instructions}
              </div>
            )}

            {/* Section Image if exists */}
            {currentSection?.imagePath && (
              <div className="mb-6">
                <img
                  src={currentSection.imagePath}
                  alt="Section visual"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-700"
                />
              </div>
            )}

            {/* Notice about post-submission evaluation */}
            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <div className="text-blue-300 text-sm font-medium mb-1">
                🤖 AI Writing Evaluation
              </div>
              <div className="text-blue-200 text-xs">
                Your writing will be automatically evaluated by our AI system
                after you submit the test. You'll receive detailed feedback,
                band scores, and improvement suggestions.
              </div>
            </div>

            <div className="space-y-6">
              {currentSection?.questions?.map((question, index) =>
                renderWritingQuestion(question, index)
              ) || (
                <div className="text-center py-8 text-gray-400">
                  No questions available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Writing Assistant Panel */}
      {showWritingHelper && (
        <div className="space-y-4">
          {currentSection?.questions?.map((question) => {
            const currentAnswer = getCurrentAnswer(
              question.questionId
            ) as string;

            return (
              <SimplifiedWritingPanel
                key={question.questionId}
                question={question}
                sectionNumber={currentSectionIndex + 1}
                essayText={currentAnswer}
                isVisible={true}
                taskType={currentSectionIndex === 0 ? 'Task 1' : 'Task 2'}
              />
            );
          }) || (
            <div className="text-center py-8 text-gray-400">
              No writing assistant available
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderDefaultSection = () => (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-gray-200">
          Section {currentSectionIndex + 1}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentSection?.instructions && (
          <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-800/50 rounded-lg">
            <strong>Instructions:</strong> {currentSection.instructions}
          </div>
        )}

        {/* Section Image if exists */}
        {currentSection?.imagePath && (
          <div className="mb-6">
            <img
              src={currentSection.imagePath}
              alt="Section visual"
              className="w-full max-h-64 object-contain rounded-lg border border-gray-700"
            />
          </div>
        )}

        <div className="space-y-6">
          {currentSection?.questions?.map((question, index) =>
            renderQuestion(question, index)
          ) || (
            <div className="text-center py-8 text-gray-400">
              No questions available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSectionContent = () => {
    if (!currentSection) {
      return (
        <div className="text-center py-12 text-gray-400">
          <div className="mb-4">No questions available in this section</div>
        </div>
      );
    }

    const skill = testSkill.toLowerCase();

    switch (skill) {
      case 'reading':
        return renderReadingSection();
      case 'listening':
        return renderListeningSection();
      case 'writing':
        return renderWritingSection();
      default:
        return renderDefaultSection();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-white text-lg">Loading test...</div>
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
          <Button
            onClick={() => navigate('/tests')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  // No test data
  if (!test || !session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Test not found</div>
          <Button
            onClick={() => navigate('/tests')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-gray-200">
      {/* Test Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-200">
                {test.testName}
              </h1>
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm text-gray-100 capitalize">
                {testSkill}
              </span>
              {testSkill.toLowerCase() === 'listening' && audioPath && (
                <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                  🎵 Audio Available
                </span>
              )}
              {testSkill.toLowerCase() === 'writing' && (
                <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                  🤖 AI Evaluation
                </span>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-500">
                Section {currentSectionIndex + 1} of {allSections.length}
              </div>

              <div className="text-sm text-gray-500">
                Answered: {getAnsweredCount()}/{getTotalQuestions()}
              </div>

              <div
                className={`text-lg font-mono ${
                  timeRemaining < 300 ? 'text-red-400' : 'text-blue-400'
                }`}
              >
                {formatTime(timeRemaining)}
              </div>

              <Button
                onClick={() => setShowConfirmDialog(true)}
                variant="outline"
                className="border-red-500/80 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                Submit Test
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentSectionIndex + 1) / allSections.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {renderSectionContent()}

        {/* Section Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            onClick={() => goToSection(currentSectionIndex - 1)}
            disabled={currentSectionIndex === 0}
            variant="outline"
            className="border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/50"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous Section
          </Button>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">
              {getMarkedCount() > 0 && `Marked: ${getMarkedCount()} • `}
              Progress: {getAnsweredCount()}/{getTotalQuestions()} questions
            </div>

            {/* Section indicators */}
            <div className="flex items-center space-x-2">
              {allSections.map((section, sectionIdx) => {
                const sectionQuestions = section?.questions || [];
                const answeredInSection = sectionQuestions.filter(
                  (q) =>
                    answers.find((ans) => ans.questionId === q.questionId)
                      ?.answer
                ).length;
                const isCurrent = sectionIdx === currentSectionIndex;

                return (
                  <button
                    key={sectionIdx}
                    onClick={() => goToSection(sectionIdx)}
                    className={`w-10 h-10 rounded text-xs font-medium transition-all duration-200 ${
                      isCurrent
                        ? 'bg-blue-600 text-gray-100 ring-2 ring-blue-400'
                        : answeredInSection === sectionQuestions.length &&
                          sectionQuestions.length > 0
                        ? 'bg-green-600 text-gray-100 hover:bg-green-700'
                        : answeredInSection > 0
                        ? 'bg-yellow-600 text-gray-100 hover:bg-yellow-700'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    title={`Section ${sectionIdx + 1} (${answeredInSection}/${
                      sectionQuestions.length
                    })`}
                  >
                    {sectionIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={() => goToSection(currentSectionIndex + 1)}
            disabled={currentSectionIndex === allSections.length - 1}
            className="bg-blue-600/90 hover:bg-blue-600 text-gray-100"
          >
            Next Section
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-700 max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">
                Submit Test?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                Are you sure you want to submit your test? You have answered{' '}
                {getAnsweredCount()} out of {getTotalQuestions()} questions.
              </p>

              {getAnsweredCount() < getTotalQuestions() && (
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    Warning: You have {getTotalQuestions() - getAnsweredCount()}{' '}
                    unanswered questions.
                  </p>
                </div>
              )}

              {testSkill.toLowerCase() === 'writing' && (
                <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    🤖 Your writing will be evaluated by AI after submission.
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowConfirmDialog(false)}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600/90 hover:bg-blue-600"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TestTakingPage;
