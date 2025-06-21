import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AboutPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelector('.about-title'),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2 }
      );

      gsap.fromTo(
        heroRef.current.querySelector('.about-content'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.4 }
      );
    }

    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current.querySelectorAll('.feature-item'),
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
  }, []);

  return (
    <div className="bg-black text-white min-h-screen pt-20">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="py-20 bg-gradient-to-b from-gray-900 to-black"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="about-title text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-blue-500">IELTS Online</span>
            </h1>
            <div className="about-content space-y-6 text-lg text-gray-300">
              <p>
                IELTS Online is an innovative AI-powered platform designed to
                help students achieve their IELTS goals through personalized
                learning and advanced feedback systems.
              </p>
              <p>
                Our platform combines cutting-edge artificial intelligence with
                proven IELTS preparation methodologies to provide you with the
                most effective and efficient test preparation experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Our <span className="text-blue-500">Mission</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-blue-400">
                  Empowering Students Worldwide
                </h3>
                <p className="text-gray-300 mb-6">
                  We believe that everyone deserves access to high-quality IELTS
                  preparation, regardless of their location or financial
                  situation. Our platform democratizes IELTS preparation by
                  making advanced AI-powered feedback accessible to all.
                </p>
                <p className="text-gray-300">
                  Through personalized learning paths and detailed feedback, we
                  help students identify their strengths and weaknesses,
                  enabling them to focus their efforts where they matter most.
                </p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/20 p-8 rounded-lg">
                <h4 className="text-xl font-semibold mb-4 text-white">
                  Our Values
                </h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Excellence in education
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Accessibility for all students
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Innovation through technology
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Personalized learning experience
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-20 bg-gradient-to-b from-gray-900 to-black"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              What Makes Us <span className="text-blue-500">Different</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="feature-item bg-gray-800/50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  AI-Powered Analysis
                </h3>
                <p className="text-gray-300">
                  Our advanced AI analyzes your work using the same criteria as
                  official IELTS examiners.
                </p>
              </div>

              <div className="feature-item bg-gray-800/50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Personalized Learning
                </h3>
                <p className="text-gray-300">
                  Every student is unique. Our platform adapts to your learning
                  style and pace.
                </p>
              </div>

              <div className="feature-item bg-gray-800/50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Instant Feedback
                </h3>
                <p className="text-gray-300">
                  Get detailed feedback immediately after completing your
                  practice tests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Our <span className="text-blue-500">Team</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Built by passionate developers and educators who understand the
              challenges of IELTS preparation. We're committed to continuously
              improving our platform to serve students better.
            </p>
            <div className="bg-gray-800/50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-white">
                Contact Information
              </h3>
              <div className="space-y-3 text-gray-300">
                <p>📧 dat.pd226025@sis.hust.edu.vn</p>
                <p>📞 +84 356 415 493</p>
                <p>📍 No. 1 Dai Co Viet, Hai Ba Trung, Hanoi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your IELTS Journey?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have improved their IELTS scores with
            our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link to="/tests">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-8 py-6 text-lg"
              >
                Browse Tests
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
