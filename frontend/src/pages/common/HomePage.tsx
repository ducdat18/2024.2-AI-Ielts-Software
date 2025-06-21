import React, { useEffect, useRef } from 'react';
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
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animations
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelector('.hero-title'),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2 }
      );

      gsap.fromTo(
        heroRef.current.querySelector('.hero-subtitle'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.4 }
      );

      gsap.fromTo(
        heroRef.current.querySelector('.hero-buttons'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.6 }
      );

      gsap.fromTo(
        heroRef.current.querySelector('.hero-demo'),
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1, delay: 0.8 }
      );
    }

    // Features section animation
    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current.querySelectorAll('.feature-card'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
        }
      );
    }

    // AI section animation
    if (aiRef.current) {
      gsap.fromTo(
        aiRef.current.querySelector('.ai-content'),
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: aiRef.current,
            start: 'top 70%',
          },
        }
      );

      gsap.fromTo(
        aiRef.current.querySelector('.ai-features'),
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          delay: 0.3,
          scrollTrigger: {
            trigger: aiRef.current,
            start: 'top 70%',
          },
        }
      );
    }

    // Testimonials animation
    if (testimonialsRef.current) {
      gsap.fromTo(
        testimonialsRef.current.querySelectorAll('.testimonial-card'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
          },
        }
      );
    }
  }, []);

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-black/80" />
          <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30" />
        </div>

        <div className="container mx-auto px-4 z-10 mt-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2 mb-10 md:mb-0">
              <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Practice IELTS Online <br />
                <span className="text-blue-500">With AI support</span>
              </h1>
              <p className="hero-subtitle text-lg text-gray-300 mb-8 max-w-lg">
                AI-powered online test preparation platform helps you improve
                your Listening, Reading, and Writing skills with detailed
                feedback and personalized suggestions.
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-6">
                    Start free now
                    <svg
                      className="ml-2 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-base px-8 py-6"
                  >
                    Learn more about us
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hero-demo w-full md:w-1/2 relative">
              <div className="bg-blue-900/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6 shadow-xl">
                <div className="flex justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    IELTS Writing Feedback
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded p-4">
                    <div className="text-white text-sm">
                      <span className="text-blue-400 font-medium">
                        Task Achievement:
                      </span>{' '}
                      7.0
                    </div>
                    <div className="mt-2 text-gray-300 text-xs">
                      Your essay addresses all parts of the task with relevant
                      ideas that are fully developed. Consider adding more
                      specific examples to strengthen your arguments.
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-4">
                    <div className="text-white text-sm">
                      <span className="text-blue-400 font-medium">
                        Coherence & Cohesion:
                      </span>{' '}
                      6.5
                    </div>
                    <div className="mt-2 text-gray-300 text-xs">
                      Your essay is generally well-organized with good use of
                      cohesive devices. Work on more precise paragraph
                      transitions to improve overall coherence.
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-4">
                    <div className="text-white text-sm">
                      <span className="text-blue-400 font-medium">
                        Lexical Resource:
                      </span>{' '}
                      7.0
                    </div>
                    <div className="mt-2 text-gray-300 text-xs">
                      You use a good range of vocabulary with some flexibility
                      and precision. Try to incorporate more uncommon vocabulary
                      items appropriately.
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="text-blue-500 text-xl font-bold">
                    Overall: 6.5
                  </div>
                  <Button size="sm" className="bg-blue-600">
                    Show Detail
                  </Button>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-900/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills/Features Section */}
      <section
        ref={featuresRef}
        className="py-20 bg-black bg-gradient-to-b from-gray-900 to-transparent"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Practice all IELTS skills
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our platform provides practice tests and mock tests for all three
              skills, helping you prepare comprehensively for the IELTS exam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="feature-card bg-gray-800 border-blue-900 hover:border-blue-500 transition-colors">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-400"
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
                </div>
                <CardTitle className="text-xl text-white font-bold">
                  Listening
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Practice listening and understanding English in various
                  situations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Listening by topic and difficulty
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Diverse question types
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Error analysis and improvement suggestions
                  </li>
                </ul>
                <Link
                  to="/tests"
                  className="mt-4 inline-block text-blue-500 hover:text-blue-400"
                >
                  Practice Now →
                </Link>
              </CardContent>
            </Card>

            <Card className="feature-card bg-gray-800 border-blue-900 hover:border-blue-500 transition-colors">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-400"
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
                </div>
                <CardTitle className="text-xl text-white font-bold">
                  Reading
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Improve your ability to read and analyze English texts
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Academic and General Reading
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Effective Reading Comprehension Strategies
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Specialized Vocabulary Instruction
                  </li>
                </ul>
                <Link
                  to="/tests"
                  className="mt-4 inline-block text-blue-500 hover:text-blue-400"
                >
                  Practice Now →
                </Link>
              </CardContent>
            </Card>

            <Card className="feature-card bg-gray-800 border-blue-900 hover:border-blue-500 transition-colors">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-400"
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
                </div>
                <CardTitle className="text-xl text-white font-bold">
                  Writing
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Develop essay writing and graph description skills
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AI Feedback by IELTS Criteria
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    High Quality Sample Papers
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Advanced Vocabulary and Structure Suggestions
                  </li>
                </ul>
                <Link
                  to="/tests"
                  className="mt-4 inline-block text-blue-500 hover:text-blue-400"
                >
                  Practice Now →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section ref={aiRef} className="py-20 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="ai-features w-full md:w-1/2">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg
                          className="w-5 h-5 text-blue-500 mr-2"
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
                        <h3 className="text-lg font-semibold text-white">
                          Smart analysis
                        </h3>
                      </div>
                      <p className="text-gray-300 text-sm">
                        AI analyzes your work according to each IELTS assessment
                        criterion, helping you understand your strengths and
                        weaknesses.
                      </p>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg
                          className="w-5 h-5 text-blue-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                        <h3 className="text-lg font-semibold text-white">
                          Detailed feedback
                        </h3>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Get specific feedback on each mistake, suggestions for
                        improvement, and examples for each section of your work.
                      </p>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg
                          className="w-5 h-5 text-blue-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <h3 className="text-lg font-semibold text-white">
                          Personalized recommendations
                        </h3>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Get personalized workout recommendations based on your
                        results, helping to focus on the areas that need the
                        most improvement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-content w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                AI Technology <span className="text-blue-500">advanced</span>
              </h2>
              <p className="text-gray-300 mb-6">
                We use advanced artificial intelligence to analyze and evaluate
                your work according to international IELTS standards. Our system
                is trained on thousands of real tests to ensure accurate and
                useful feedback.
              </p>
              <p className="text-gray-300 mb-8">
                With IELTS Online Test, you not only know your score, but also
                understand why and how to improve. Each feedback is personalized
                to you, making your test preparation journey more effective.
              </p>
              <Link to="/about">
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                >
                  Learn about our AI technology
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 bg-black relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-900 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What our users say about us
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Thousands of students have improved their IELTS scores with our
              platform. Here are some of their experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="testimonial-card bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-lg relative">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="mb-4 pt-4">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic mb-4">
                  "I improved my IELTS Writing score from 6.0 to 7.5 after 3
                  months of using this platform. The AI ​​feedback is really
                  detailed and helpful, helping me understand mistakes that I
                  didn't notice before. It's also help me get along with actual
                  Ielts test"
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">MW</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">MuWild</h4>
                  <p className="text-gray-400 text-sm">
                    Student, Ho Chi Minh City
                  </p>
                </div>
              </div>
            </div>

            <div className="testimonial-card bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-lg relative">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="mb-4 pt-4">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic mb-4">
                  "What I like most about this platform is the personalization.
                  The AI ​​suggested exercises and materials based on my
                  weaknesses, helping me focus on what needed the most
                  improvement. As a result, my Reading score increased
                  significantly."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">LH</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Lê Hậu</h4>
                  <p className="text-gray-400 text-sm">Engineer, Da Nang</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-lg relative">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="mb-4 pt-4">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic mb-4">
                  "As a teacher, I have introduced this platform to many of my
                  students. Feedback on the test is very quick and close to the
                  actual IELTS scoring criteria. Especially the Listening
                  section has many different types of exercises to help students
                  gradually get used to the exam."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">K1</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Kazuyuki114</h4>
                  <p className="text-gray-400 text-sm">IELTS Teacher, Hanoi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
