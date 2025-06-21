// components/SimplifiedWritingPanel.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WritingEvaluationService from '@/service/WritingEvaluationService';
import type { Question } from '@/types';

interface SimplifiedWritingPanelProps {
  question: Question;
  sectionNumber: number;
  essayText: string;
  isVisible: boolean;
  taskType?: 'Task 1' | 'Task 2';
}

export const SimplifiedWritingPanel: React.FC<SimplifiedWritingPanelProps> = ({
  question,
  sectionNumber,
  essayText,
  isVisible,
  taskType,
}) => {
  const [showSampleEssay, setShowSampleEssay] = useState(false);
  const [sampleEssay, setSampleEssay] = useState<string>('');
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const isEvaluatable = WritingEvaluationService.isEvaluatable(
    question,
    sectionNumber
  );
  const wordCount = WritingEvaluationService.getWordCount(essayText);
  const questionText = WritingEvaluationService.extractQuestionText(question);
  const writingTips = WritingEvaluationService.getWritingTips(
    wordCount,
    sectionNumber === 2
  );

  // Determine task type from question or section
  const determinedTaskType =
    taskType || (sectionNumber === 1 ? 'Task 1' : 'Task 2');

  const handleGenerateSample = async () => {
    setIsGeneratingSample(true);

    try {
      const response = await WritingEvaluationService.generateSampleEssay({
        question: questionText,
        score: '7.0',
      });

      setSampleEssay(response.essay);
      setShowSampleEssay(true);
    } catch (error) {
      console.error('❌ Sample essay generation failed:', error);
      setSampleEssay('Error generating sample essay. Please try again later.');
      setShowSampleEssay(true);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const getWordCountStatus = (): {
    color: string;
    message: string;
    icon: string;
  } => {
    const minWords = determinedTaskType === 'Task 1' ? 150 : 250;
    const optimalWords = determinedTaskType === 'Task 1' ? 200 : 320;

    if (wordCount < minWords) {
      return {
        color: 'text-red-400',
        message: `Need ${minWords - wordCount} more words to reach minimum`,
        icon: '⚠️',
      };
    } else if (wordCount < optimalWords) {
      return {
        color: 'text-yellow-400',
        message: `Good progress! ${
          optimalWords - wordCount
        } more for optimal length`,
        icon: '📝',
      };
    } else if (wordCount > 400) {
      return {
        color: 'text-orange-400',
        message: 'Essay is quite long. Focus on quality over quantity',
        icon: '📏',
      };
    } else {
      return {
        color: 'text-green-400',
        message: 'Perfect word count range!',
        icon: '✅',
      };
    }
  };

  const getTaskSpecificTips = (): string[] => {
    if (determinedTaskType === 'Task 1') {
      return [
        '📊 Describe the main trends and key features clearly',
        '📈 Include specific data and make comparisons',
        '🎯 Write an overview paragraph summarizing main trends',
        '⏰ Aim for 150-200 words (currently: ' + wordCount + ')',
        '🔍 Use varied vocabulary to describe changes and comparisons',
      ];
    } else {
      return [
        '💭 State your position clearly in the introduction',
        '📝 Develop each main point with examples and explanations',
        '🏗️ Structure: Introduction → Body paragraphs → Conclusion',
        '⏰ Aim for 250-320 words (currently: ' + wordCount + ')',
        '🎓 Use linking words to connect your ideas smoothly',
      ];
    }
  };

  const getProgressIndicators = () => {
    const minWords = determinedTaskType === 'Task 1' ? 150 : 250;
    const optimalWords = determinedTaskType === 'Task 1' ? 200 : 320;

    return [
      {
        label: 'Started',
        threshold: 20,
        status: wordCount >= 20 ? 'complete' : 'pending',
      },
      {
        label: 'Developing',
        threshold: Math.floor(minWords * 0.6),
        status:
          wordCount >= Math.floor(minWords * 0.6)
            ? 'complete'
            : wordCount > 20
            ? 'active'
            : 'pending',
      },
      {
        label: 'Minimum Length',
        threshold: minWords,
        status:
          wordCount >= minWords
            ? 'complete'
            : wordCount > Math.floor(minWords * 0.6)
            ? 'active'
            : 'pending',
      },
      {
        label: 'Optimal Length',
        threshold: optimalWords,
        status:
          wordCount >= optimalWords
            ? 'complete'
            : wordCount > minWords
            ? 'active'
            : 'pending',
      },
    ];
  };

  if (!isVisible) return null;

  const wordCountStatus = getWordCountStatus();
  const taskTips = getTaskSpecificTips();
  const progressIndicators = getProgressIndicators();

  return (
    <div className="space-y-4">
      {/* Task Overview */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-200 flex items-center">
            <span className="mr-2">
              {determinedTaskType === 'Task 1' ? '📊' : '📝'}
            </span>
            {determinedTaskType} Writing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Word Count Display */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Word Count</div>
                <div className={`text-2xl font-bold ${wordCountStatus.color}`}>
                  {wordCount}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm ${wordCountStatus.color} flex items-center`}
                >
                  <span className="mr-2">{wordCountStatus.icon}</span>
                  {wordCountStatus.message}
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            <div>
              <div className="text-sm text-gray-400 mb-2">Writing Progress</div>
              <div className="flex items-center space-x-2">
                {progressIndicators.map((indicator, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        indicator.status === 'complete'
                          ? 'bg-green-400 border-green-400'
                          : indicator.status === 'active'
                          ? 'bg-blue-400 border-blue-400'
                          : 'border-gray-600'
                      }`}
                    ></div>
                    <div
                      className={`text-xs mt-1 text-center ${
                        indicator.status === 'complete'
                          ? 'text-green-400'
                          : indicator.status === 'active'
                          ? 'text-blue-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {indicator.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>{determinedTaskType === 'Task 1' ? '150' : '250'}</span>
                <span>{determinedTaskType === 'Task 1' ? '200+' : '320+'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Tips */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-200 flex items-center">
            <span className="mr-2">💡</span>
            {determinedTaskType} Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {taskTips.map((tip, index) => (
              <div
                key={index}
                className="text-sm text-gray-300 p-3 bg-gray-800/50 rounded flex items-start"
              >
                <span className="mr-2 text-blue-400">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Evaluation Notice */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-200 flex items-center">
            <span className="mr-2">🤖</span>
            AI Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEvaluatable ? (
            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <div className="text-blue-300 text-sm font-medium mb-2">
                ✨ AI Evaluation Available
              </div>
              <div className="text-blue-200 text-xs">
                This {determinedTaskType} will be automatically evaluated by our
                AI system after you submit the test. You'll receive detailed
                feedback and a band score prediction.
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <div className="text-yellow-300 text-sm font-medium mb-2">
                👨‍🏫 Manual Evaluation Required
              </div>
              <div className="text-yellow-200 text-xs">
                {determinedTaskType} tasks with visual elements (charts, graphs,
                diagrams) require human evaluation. Your response will be
                reviewed by qualified instructors.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Essay Generator */}
      {determinedTaskType === 'Task 2' && isEvaluatable && (
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-200 flex items-center">
                <span className="mr-2">📚</span>
                Sample Essay (Band 7.0)
              </CardTitle>
              <Button
                onClick={handleGenerateSample}
                disabled={isGeneratingSample}
                variant="outline"
                className="border-gray-700 text-gray-400 hover:border-gray-600"
                size="sm"
              >
                {isGeneratingSample ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate Sample'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showSampleEssay ? (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 mb-2">
                  AI-generated sample essay for reference only
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 max-h-64 overflow-y-auto">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {sampleEssay}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowSampleEssay(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-400"
                  >
                    Hide Sample
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Generate a sample essay to see how a Band 7.0 response looks for
                this question
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* General Writing Tips */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-200 flex items-center">
            <span className="mr-2">📖</span>
            General Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {writingTips.map((tip, index) => (
              <div
                key={index}
                className="text-sm text-gray-300 p-2 bg-gray-800/50 rounded"
              >
                {tip}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
