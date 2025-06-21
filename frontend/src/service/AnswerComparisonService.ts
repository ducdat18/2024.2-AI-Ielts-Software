export interface AnswerComparisonResult {
    isCorrect: boolean;
    marksAwarded: number;
    explanation?: string;
    userAnswerNormalized?: string;
    correctAnswerNormalized?: string;
  }
  
  export interface QuestionAnswer {
    questionId: string;
    correctAnswer: string;
    alternativeAnswers?: string;
    explanation?: string;
  }
  
  export class AnswerComparisonService {
    static compareAnswers(
      userAnswer: string | string[],
      questionAnswer: QuestionAnswer,
      maxMarks: number = 1
    ): AnswerComparisonResult {
      const { correctAnswer, alternativeAnswers } = questionAnswer;
      const userAnswerStr = Array.isArray(userAnswer) 
        ? userAnswer.join(',').toLowerCase().trim()
        : userAnswer.toString().toLowerCase().trim();
      
      const userAnswerNormalized = this.normalizeAnswer(userAnswerStr);
      const correctAnswerNormalized = this.normalizeAnswer(correctAnswer);
      if (userAnswerNormalized === correctAnswerNormalized) {
        return {
          isCorrect: true,
          marksAwarded: maxMarks,
          explanation: questionAnswer.explanation,
          userAnswerNormalized,
          correctAnswerNormalized
        };
      }
      
      if (alternativeAnswers) {
        const alternatives = alternativeAnswers.split(',').map(alt => alt.trim());
        for (const alt of alternatives) {
          const altNormalized = this.normalizeAnswer(alt);
          if (userAnswerNormalized === altNormalized) {
            return {
              isCorrect: true,
              marksAwarded: maxMarks,
              explanation: questionAnswer.explanation,
              userAnswerNormalized,
              correctAnswerNormalized: altNormalized
            };
          }
        }
      }
      
      const partialScore = this.checkPartialMatch(userAnswerNormalized, correctAnswerNormalized);
      if (partialScore > 0) {
        return {
          isCorrect: false,
          marksAwarded: Math.round(maxMarks * partialScore * 100) / 100, // Round to 2 decimal places
          explanation: `Partial credit: ${Math.round(partialScore * 100)}% match`,
          userAnswerNormalized,
          correctAnswerNormalized
        };
      }
      
      return {
        isCorrect: false,
        marksAwarded: 0,
        explanation: questionAnswer.explanation,
        userAnswerNormalized,
        correctAnswerNormalized
      };
    }
    
    static compareMultipleChoice(
      userAnswer: string | string[],
      correctAnswer: string,
      maxMarks: number = 1
    ): AnswerComparisonResult {
      const userAnswerStr = Array.isArray(userAnswer) 
        ? userAnswer.join(',')
        : userAnswer.toString();
      
      const isCorrect = userAnswerStr.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      
      return {
        isCorrect,
        marksAwarded: isCorrect ? maxMarks : 0,
        userAnswerNormalized: userAnswerStr.toLowerCase().trim(),
        correctAnswerNormalized: correctAnswer.toLowerCase().trim()
      };
    }
    
    static scoreWritingAnswer(
      userAnswer: string,
      maxMarks: number = 1
    ): AnswerComparisonResult {
      const wordCount = userAnswer.trim().split(/\s+/).length;
      const hasContent = userAnswer.trim().length > 50;
      
      if (!hasContent) {
        return {
          isCorrect: false,
          marksAwarded: 0,
          explanation: 'Response too short or empty'
        };
      }
      
      let score = 0;
      if (wordCount >= 150) score = 0.8; 
      else if (wordCount >= 100) score = 0.6; 
      else if (wordCount >= 50) score = 0.4; 
      
      return {
        isCorrect: score >= 0.6,
        marksAwarded: Math.round(maxMarks * score * 100) / 100,
        explanation: `Word count: ${wordCount}. ${score >= 0.6 ? 'Good response length.' : 'Consider expanding your response.'}`
      };
    }
    
    private static normalizeAnswer(answer: string): string {
      return answer
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') 
        .replace(/\s+/g, ' ')    
        .replace(/\b(a|an|the)\b/g, '') 
        .trim();
    }
    
    private static checkPartialMatch(userAnswer: string, correctAnswer: string): number {
      const userWords = userAnswer.split(' ').filter(w => w.length > 0);
      const correctWords = correctAnswer.split(' ').filter(w => w.length > 0);
      
      if (correctWords.length === 0) return 0;
      
      let matchCount = 0;
      for (const word of userWords) {
        if (correctWords.includes(word)) {
          matchCount++;
        }
      }
      
      const similarity = matchCount / correctWords.length;
      return similarity >= 0.5 ? similarity : 0;
    }
    
    static scoreAllAnswers(
      userAnswers: Array<{
        questionId: string;
        answer: string | string[];
        questionData?: any;
      }>,
      testData: any
    ): Array<{
      questionId: string;
      result: AnswerComparisonResult;
      questionData?: any;
    }> {
      const results: Array<{
        questionId: string;
        result: AnswerComparisonResult;
        questionData?: any;
      }> = [];
      
      for (const userAnswer of userAnswers) {
        const questionData = this.findQuestionById(userAnswer.questionId, testData);
        
        if (!questionData || !questionData.answer) {
          results.push({
            questionId: userAnswer.questionId,
            result: {
              isCorrect: false,
              marksAwarded: 0,
              explanation: 'Question data not found'
            },
            questionData
          });
          continue;
        }
        
        const questionAnswer: QuestionAnswer = {
          questionId: questionData.questionId,
          correctAnswer: questionData.answer.correctAnswer,
          alternativeAnswers: questionData.answer.alternativeAnswers,
          explanation: questionData.answer.explanation
        };
        let result: AnswerComparisonResult;
        const questionType = this.determineQuestionType(questionData);
        switch (questionType) {
          case 'multiple-choice':
            result = this.compareMultipleChoice(
              userAnswer.answer,
              questionAnswer.correctAnswer,
              questionData.marks || 1
            );
            break;
          case 'writing':
            result = this.scoreWritingAnswer(
              userAnswer.answer.toString(),
              questionData.marks || 1
            );
            break;
          default:
            result = this.compareAnswers(
              userAnswer.answer,
              questionAnswer,
              questionData.marks || 1
            );
        }
        
        results.push({
          questionId: userAnswer.questionId,
          result,
          questionData
        });
      }
      
      return results;
    }
    
    private static findQuestionById(questionId: string, testData: any): any {
      if (!testData?.testParts) return null;
      
      for (const part of testData.testParts) {
        if (!part.sections) continue;
        
        for (const section of part.sections) {
          if (!section.questions) continue;
          
          const question = section.questions.find((q: any) => q.questionId === questionId);
          if (question) return question;
        }
      }
      
      return null;
    }
    
    private static determineQuestionType(questionData: any): string {
      if (!questionData?.content) return 'text';
      
      const content = typeof questionData.content === 'string' 
        ? questionData.content 
        : JSON.stringify(questionData.content);
      
      if (content.includes('multiple') || content.includes('choice')) return 'multiple-choice';
      if (content.includes('essay') || content.includes('writing')) return 'writing';
      if (content.includes('fill') || content.includes('blank')) return 'fill-in-blank';
      
      return 'text';
    }
    
    static generateStatistics(results: Array<{
      questionId: string;
      result: AnswerComparisonResult;
      questionData?: any;
    }>): {
      totalQuestions: number;
      correctAnswers: number;
      totalMarks: number;
      marksAwarded: number;
      percentage: number;
      accuracy: number;
    } {
      const totalQuestions = results.length;
      const correctAnswers = results.filter(r => r.result.isCorrect).length;
      const totalMarks = results.reduce((sum, r) => sum + (r.questionData?.marks || 1), 0);
      const marksAwarded = results.reduce((sum, r) => sum + r.result.marksAwarded, 0);
      const percentage = totalMarks > 0 ? Math.round((marksAwarded / totalMarks) * 100) : 0;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      return {
        totalQuestions,
        correctAnswers,
        totalMarks,
        marksAwarded,
        percentage,
        accuracy
      };
    }
  }
  
  export default AnswerComparisonService;