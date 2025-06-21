// services/WritingEvaluationService.ts
import type { Question } from '@/types';

export interface WritingEvaluationRequest {
  question: string;
  essay: string;
}

export interface WritingEvaluationResponse {
  score: string; // Band score like "6.5", "7.0"
  evaluation_text: string;
}

export interface WritingSampleRequest {
  question: string;
  score: string; // Target band score
}

export interface WritingSampleResponse {
  essay: string;
}

export class WritingEvaluationService {
  private static readonly API_BASE_URL = 'http://localhost:8000'; // Adjust as needed
  
  // Environment-based URL configuration
  private static getApiUrl(): string {
    // Try to get from environment variables
    if (typeof process !== 'undefined' && process.env) {
      return process.env.REACT_APP_WRITING_API_URL || process.env.VITE_WRITING_API_URL || this.API_BASE_URL;
    }
    
    // Try Vite env
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.VITE_WRITING_API_URL || this.API_BASE_URL;
    }
    
    return this.API_BASE_URL;
  }

  /**
   * Evaluate a writing essay and get band score + feedback
   */
  static async evaluateEssay(request: WritingEvaluationRequest): Promise<WritingEvaluationResponse> {
    try {
      console.log('🔍 Evaluating essay:', {
        questionLength: request.question.length,
        essayLength: request.essay.length,
        apiUrl: this.getApiUrl()
      });

      // First get the score
      const scoreResponse = await fetch(`${this.getApiUrl()}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!scoreResponse.ok) {
        throw new Error(`Score API returned ${scoreResponse.status}: ${scoreResponse.statusText}`);
      }

      const scoreData = await scoreResponse.json();
      const bandScore = scoreData.score;

      console.log('📊 Received band score:', bandScore);

      // Then get the evaluation text
      const evalResponse = await fetch(`${this.getApiUrl()}/generate_evaltext`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!evalResponse.ok) {
        throw new Error(`Evaluation API returned ${evalResponse.status}: ${evalResponse.statusText}`);
      }

      const evalData = await evalResponse.json();

      console.log('✅ Writing evaluation completed:', {
        score: bandScore,
        evaluationLength: evalData.evaluation_text?.length || 0
      });

      return {
        score: bandScore,
        evaluation_text: evalData.evaluation_text || 'No evaluation text generated.',
      };
    } catch (error) {
      console.error('❌ Writing evaluation failed:', error);
      
      // Return fallback response
      return {
        score: '5.0',
        evaluation_text: `Error: Unable to evaluate essay at this time. ${error instanceof Error ? error.message : 'Unknown error occurred.'}`,
      };
    }
  }

  /**
   * Generate a sample essay for a given question and target band score
   */
  static async generateSampleEssay(request: WritingSampleRequest): Promise<WritingSampleResponse> {
    try {
      console.log('🔍 Generating sample essay:', {
        questionLength: request.question.length,
        targetScore: request.score,
        apiUrl: this.getApiUrl()
      });

      const response = await fetch(`${this.getApiUrl()}/generate_essay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Sample essay API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log('✅ Sample essay generated:', {
        essayLength: data.essay?.length || 0
      });

      return {
        essay: data.essay || 'No sample essay generated.',
      };
    } catch (error) {
      console.error('❌ Sample essay generation failed:', error);
      
      return {
        essay: `Error: Unable to generate sample essay. ${error instanceof Error ? error.message : 'Unknown error occurred.'}`,
      };
    }
  }

  /**
   * Check if a question is suitable for AI evaluation (Task 2 only)
   * Task 1 usually has charts/graphs which our AI can't handle
   */
  static isEvaluatable(question: Question, sectionNumber: number): boolean {
    // Only evaluate Task 2 (usually section 2)
    if (sectionNumber !== 2) {
      return false;
    }

    // Check question content for Task 2 indicators
    const questionText = this.extractQuestionText(question);
    const task2Keywords = [
      'discuss both views',
      'to what extent',
      'agree or disagree',
      'advantages and disadvantages',
      'causes and solutions',
      'problems and solutions',
      'opinion',
      'view',
      'argument',
      'essay',
      'give reasons',
      'do you think',
    ];

    const lowerQuestionText = questionText.toLowerCase();
    const hasTask2Keywords = task2Keywords.some(keyword => 
      lowerQuestionText.includes(keyword)
    );

    // Avoid Task 1 indicators
    const task1Keywords = [
      'chart',
      'graph',
      'table',
      'diagram',
      'map',
      'process',
      'bar chart',
      'line graph',
      'pie chart',
      'flow chart'
    ];

    const hasTask1Keywords = task1Keywords.some(keyword => 
      lowerQuestionText.includes(keyword)
    );

    console.log('🔍 Question evaluation check:', {
      sectionNumber,
      hasTask2Keywords,
      hasTask1Keywords,
      questionText: questionText.substring(0, 100) + '...'
    });

    return hasTask2Keywords && !hasTask1Keywords;
  }

  /**
   * Extract question text from question object
   */
  static extractQuestionText(question: Question): string {
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
      console.error('Error extracting question text:', error);
      return 'Question text unavailable';
    }
  }

  /**
   * Get word count for an essay
   */
  static getWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get writing tips based on word count and question type
   */
  static getWritingTips(wordCount: number, isTask2: boolean = true): string[] {
    const tips: string[] = [];
    const minWords = isTask2 ? 250 : 150;
    const optimalWords = isTask2 ? 320 : 200;

    if (wordCount < minWords) {
      tips.push(`⚠️ Your essay is too short. You need at least ${minWords} words (currently ${wordCount}).`);
    } else if (wordCount < optimalWords) {
      tips.push(`📝 Consider expanding your ideas. Aim for ${optimalWords}+ words for a complete response.`);
    } else if (wordCount > 400) {
      tips.push(`⏰ Your essay might be too long. Focus on quality over quantity.`);
    } else {
      tips.push(`✅ Good word count! You have ${wordCount} words.`);
    }

    if (isTask2) {
      tips.push(`💡 Task 2 Tips: Clear introduction, body paragraphs with examples, and strong conclusion.`);
    }

    return tips;
  }

  /**
   * Test API connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.getApiUrl()}/docs`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Writing API connection test failed:', error);
      return false;
    }
  }
}

export default WritingEvaluationService;