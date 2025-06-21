import type { User, Question, TestSection, Test, TestListItem, AIWritingAnalysis, UserDetails, UserListItem, TestSession, TestResult, TimeSeriesPoint, SkillProgress, WeakArea, UserProgress, ProgressAnalytics, Recommendation, StudyPlan } from "./types";

// Mock Users (giữ nguyên)
export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'learner',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20'),
    profile: {
      avatar: 'https://avatar.iran.liara.run/public/50',
      phone: '+1234567890',
      dateOfBirth: new Date('1995-06-15'),
      targetScore: 7.5,
      currentLevel: 'intermediate',
      preferences: {
        notifications: {
          email: true,
          push: true,
          testReminders: true,
          progressUpdates: false
        },
        language: 'en',
        timezone: 'UTC+7'
      }
    }
  },
  {
    id: 'user-002',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'admin',
    createdAt: new Date('2023-08-10'),
    updatedAt: new Date('2024-03-19'),
    profile: {
      avatar: 'https://avatar.iran.liara.run/public/51',
      targetScore: 8.5,
      currentLevel: 'advanced',
      preferences: {
        notifications: {
          email: true,
          push: false,
          testReminders: false,
          progressUpdates: true
        },
        language: 'en',
        timezone: 'UTC+7'
      }
    }
  }
];

// Comprehensive Questions with all types
export const mockQuestions: Question[] = [
  // LISTENING QUESTIONS
  {
    id: 'q-listening-001',
    type: 'multiple-choice',
    text: 'What time does the library close on weekdays?',
    instructions: 'Choose the correct letter A, B or C.',
    points: 1,
    order: 1,
    options: [
      { id: 'A', text: '6:00 PM' },
      { id: 'B', text: '8:00 PM' },
      { id: 'C', text: '9:00 PM' }
    ],
    correctAnswer: 'B',
    explanation: 'The speaker clearly states the library closes at 8 PM on weekdays.',
    tags: ['listening', 'specific-information']
  },
  {
    id: 'q-listening-002',
    type: 'fill-in-blank',
    text: 'Student ID Number: ________',
    instructions: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
    points: 1,
    order: 2,
    correctAnswer: ['H7834521', 'H 7834521'],
    tags: ['listening', 'form-completion']
  },
  {
    id: 'q-listening-003',
    type: 'matching',
    text: 'Match each speaker to their preferred study method.',
    instructions: 'Choose the correct letter A-F for each speaker.',
    points: 3,
    order: 3,
    correctAnswer: ['A', 'C', 'E'],
    tags: ['listening', 'matching']
  },
  {
    id: 'q-listening-004',
    type: 'short-answer',
    text: 'What subject is Sarah going to study next semester?',
    instructions: 'Write NO MORE THAN TWO WORDS for your answer.',
    points: 1,
    order: 4,
    correctAnswer: ['Environmental Science', 'environmental science'],
    tags: ['listening', 'short-answer']
  },
  {
    id: 'q-listening-005',
    type: 'diagram-labeling',
    text: 'Label the parts of the university campus map.',
    instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
    points: 4,
    order: 5,
    correctAnswer: ['Student Center', 'Main Library', 'Science Building', 'Sports Complex'],
    tags: ['listening', 'diagram-labeling', 'map']
  },

  // READING QUESTIONS
  {
    id: 'q-reading-001',
    type: 'multiple-choice',
    text: 'What is the main purpose of the passage?',
    instructions: 'Choose the best answer from the options below.',
    points: 1,
    order: 1,
    options: [
      { id: 'A', text: 'To explain the causes of climate change' },
      { id: 'B', text: 'To describe solutions to environmental problems' },
      { id: 'C', text: 'To analyze the impact of renewable energy' },
      { id: 'D', text: 'To discuss government environmental policies' }
    ],
    correctAnswer: 'C',
    explanation: 'The passage primarily focuses on analyzing the impact of renewable energy on the environment.',
    tags: ['reading', 'main-idea', 'academic']
  },
  {
    id: 'q-reading-002',
    type: 'true-false-not-given',
    text: 'Solar energy is the most cost-effective renewable energy source.',
    instructions: 'Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.',
    points: 1,
    order: 2,
    correctAnswer: 'NOT GIVEN',
    explanation: 'The passage mentions solar energy but does not compare its cost-effectiveness to other renewable sources.',
    tags: ['reading', 'true-false-not-given']
  },
  {
    id: 'q-reading-003',
    type: 'summary-completion',
    text: 'Complete the summary using words from the passage. Use NO MORE THAN TWO WORDS for each answer.',
    instructions: 'Wind energy has become increasingly _______ in many countries. The main advantage is that it produces _______ emissions compared to fossil fuels.',
    points: 2,
    order: 3,
    correctAnswer: ['popular', 'zero'],
    tags: ['reading', 'summary-completion']
  },
  {
    id: 'q-reading-004',
    type: 'matching',
    text: 'Match each paragraph to its main idea.',
    instructions: 'Choose the correct heading for each paragraph from the list A-H.',
    points: 5,
    order: 4,
    correctAnswer: ['C', 'F', 'A', 'G', 'D'],
    tags: ['reading', 'matching-headings']
  },

  // WRITING QUESTIONS
  {
    id: 'q-writing-001',
    type: 'essay',
    text: 'The chart below shows the percentage of people using different modes of transport in a European city between 1960 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    instructions: 'Write at least 150 words.',
    points: 25,
    order: 1,
    correctAnswer: '',
    tags: ['writing', 'task1', 'chart-description']
  },
  {
    id: 'q-writing-002',
    type: 'essay',
    text: 'Some people believe that university students should be required to attend classes. Others believe that going to classes should be optional for students. Discuss both these views and give your own opinion.',
    instructions: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
    points: 25,
    order: 2,
    correctAnswer: '',
    tags: ['writing', 'task2', 'argumentative', 'education']
  }
];

// Comprehensive Test Sections
export const mockTestSections: TestSection[] = [
  // LISTENING TEST SECTIONS
  {
    id: 'listening-section-1',
    title: 'Section 1: Conversation about library services',
    instructions: 'You will hear a conversation between a student and a librarian about library services. First you have some time to look at questions 1-10.',
    duration: 10,
    audioUrl: '/audio/listening-section-1.mp3',
    questions: [
      mockQuestions[0], // multiple choice
      mockQuestions[1], // fill in blank
      {
        id: 'q-listening-form-1',
        type: 'fill-in-blank',
        text: 'Name: Sarah ________',
        instructions: 'Complete the form below. Write NO MORE THAN TWO WORDS for each answer.',
        points: 1,
        order: 3,
        correctAnswer: ['Williams'],
        tags: ['listening', 'form-completion']
      },
      {
        id: 'q-listening-form-2',
        type: 'fill-in-blank',
        text: 'Course: ________ Studies',
        instructions: 'Complete the form below.',
        points: 1,
        order: 4,
        correctAnswer: ['Business'],
        tags: ['listening', 'form-completion']
      }
    ]
  },
  {
    id: 'listening-section-2',
    title: 'Section 2: Information about university facilities',
    instructions: 'You will hear a talk about university facilities. First you have some time to look at questions 11-20.',
    duration: 10,
    audioUrl: '/audio/listening-section-2.mp3',
    questions: [
      mockQuestions[2], // matching
      mockQuestions[4], // diagram labeling
      {
        id: 'q-listening-map-1',
        type: 'diagram-labeling',
        text: 'Complete the map of the university campus.',
        instructions: 'Write the correct letter A-J next to questions 15-20.',
        points: 6,
        order: 5,
        correctAnswer: ['F', 'A', 'C', 'H', 'B', 'G'],
        tags: ['listening', 'map-completion']
      }
    ]
  },
  {
    id: 'listening-section-3',
    title: 'Section 3: Discussion between students about assignment',
    instructions: 'You will hear a discussion between two students about their assignment. First you have some time to look at questions 21-30.',
    duration: 10,
    audioUrl: '/audio/listening-section-3.mp3',
    questions: [
      mockQuestions[3], // short answer
      {
        id: 'q-listening-discussion-1',
        type: 'multiple-choice',
        text: 'What is the main topic of their assignment?',
        instructions: 'Choose the correct letter A, B or C.',
        points: 1,
        order: 6,
        options: [
          { id: 'A', text: 'Renewable energy sources' },
          { id: 'B', text: 'Climate change effects' },
          { id: 'C', text: 'Environmental policies' }
        ],
        correctAnswer: 'A',
        tags: ['listening', 'discussion', 'academic']
      }
    ]
  },
  {
    id: 'listening-section-4',
    title: 'Section 4: Lecture on environmental science',
    instructions: 'You will hear a lecture on environmental science. First you have some time to look at questions 31-40.',
    duration: 10,
    audioUrl: '/audio/listening-section-4.mp3',
    questions: [
      {
        id: 'q-listening-lecture-1',
        type: 'summary-completion',
        text: 'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.',
        instructions: 'The lecturer discusses three main types of renewable energy: solar, wind, and _______ energy.',
        points: 3,
        order: 7,
        correctAnswer: ['hydro'],
        tags: ['listening', 'lecture', 'note-taking']
      }
    ]
  },

  // READING TEST SECTIONS
  {
    id: 'reading-section-1',
    title: 'Reading Passage 1: The Future of Renewable Energy',
    instructions: 'Read the passage below and answer questions 1-13.',
    duration: 20,
    questions: mockQuestions.slice(5, 9), // reading questions
    passages: [
      {
        id: 'reading-passage-1',
        title: 'The Future of Renewable Energy',
        content: `
The transition to renewable energy sources has accelerated dramatically over the past decade. Solar and wind power, once considered niche technologies, now represent the fastest-growing segments of the global energy market. This shift is driven by a combination of factors including technological advances, decreasing costs, and growing environmental awareness.

Solar energy has experienced particularly remarkable growth. The cost of solar panels has fallen by more than 80% since 2010, making solar power competitive with fossil fuels in many regions. Large-scale solar installations, known as solar farms, are now common sights across many countries. These facilities can generate hundreds of megawatts of electricity, enough to power thousands of homes.

Wind energy has followed a similar trajectory. Modern wind turbines are significantly more efficient than their predecessors, capable of generating electricity even at lower wind speeds. Offshore wind farms, in particular, have enormous potential due to the stronger and more consistent winds available at sea.

However, renewable energy sources face challenges. The intermittent nature of solar and wind power requires sophisticated grid management systems and energy storage solutions. Battery technology has improved considerably, but large-scale storage remains expensive. Additionally, the transition requires substantial infrastructure investment and policy support.

Despite these challenges, experts predict that renewable energy will continue to grow rapidly. Many countries have set ambitious targets for renewable energy adoption, and technological innovations continue to drive down costs. The International Energy Agency forecasts that renewables could account for 90% of the required emissions reductions in the energy sector by 2050.
        `,
        wordCount: 256,
        difficulty: 'medium'
      }
    ]
  },

  // WRITING TEST SECTIONS
  {
    id: 'writing-section-1',
    title: 'Writing Task 1',
    instructions: 'You should spend about 20 minutes on this task.',
    duration: 20,
    questions: [mockQuestions[9]] // writing task 1
  },
  {
    id: 'writing-section-2',
    title: 'Writing Task 2',
    instructions: 'You should spend about 40 minutes on this task.',
    duration: 40,
    questions: [mockQuestions[10]] // writing task 2
  }
];

// Comprehensive Tests
export const mockTests: Test[] = [
  // COMPLETE LISTENING TEST
  {
    id: 'test-listening-001',
    title: 'IELTS Listening Practice Test 1',
    description: 'Complete IELTS Listening test with 4 sections: conversation, monologue, discussion, and lecture. Includes form completion, map labeling, and note-taking.',
    skill: 'listening',
    difficulty: 'medium',
    duration: 40,
    totalQuestions: 40,
    totalScore: 40,
    status: 'published',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'user-002',
    tags: ['academic', 'listening', 'full-test'],
    sections: [
      mockTestSections[0], // Section 1
      mockTestSections[1], // Section 2
      mockTestSections[2], // Section 3
      mockTestSections[3]  // Section 4
    ]
  },

  // COMPLETE READING TEST
  {
    id: 'test-reading-001',
    title: 'IELTS Academic Reading Practice Test 1',
    description: 'Complete Academic Reading test with 3 passages covering science, technology, and social issues. Includes all question types: multiple choice, True/False/Not Given, matching headings, and summary completion.',
    skill: 'reading',
    difficulty: 'medium',
    duration: 60,
    totalQuestions: 40,
    totalScore: 40,
    status: 'published',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    createdBy: 'user-002',
    tags: ['academic', 'reading', 'full-test'],
    sections: [
      {
        id: 'reading-section-1-full',
        title: 'Reading Passage 1',
        instructions: 'Read the passage and answer questions 1-13.',
        duration: 20,
        questions: [
          {
            id: 'q-reading-passage1-1',
            type: 'multiple-choice',
            text: 'What is the main topic of the passage?',
            instructions: 'Choose the correct letter A, B, C or D.',
            points: 1,
            order: 1,
            options: [
              { id: 'A', text: 'The history of renewable energy' },
              { id: 'B', text: 'The future of renewable energy' },
              { id: 'C', text: 'Problems with renewable energy' },
              { id: 'D', text: 'Types of renewable energy' }
            ],
            correctAnswer: 'B',
            tags: ['reading', 'main-idea']
          },
          {
            id: 'q-reading-passage1-2',
            type: 'true-false-not-given',
            text: 'Solar panel costs have decreased by 80% since 2010.',
            instructions: 'Write TRUE, FALSE, or NOT GIVEN.',
            points: 1,
            order: 2,
            correctAnswer: 'TRUE',
            tags: ['reading', 'true-false-not-given']
          },
          {
            id: 'q-reading-passage1-3',
            type: 'fill-in-blank',
            text: 'Modern wind turbines can generate electricity even at _______ wind speeds.',
            instructions: 'Complete the sentence with ONE WORD from the passage.',
            points: 1,
            order: 3,
            correctAnswer: ['lower'],
            tags: ['reading', 'completion']
          }
        ],
        passages: [mockTestSections[4].passages![0]]
      }
    ]
  },

  // COMPLETE WRITING TEST
  {
    id: 'test-writing-001',
    title: 'IELTS Writing Practice Test 1',
    description: 'Complete Writing test with Task 1 (chart description) and Task 2 (argumentative essay). Get detailed AI feedback on grammar, vocabulary, task achievement, and coherence.',
    skill: 'writing',
    difficulty: 'hard',
    duration: 60,
    totalQuestions: 2,
    totalScore: 50,
    status: 'published',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-002',
    tags: ['academic', 'writing', 'full-test', 'ai-feedback'],
    sections: [
      {
        id: 'writing-task-1',
        title: 'Writing Task 1',
        instructions: 'You should spend about 20 minutes on this task. Write at least 150 words.',
        duration: 20,
        questions: [
          {
            id: 'q-writing-task1-chart',
            type: 'essay',
            text: 'The bar chart below shows the percentage of people in different age groups who used social media in 2020 and 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
            instructions: 'Write at least 150 words. You should describe the data accurately and make relevant comparisons.',
            points: 25,
            order: 1,
            correctAnswer: '',
            tags: ['writing', 'task1', 'bar-chart', 'data-description']
          }
        ]
      },
      {
        id: 'writing-task-2',
        title: 'Writing Task 2',
        instructions: 'You should spend about 40 minutes on this task. Write at least 250 words.',
        duration: 40,
        questions: [
          {
            id: 'q-writing-task2-education',
            type: 'essay',
            text: 'Some people think that children should be taught to compete, while others believe that children should be taught to cooperate. Discuss both views and give your own opinion.',
            instructions: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
            points: 25,
            order: 2,
            correctAnswer: '',
            tags: ['writing', 'task2', 'argumentative', 'education', 'children']
          }
        ]
      }
    ]
  },

  // QUICK PRACTICE TESTS
  {
    id: 'test-listening-quick-001',
    title: 'Listening Quick Practice - Conversation',
    description: 'Quick 10-minute listening practice focusing on conversations and form completion.',
    skill: 'listening',
    difficulty: 'easy',
    duration: 10,
    totalQuestions: 10,
    totalScore: 10,
    status: 'published',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'user-002',
    tags: ['listening', 'conversation', 'quick-practice'],
    sections: [mockTestSections[0]]
  },

  {
    id: 'test-reading-quick-001',
    title: 'Reading Quick Practice - Science Article',
    description: 'Quick 15-minute reading practice with a science article and mixed question types.',
    skill: 'reading',
    difficulty: 'easy',
    duration: 15,
    totalQuestions: 8,
    totalScore: 8,
    status: 'published',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    createdBy: 'user-002',
    tags: ['reading', 'science', 'quick-practice'],
    sections: [
      {
        id: 'reading-quick-section',
        title: 'Reading Passage: Climate Change Solutions',
        instructions: 'Read the passage and answer questions 1-8.',
        duration: 15,
        questions: [
          {
            id: 'q-reading-quick-1',
            type: 'multiple-choice',
            text: 'According to the passage, what is the most promising renewable energy source?',
            instructions: 'Choose the correct letter A, B, C or D.',
            points: 1,
            order: 1,
            options: [
              { id: 'A', text: 'Solar energy' },
              { id: 'B', text: 'Wind energy' },
              { id: 'C', text: 'Hydroelectric power' },
              { id: 'D', text: 'Nuclear energy' }
            ],
            correctAnswer: 'A',
            tags: ['reading', 'multiple-choice']
          },
          {
            id: 'q-reading-quick-2',
            type: 'true-false-not-given',
            text: 'The cost of renewable energy has increased in recent years.',
            instructions: 'Write TRUE, FALSE, or NOT GIVEN.',
            points: 1,
            order: 2,
            correctAnswer: 'FALSE',
            tags: ['reading', 'true-false-not-given']
          }
        ],
        passages: [
          {
            id: 'reading-quick-passage',
            title: 'Climate Change Solutions',
            content: 'Recent advances in renewable energy technology have made clean energy more accessible and affordable than ever before. Solar energy, in particular, has seen dramatic cost reductions...',
            wordCount: 180,
            difficulty: 'easy'
          }
        ]
      }
    ]
  }
];

// Test List with attempt counts and averages
export const mockTestList: TestListItem[] = mockTests.map(test => ({
  id: test.id,
  title: test.title,
  skill: test.skill,
  difficulty: test.difficulty,
  duration: test.duration,
  totalQuestions: test.totalQuestions,
  status: test.status,
  createdAt: test.createdAt,
  createdBy: test.createdBy,
  attemptCount: Math.floor(Math.random() * 150) + 25,
  averageScore: parseFloat((Math.random() * 2 + 6.0).toFixed(1))
}));

// Enhanced AI Writing Analysis
export const mockAIWritingAnalysis: AIWritingAnalysis = {
  grammaticalAccuracy: {
    score: 7.0,
    percentage: 85,
    details: 'Good grammatical control with minor errors. Complex structures are generally accurate.',
    issues: [
      {
        type: 'article',
        description: 'Missing article before "university"',
        suggestion: 'Add "the" before "university"',
        severity: 'low',
        position: { start: 45, end: 55 }
      },
      {
        type: 'subject-verb-agreement',
        description: 'Subject-verb disagreement in complex sentence',
        suggestion: 'Change "have" to "has" after "government"',
        severity: 'medium',
        position: { start: 128, end: 142 }
      }
    ]
  },
  vocabularyUsage: {
    score: 6.5,
    percentage: 78,
    details: 'Good range of vocabulary with some repetition. Some imprecise word choices.',
    issues: [
      {
        type: 'repetition',
        description: 'Word "important" used 4 times',
        suggestion: 'Use synonyms like "crucial", "significant", "vital"',
        severity: 'medium'
      },
      {
        type: 'word-choice',
        description: 'Imprecise use of "big" in academic context',
        suggestion: 'Use "significant", "substantial", or "considerable"',
        severity: 'low'
      }
    ]
  },
  taskAchievement: {
    score: 7.5,
    percentage: 88,
    details: 'Task fully addressed with clear position. All parts of the question covered adequately.',
    issues: [
      {
        type: 'development',
        description: 'Second main point could be developed further',
        suggestion: 'Add more specific examples or explanation',
        severity: 'low'
      }
    ]
  },
  coherenceCohesion: {
    score: 7.0,
    percentage: 82,
    details: 'Good logical flow with appropriate linking devices. Clear progression throughout.',
    issues: [
      {
        type: 'transition',
        description: 'Transition between paragraphs 2 and 3 could be smoother',
        suggestion: 'Try "Furthermore", "In addition", or "Moreover"',
        severity: 'low'
      },
      {
        type: 'reference',
        description: 'Unclear pronoun reference in paragraph 3',
        suggestion: 'Clarify what "this" refers to',
        severity: 'medium'
      }
    ]
  },
  overallScore: 7.0,
  bandScore: 7.0,
  feedback: 'A well-structured essay that addresses the task effectively. Your ideas are clearly presented and generally well-supported. To improve, focus on expanding your vocabulary range and ensuring all pronoun references are clear.',
  suggestions: [
    'Vary your vocabulary to avoid repetition of key words',
    'Use more sophisticated linking phrases between ideas',
    'Add more specific examples to strengthen your arguments',
    'Check pronoun references for clarity',
    'Consider using more complex sentence structures'
  ]
};

// Tất cả mock data khác giữ nguyên...
export const mockUserDetails: UserDetails[] = [
  {
    ...mockUsers[0],
    lastLogin: new Date('2024-03-20T10:30:00'),
    isActive: true,
    testsTaken: 18,
    averageScore: 7.1,
    registrationDate: new Date('2024-01-15'),
    subscription: {
      plan: 'premium',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-15'),
      isActive: true,
      features: ['unlimited-tests', 'ai-feedback', 'progress-analytics']
    }
  }
];

export const mockUserList: UserListItem[] = mockUserDetails.map(user => ({
  id: user.id,
  email: user.email,
  fullName: `${user.firstName} ${user.lastName}`,
  role: user.role,
  currentLevel: user.profile?.currentLevel || 'beginner',
  lastLogin: user.lastLogin,
  isActive: user.isActive,
  testsTaken: user.testsTaken,
  averageScore: user.averageScore,
  registrationDate: user.registrationDate
}));

// Test Sessions & Results
export const mockTestSessions: TestSession[] = [
  {
    id: 'session-001',
    testId: 'test-listening-001',
    userId: 'user-001',
    startTime: new Date('2024-03-20T09:00:00'),
    endTime: new Date('2024-03-20T09:40:00'),
    status: 'completed',
    currentSection: 3,
    currentQuestion: 40,
    timeRemaining: 0,
    answers: [
      {
        questionId: 'q-listening-001',
        answer: 'B',
        timeSpent: 45,
        isMarked: false,
        confidence: 4
      },
      {
        questionId: 'q-listening-002',
        answer: 'H7834521',
        timeSpent: 30,
        isMarked: false,
        confidence: 5
      }
    ],
    autoSaved: true
  }
];

export const mockTestResults: TestResult[] = [
  {
    id: 'result-001',
    sessionId: 'session-001',
    testId: 'test-listening-001',
    userId: 'user-001',
    completedAt: new Date('2024-03-20T09:40:00'),
    scores: {
      total: 32,
      percentage: 80,
      bandScore: 7.5,
      sectionScores: [
        {
          sectionId: 'listening-section-1',
          score: 9,
          maxScore: 10,
          percentage: 90,
          correctAnswers: 9,
          totalQuestions: 10
        },
        {
          sectionId: 'listening-section-2',
          score: 8,
          maxScore: 10,
          percentage: 80,
          correctAnswers: 8,
          totalQuestions: 10
        },
        {
          sectionId: 'listening-section-3',
          score: 7,
          maxScore: 10,
          percentage: 70,
          correctAnswers: 7,
          totalQuestions: 10
        },
        {
          sectionId: 'listening-section-4',
          score: 8,
          maxScore: 10,
          percentage: 80,
          correctAnswers: 8,
          totalQuestions: 10
        }
      ]
    },
    answers: [
      {
        questionId: 'q-listening-001',
        answer: 'B',
        timeSpent: 45,
        isMarked: false,
        confidence: 4,
        isCorrect: true,
        points: 1,
        maxPoints: 1,
        feedback: 'Correct! You successfully identified the specific time mentioned.'
      },
      {
        questionId: 'q-listening-002',
        answer: 'H7834521',
        timeSpent: 30,
        isMarked: false,
        confidence: 5,
        isCorrect: true,
        points: 1,
        maxPoints: 1,
        feedback: 'Excellent! You accurately captured the ID number.'
      }
    ],
    feedback: {
      overall: 'Excellent listening performance! You demonstrated strong skills in understanding conversations, following directions, and extracting specific information. Your note-taking and form completion were particularly good.',
      strengths: [
        'Excellent performance in conversations and form completion',
        'Strong ability to follow spoken directions',
        'Good note-taking skills during lectures',
        'Accurate spelling and number recognition'
      ],
      improvements: [
        'Focus more on academic discussions and lectures',
        'Practice with faster speech rates',
        'Improve prediction skills before listening'
      ],
      recommendations: [
        'Practice Section 3 and 4 which involve academic content',
        'Listen to English podcasts and lectures regularly',
        'Work on predicting answers before listening'
      ],
      skillBreakdown: [
        {
          skill: 'Conversations',
          score: 9.0,
          feedback: 'Excellent at understanding everyday conversations',
          suggestions: ['Continue practicing with various accents']
        },
        {
          skill: 'Academic Content',
          score: 7.5,
          feedback: 'Good understanding of academic discussions',
          suggestions: ['Practice with more complex academic vocabulary']
        }
      ]
    },
    timeSpent: 2400,
    bandScore: 7.5
  }
];

// Progress data and other mock data remain the same...
export const mockTimeSeriesData: TimeSeriesPoint[] = [
  { date: new Date('2024-01-15'), score: 6.0, skill: 'reading', duration: 60 },
  { date: new Date('2024-01-22'), score: 6.5, skill: 'reading', duration: 55 },
  { date: new Date('2024-01-29'), score: 6.8, skill: 'listening', duration: 40 },
  { date: new Date('2024-02-05'), score: 7.0, skill: 'writing', duration: 60 },
  { date: new Date('2024-02-12'), score: 7.2, skill: 'reading', duration: 58 },
  { date: new Date('2024-02-19'), score: 7.5, skill: 'listening', duration: 38 },
  { date: new Date('2024-02-26'), score: 7.3, skill: 'writing', duration: 62 },
  { date: new Date('2024-03-05'), score: 7.8, skill: 'reading', duration: 52 },
  { date: new Date('2024-03-12'), score: 7.6, skill: 'listening', duration: 41 },
  { date: new Date('2024-03-19'), score: 8.0, skill: 'writing', duration: 58 }
];

export const mockSkillProgress: SkillProgress[] = [
  {
    skill: 'listening',
    currentScore: 7.6,
    averageScore: 7.1,
    bestScore: 8.0,
    improvement: 15.2,
    testsCompleted: 12,
    timeSpent: 480,
    lastAttempt: new Date('2024-03-19'),
    trend: 'improving',
    weakPoints: ['Academic lectures', 'Note-taking', 'Multiple speakers'],
    strengths: ['Conversations', 'Form completion', 'Specific information']
  },
  {
    skill: 'reading',
    currentScore: 7.8,
    averageScore: 7.2,
    bestScore: 8.5,
    improvement: 18.6,
    testsCompleted: 15,
    timeSpent: 720,
    lastAttempt: new Date('2024-03-18'),
    trend: 'improving',
    weakPoints: ['True/False/Not Given', 'Matching headings', 'Time management'],
    strengths: ['Main ideas', 'Vocabulary', 'Detail questions']
  },
  {
    skill: 'writing',
    currentScore: 7.3,
    averageScore: 6.9,
    bestScore: 8.0,
    improvement: 12.3,
    testsCompleted: 8,
    timeSpent: 480,
    lastAttempt: new Date('2024-03-20'),
    trend: 'stable',
    weakPoints: ['Task 1 data description', 'Complex sentences', 'Vocabulary variety'],
    strengths: ['Task achievement', 'Coherence', 'Arguments development']
  }
];

export const mockWeakAreas: WeakArea[] = [
  {
    skill: 'listening',
    area: 'Academic Lectures',
    severity: 'high',
    frequency: 75,
    description: 'Difficulty following complex academic lectures and taking effective notes',
    suggestions: [
      'Practice with university lecture recordings',
      'Develop abbreviation and symbol system for note-taking',
      'Focus on signposting language in lectures'
    ],
    relatedTopics: ['note-taking', 'academic-vocabulary', 'lecture-structure']
  },
  {
    skill: 'reading',
    area: 'True/False/Not Given',
    severity: 'medium',
    frequency: 65,
    description: 'Confusion between FALSE and NOT GIVEN answers',
    suggestions: [
      'Practice identifying the difference between contradictory and absent information',
      'Focus on exact matching vs. inference',
      'Develop systematic approach to these questions'
    ],
    relatedTopics: ['logical-reasoning', 'inference', 'careful-reading']
  },
  {
    skill: 'writing',
    area: 'Task 1 Data Description',
    severity: 'medium',
    frequency: 60,
    description: 'Difficulty describing trends and making comparisons in graphs and charts',
    suggestions: [
      'Learn specific vocabulary for describing trends',
      'Practice with different chart types',
      'Focus on identifying key features and patterns'
    ],
    relatedTopics: ['data-vocabulary', 'comparison-language', 'trend-description']
  }
];

export const mockUserProgress: UserProgress = {
  userId: 'user-001',
  currentLevel: 'upper-intermediate',
  targetScore: 7.5,
  currentScore: 7.6,
  improvement: 15.8,
  testsCompleted: 35,
  totalStudyTime: 1680,
  streakDays: 18,
  lastActivity: new Date('2024-03-20'),
  skillProgress: mockSkillProgress,
  weakAreas: mockWeakAreas,
  recommendations: []
};

export const mockProgressAnalytics: ProgressAnalytics = {
  overview: {
    totalTests: 35,
    averageScore: 7.4,
    bestScore: 8.5,
    currentStreak: 18,
    longestStreak: 25,
    totalStudyTime: 1680,
    averageTestTime: 48,
    improvementRate: 15.8,
    completionRate: 96.2
  },
  timeSeriesData: mockTimeSeriesData,
  skillComparison: [
    { skill: 'reading', currentScore: 7.8, averageScore: 7.2, testCount: 15, trend: 0.6 },
    { skill: 'listening', currentScore: 7.6, averageScore: 7.1, testCount: 12, trend: 0.5 },
    { skill: 'writing', currentScore: 7.3, averageScore: 6.9, testCount: 8, trend: 0.4 }
  ],
  performanceHeatmap: [
    { date: new Date('2024-03-01'), activity: 2, score: 7.2 },
    { date: new Date('2024-03-02'), activity: 0 },
    { date: new Date('2024-03-03'), activity: 1, score: 7.5 },
    { date: new Date('2024-03-04'), activity: 1, score: 7.8 },
    { date: new Date('2024-03-05'), activity: 2, score: 7.6 }
  ],
  questionTypeAnalysis: [
    { questionType: 'Multiple Choice', accuracy: 87, averageTime: 42, attempts: 180, improvement: 12 },
    { questionType: 'Fill in Blank', accuracy: 82, averageTime: 35, attempts: 150, improvement: 15 },
    { questionType: 'True/False/Not Given', accuracy: 75, averageTime: 48, attempts: 120, improvement: 8 },
    { questionType: 'Matching', accuracy: 85, averageTime: 55, attempts: 95, improvement: 10 },
    { questionType: 'Essay Writing', accuracy: 88, averageTime: 1800, attempts: 16, improvement: 18 }
  ]
};

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-001',
    type: 'practice-test',
    title: 'Academic Listening Practice',
    description: 'Focus on Section 3 and 4 listening with academic discussions and lectures to improve note-taking skills.',
    priority: 'high',
    skill: 'listening',
    estimatedTime: 40,
    difficulty: 'medium',
    resources: [
      {
        type: 'test',
        title: 'IELTS Listening Academic Focus',
        url: '/tests/listening-academic',
        duration: 40,
        description: 'Practice test focusing on academic listening skills'
      }
    ]
  },
  {
    id: 'rec-002',
    type: 'skill-exercise',
    title: 'True/False/Not Given Practice',
    description: 'Targeted practice for distinguishing between FALSE and NOT GIVEN answers in reading.',
    priority: 'high',
    skill: 'reading',
    estimatedTime: 25,
    difficulty: 'medium',
    resources: [
      {
        type: 'exercise',
        title: 'T/F/NG Strategy Tutorial',
        duration: 25,
        description: 'Learn systematic approach to T/F/NG questions'
      }
    ]
  },
  {
    id: 'rec-003',
    type: 'vocabulary-building',
    title: 'Data Description Vocabulary',
    description: 'Build vocabulary for describing charts, graphs, and trends in Writing Task 1.',
    priority: 'medium',
    skill: 'writing',
    estimatedTime: 30,
    difficulty: 'easy',
    resources: [
      {
        type: 'exercise',
        title: 'Task 1 Vocabulary Builder',
        duration: 30,
        description: 'Interactive vocabulary practice for data description'
      }
    ]
  }
];

mockUserProgress.recommendations = mockRecommendations;

export const mockStudyPlans: StudyPlan[] = [
  {
    id: 'plan-001',
    userId: 'user-001',
    title: 'IELTS 7.5 Target Plan',
    description: '3-month intensive study plan to achieve IELTS band score 7.5 with focus on weak areas',
    targetScore: 7.5,
    targetDate: new Date('2024-06-20'),
    currentProgress: 72,
    status: 'active',
    milestones: [
      {
        id: 'milestone-001',
        title: 'Reading Skills Mastery',
        description: 'Master all reading question types and achieve consistent 7.5+ scores',
        targetDate: new Date('2024-04-20'),
        isCompleted: true,
        completedAt: new Date('2024-04-18'),
        score: 7.8,
        requirements: [
          { type: 'test-score', target: 7.5, current: 7.8, skill: 'reading' },
          { type: 'tests-completed', target: 8, current: 15, skill: 'reading' }
        ]
      },
      {
        id: 'milestone-002',
        title: 'Listening Proficiency',
        description: 'Achieve consistent 7.5+ scores in all listening sections',
        targetDate: new Date('2024-05-20'),
        isCompleted: false,
        requirements: [
          { type: 'test-score', target: 7.5, current: 7.6, skill: 'listening' },
          { type: 'tests-completed', target: 10, current: 12, skill: 'listening' }
        ]
      },
      {
        id: 'milestone-003',
        title: 'Writing Excellence',
        description: 'Achieve band 7.5 in both Task 1 and Task 2',
        targetDate: new Date('2024-06-15'),
        isCompleted: false,
        requirements: [
          { type: 'test-score', target: 7.5, current: 7.3, skill: 'writing' },
          { type: 'tests-completed', target: 12, current: 8, skill: 'writing' }
        ]
      }
    ],
    weeklyGoals: [
      {
        weekStart: new Date('2024-03-18'),
        testsToComplete: 4,
        studyTimeTarget: 240,
        skillFocus: ['writing', 'listening'],
        completed: false,
        actualTests: 3,
        actualStudyTime: 180
      }
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-18')
  }
];

export const mockNotifications = [
  {
    id: 'notif-001',
    type: 'test-completed' as const,
    title: 'Listening Test Completed!',
    message: 'Excellent work! You scored 7.6 on your latest listening test with strong performance in conversations.',
    isRead: false,
    createdAt: new Date('2024-03-20T09:45:00'),
    userId: 'user-001',
    actionUrl: '/learner/test/test-listening-001/result/result-001',
    actionText: 'View Detailed Results'
  },
  {
    id: 'notif-002',
    type: 'new-recommendation' as const,
    title: 'New Study Recommendations',
    message: 'Based on your recent tests, we recommend focusing on academic listening and True/False/Not Given questions.',
    isRead: false,
    createdAt: new Date('2024-03-20T10:00:00'),
    userId: 'user-001',
    actionUrl: '/learner/progress',
    actionText: 'View Recommendations'
  },
  {
    id: 'notif-003',
    type: 'achievement' as const,
    title: 'Study Streak Achievement!',
    message: 'Congratulations! You\'ve maintained an 18-day study streak. Keep up the excellent work!',
    isRead: true,
    createdAt: new Date('2024-03-19T18:00:00'),
    userId: 'user-001'
  }
];

// Export all mock data
export const mockData = {
  users: mockUsers,
  userDetails: mockUserDetails,
  userList: mockUserList,
  tests: mockTests,
  testList: mockTestList,
  testSessions: mockTestSessions,
  testResults: mockTestResults,
  userProgress: mockUserProgress,
  progressAnalytics: mockProgressAnalytics,
  recommendations: mockRecommendations,
  studyPlans: mockStudyPlans,
  notifications: mockNotifications,
  aiWritingAnalysis: mockAIWritingAnalysis,
  timeSeriesData: mockTimeSeriesData,
  skillProgress: mockSkillProgress,
  weakAreas: mockWeakAreas
};

export default mockData;