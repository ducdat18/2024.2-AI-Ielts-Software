import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/indexApi';
import type {
  TestFull,
  SectionFull,
  TestType,
  CreateTestDto,
  UpdateTestDto,
  CreateTestPartDto,
  CreateSectionDto,
  CreateQuestionDto,
} from '@/types';
import { MediaUploader } from '@/components/common/MediaUploader';

// Main Test Management Page
const TestManagementPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'list' | 'test-details' | 'part-details'
  >('list');
  const [selectedTest, setSelectedTest] = useState<TestFull | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionFull | null>(
    null
  );
  const [tests, setTests] = useState<any[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showCreatePartModal, setShowCreatePartModal] = useState(false);
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);

  useEffect(() => {
    fetchTests();
    fetchTestTypes();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.test.getTests({ page: 1, limit: 100 });
      setTests(response);
    } catch (err) {
      setError('Error loading tests');
      console.error('Tests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestTypes = async () => {
    try {
      const response = await api.testType.getTestTypes();
      setTestTypes(response);
    } catch (err) {
      console.error('Test types error:', err);
    }
  };

  const handleTestSelect = async (test: any) => {
    try {
      setLoading(true);
      const response = await api.test.getTestById(test.testId);
      setSelectedTest(response);
      setCurrentView('test-details');
    } catch (err) {
      setError('Error loading test details');
      console.error('Test details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (section: SectionFull) => {
    setSelectedSection(section);
    setCurrentView('part-details');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTest(null);
    setSelectedSection(null);
  };

  const handleBackToTest = () => {
    setCurrentView('test-details');
    setSelectedSection(null);
  };

  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      await api.test.deleteTest(testId);
      setTests((prev) => prev.filter((t) => t.testId !== testId));
    } catch (err) {
      setError('Error deleting test');
      console.error('Delete test error:', err);
    }
  };

  const handleTestUpdate = async (updatedTest: TestFull) => {
    try {
      const updateData: UpdateTestDto = {
        testName: updatedTest.testName,
        isActive: updatedTest.isActive,
        audioPath: updatedTest.audioPath, // Include audio path in update
      };

      await api.test.updateTest(updatedTest.testId, updateData);

      // Refresh test details
      const refreshedTest = await api.test.getTestById(updatedTest.testId);
      setSelectedTest(refreshedTest);

      // Update in the list
      setTests((prev) =>
        prev.map((t) => (t.testId === updatedTest.testId ? refreshedTest : t))
      );
    } catch (err) {
      setError('Error updating test');
      console.error('Update test error:', err);
    }
  };

  const handleCreateTest = async (testData: any) => {
    try {
      const createData: CreateTestDto = {
        testName: testData.title,
        testTypeId: testData.testTypeId,
        audioPath: testData.audioPath || undefined,
      };

      const response = await api.test.createTest(createData);
      setTests((prev) => [...prev, response.value]);
      setShowCreateTestModal(false);
    } catch (err) {
      setError('Error creating test');
      console.error('Create test error:', err);
    }
  };

  const handleCreateTestPart = async (partData: any): Promise<void> => {
    if (!selectedTest) return;

    try {
      setLoading(true);

      const createData: CreateTestPartDto = {
        testId: selectedTest.testId,
        partNumber: partData.partNumber,
        title: partData.title,
        description: partData.description,
        content: partData.content,
        imgPath: partData.imgPath,
      };

      await api.testPart.createTestPart(createData);

      // Refresh test details
      const refreshedTest = await api.test.getTestById(selectedTest.testId);
      setSelectedTest(refreshedTest);
    } catch (err: any) {
      setError('Error creating test part');
      console.error('Create test part error:', err);
      throw new Error(err.message || 'Failed to create test part');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (sectionData: any): Promise<void> => {
    if (!selectedTest) return;

    try {
      setLoading(true);

      const createData: CreateSectionDto = {
        partId: sectionData.partId,
        sectionNumber: sectionData.sectionNumber,
        instructions: sectionData.instructions,
        questionType: sectionData.questionType,
        content: sectionData.content,
        imagePath: sectionData.imagePath,
      };

      await api.section.createSection(createData);

      // Refresh test details
      const refreshedTest = await api.test.getTestById(selectedTest.testId);
      setSelectedTest(refreshedTest);
    } catch (err: any) {
      setError('Error creating section');
      console.error('Create section error:', err);
      throw new Error(err.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (questionData: any): Promise<void> => {
    if (!selectedSection) return;

    try {
      setLoading(true);

      const createData: CreateQuestionDto = {
        sectionId: selectedSection.sectionId,
        questionNumber: questionData.questionNumber,
        content: questionData.content,
        marks: questionData.points,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation || '',
        alternativeAnswers: questionData.alternativeAnswers || '',
      };

      await api.question.createQuestion(createData);

      // Refresh test details
      if (selectedTest) {
        const refreshedTest = await api.test.getTestById(selectedTest.testId);
        setSelectedTest(refreshedTest);

        // Update selected section
        const updatedSection = refreshedTest.testParts
          .flatMap((part) => part.sections)
          .find((section) => section.sectionId === selectedSection.sectionId);
        if (updatedSection) {
          setSelectedSection(updatedSection);
        }
      }
    } catch (err: any) {
      setError('Error creating question');
      console.error('Create question error:', err);
      throw new Error(err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  if (loading && tests.length === 0) {
    return (
      <div className="min-h-screen bg-black text-gray-200 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              Test Management
            </h1>
            <div className="flex items-center text-gray-500 text-sm">
              <span
                className={`cursor-pointer hover:text-blue-400 ${
                  currentView === 'list' ? 'text-blue-400' : ''
                }`}
                onClick={handleBackToList}
              >
                All Tests
              </span>
              {selectedTest && (
                <>
                  <span className="mx-2">•</span>
                  <span
                    className={`cursor-pointer hover:text-blue-400 ${
                      currentView === 'test-details' ? 'text-blue-400' : ''
                    }`}
                    onClick={handleBackToTest}
                  >
                    {selectedTest.testName}
                  </span>
                </>
              )}
              {selectedSection && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-blue-400">
                    Section {selectedSection.sectionNumber}
                  </span>
                </>
              )}
            </div>
          </div>

          {currentView === 'list' && (
            <Button
              onClick={() => setShowCreateTestModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New Test
            </Button>
          )}

          {currentView === 'test-details' && (
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowCreatePartModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Add New Part
              </Button>
              <Button
                onClick={() => setShowCreateSectionModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Section
              </Button>
            </div>
          )}

          {currentView === 'part-details' && (
            <Button
              onClick={() => setShowCreateQuestionModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add New Question
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
            <Button
              onClick={() => setError(null)}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Content Views */}
        {currentView === 'list' && (
          <TestListView
            tests={tests}
            onTestSelect={handleTestSelect}
            onDeleteTest={handleDeleteTest}
            loading={loading}
          />
        )}

        {currentView === 'test-details' && selectedTest && (
          <TestDetailsView
            test={selectedTest}
            onSectionSelect={handleSectionSelect}
            onTestUpdate={handleTestUpdate}
            onCreateTestPart={handleCreateTestPart}
            onCreateSection={handleCreateSection}
            loading={loading}
          />
        )}

        {currentView === 'part-details' && selectedSection && selectedTest && (
          <SectionDetailsView
            section={selectedSection}
            test={selectedTest}
            loading={loading}
          />
        )}

        {/* Modals */}
        {showCreateTestModal && (
          <CreateTestModal
            testTypes={testTypes}
            onClose={() => setShowCreateTestModal(false)}
            onTestCreated={handleCreateTest}
          />
        )}

        {showCreatePartModal && selectedTest && (
          <CreatePartModal
            test={selectedTest}
            testTypes={testTypes}
            onClose={() => setShowCreatePartModal(false)}
            onPartCreated={handleCreateTestPart}
          />
        )}

        {showCreateSectionModal && selectedTest && (
          <CreateSectionModal
            test={selectedTest}
            onClose={() => setShowCreateSectionModal(false)}
            onSectionCreated={handleCreateSection}
          />
        )}

        {showCreateQuestionModal && selectedSection && selectedTest && (
          <CreateQuestionModal
            section={selectedSection}
            test={selectedTest}
            onClose={() => setShowCreateQuestionModal(false)}
            onQuestionCreated={handleCreateQuestion}
          />
        )}
      </div>
    </div>
  );
};

// Test List View Component
const TestListView: React.FC<{
  tests: any[];
  onTestSelect: (test: any) => void;
  onDeleteTest: (testId: string) => void;
  loading: boolean;
}> = ({ tests, onTestSelect, onDeleteTest, loading }) => {
  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card
              key={test.testId}
              className="bg-gray-900/80 border-gray-800 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {test.testType?.name || 'Test'}
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTest(test.testId);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    🗑️
                  </Button>
                </div>

                <CardTitle
                  className="text-xl text-gray-200 group-hover:text-blue-400 transition-colors cursor-pointer"
                  onClick={() => onTestSelect(test)}
                >
                  {test.testName}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0" onClick={() => onTestSelect(test)}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-gray-300">
                      {test.testType?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        test.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {test.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-300">
                      {new Date(test.creationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tests.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            No tests found. Create your first test to get started.
          </div>
        </div>
      )}
    </div>
  );
};

// Test Details View Component
const TestDetailsView: React.FC<{
  test: TestFull;
  onSectionSelect: (section: SectionFull) => void;
  onTestUpdate: (test: TestFull) => void;
  onCreateTestPart: (partData: any) => void;
  onCreateSection: (sectionData: any) => void;
  loading: boolean;
}> = ({ test, onSectionSelect, onTestUpdate, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    testName: test.testName,
    isActive: test.isActive,
    audioPath: test.audioPath || '', // Add audio path to edit form
  });

  const isListeningTest = test.testTypeName?.toLowerCase() === 'listening';

  const handleSave = () => {
    const updatedTest = {
      ...test,
      ...editForm,
    };
    onTestUpdate(updatedTest);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Test Info */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-gray-200">
              Test Information
            </CardTitle>
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={loading}
              className={
                isEditing
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Test'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Test Name
                </label>
                <input
                  type="text"
                  value={editForm.testName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, testName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Audio Upload for Listening Tests */}
              {isListeningTest && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Test Audio File
                  </label>
                  <MediaUploader
                    type="audio"
                    onUploadComplete={(url) =>
                      setEditForm({ ...editForm, audioPath: url })
                    }
                    currentUrl={editForm.audioPath}
                    folder="listening-tests"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isActive: e.target.checked })
                    }
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Active Test</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Test Type</div>
                  <div className="text-lg font-semibold text-gray-200">
                    {test.testTypeName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      test.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {test.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Parts</div>
                  <div className="text-lg font-semibold text-gray-200">
                    {test.testParts?.length || 0}
                  </div>
                </div>
              </div>

              {/* Show Audio Player for Listening Tests */}
              {isListeningTest && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-3">Test Audio</div>
                  {test.audioPath ? (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 font-medium">
                          Audio File:
                        </span>
                        <span className="text-xs text-green-400">
                          ✅ Uploaded
                        </span>
                      </div>
                      <audio controls className="w-full mb-2">
                        <source src={test.audioPath} />
                        Your browser does not support the audio element.
                      </audio>
                      <div className="text-xs text-gray-500 break-all">
                        {test.audioPath}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                      <div className="text-yellow-300 text-sm">
                        ⚠️ No audio file uploaded. Upload audio to enable
                        listening functionality.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Parts */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Test Parts ({test.testParts?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!test.testParts || test.testParts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No parts created yet. Click "Add New Part" to create your first
              part.
            </div>
          ) : (
            <div className="space-y-4">
              {test.testParts.map((part) => (
                <div
                  key={part.partId}
                  className="border border-gray-700 rounded-lg p-4 bg-gray-800/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-gray-200">
                        Part {part.partNumber}
                      </span>
                      {part.title && (
                        <span className="text-gray-400">- {part.title}</span>
                      )}
                    </div>
                  </div>

                  {part.description && (
                    <div className="text-gray-300 mb-4">{part.description}</div>
                  )}

                  {/* Show part image if exists */}
                  {part.imgPath && (
                    <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <div className="text-gray-300 text-sm font-medium mb-2">
                        Part Image:
                      </div>
                      <img
                        src={part.imgPath}
                        alt={`Part ${part.partNumber} visual`}
                        className="max-w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  {/* Sections in this part */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-400">
                      Sections ({part.sections?.length || 0}):
                    </div>
                    {part.sections?.map((section) => (
                      <div
                        key={section.sectionId}
                        className="flex items-center justify-between p-2 bg-gray-700/50 rounded cursor-pointer hover:bg-gray-700/70"
                        onClick={() => onSectionSelect(section)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-200">
                            Section {section.sectionNumber} -{' '}
                            {section.questions?.length || 0} questions
                          </span>
                          {section.imagePath && (
                            <span className="text-xs text-blue-400">
                              📷 Has Image
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Section Details View Component
const SectionDetailsView: React.FC<{
  section: SectionFull;
  test: TestFull;
  loading: boolean;
}> = ({ section, test }) => {
  const renderQuestionContent = (question: any) => {
    try {
      // Parse question content if it's JSON
      let content = question.content;
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch {
          // If not JSON, return as is
          return content;
        }
      }

      if (content.type === 'multiple_choice' && content.options) {
        return (
          <div className="space-y-3">
            <div className="font-medium text-gray-200">{content.question}</div>
            {content.instruction && (
              <div className="text-sm text-gray-400 italic">
                {content.instruction}
              </div>
            )}
            <div className="space-y-2">
              {Object.entries(content.options).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                    {key}
                  </span>
                  <span className="text-gray-300">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Default rendering for other types
      return (
        <div>
          {content.question && (
            <div className="font-medium text-gray-200 mb-2">
              {content.question}
            </div>
          )}
          {content.instruction && (
            <div className="text-sm text-gray-400 italic mb-2">
              {content.instruction}
            </div>
          )}
          {content.text && <div className="text-gray-300">{content.text}</div>}
        </div>
      );
    } catch (error) {
      // Fallback for any parsing errors
      return (
        <div className="text-gray-300">
          {typeof question.content === 'string'
            ? question.content
            : JSON.stringify(question.content, null, 2)}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Info */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-200">
            Section {section.sectionNumber} Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Instructions</div>
              <div className="text-gray-300">{section.instructions}</div>
            </div>

            {/* Show section image if exists */}
            {section.imagePath && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Section Image</div>
                <img
                  src={section.imagePath}
                  alt="Section visual"
                  className="max-w-full h-64 object-cover rounded-lg border border-gray-700"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Questions</div>
                <div className="text-lg font-semibold text-gray-200">
                  {section.questions?.length || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Question Type</div>
                <div className="text-lg font-semibold text-gray-200">
                  {section.questionType || 'Mixed'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Test Type</div>
                <div className="text-lg font-semibold text-gray-200">
                  {test.testTypeName}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Questions ({section.questions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!section.questions || section.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions created yet. Click "Add New Question" to create your
              first question.
            </div>
          ) : (
            <div className="space-y-4">
              {section.questions.map((question) => (
                <div
                  key={question.questionId}
                  className="border border-gray-700 rounded-lg p-4 bg-gray-800/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-gray-200">
                        Q{question.questionNumber}
                      </span>
                      <span className="text-sm text-gray-400">
                        {question.marks} point{question.marks !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced question content rendering */}
                  <div className="mb-4">{renderQuestionContent(question)}</div>

                  {question.answer && (
                    <div className="border-t border-gray-700 pt-3">
                      <div className="text-sm font-medium text-gray-400 mb-2">
                        Answer:
                      </div>
                      <span className="text-green-400 font-medium">
                        {question.answer.correctAnswer}
                      </span>
                      {question.answer.explanation && (
                        <div className="text-sm text-gray-500 mt-1">
                          <strong>Explanation:</strong>{' '}
                          {question.answer.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Create Test Modal
const CreateTestModal: React.FC<{
  testTypes: TestType[];
  onClose: () => void;
  onTestCreated: (testData: any) => void;
}> = ({ testTypes, onClose, onTestCreated }) => {
  const [form, setForm] = useState({
    title: '',
    testTypeId: testTypes[0]?.testTypeId || '',
    audioPath: '', // Add audio path for listening tests
  });

  // Check if selected test type is listening
  const selectedTestType = testTypes.find(
    (t) => t.testTypeId === form.testTypeId
  );
  const isListeningTest = selectedTestType?.name?.toLowerCase() === 'listening';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTestCreated(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Create New Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Test Name *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., IELTS Reading Practice Test 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Test Type *
              </label>
              <select
                value={form.testTypeId}
                onChange={(e) => {
                  setForm({
                    ...form,
                    testTypeId: e.target.value,
                    audioPath: '', // Reset audio path when changing test type
                  });
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {testTypes.map((type) => (
                  <option key={type.testTypeId} value={type.testTypeId}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Upload for Listening Tests */}
            {isListeningTest && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Test Audio File *
                </label>
                <MediaUploader
                  type="audio"
                  onUploadComplete={(url) =>
                    setForm({ ...form, audioPath: url })
                  }
                  currentUrl={form.audioPath}
                  folder="listening-tests"
                />
                <div className="text-xs text-gray-500 mt-1">
                  This audio will be used for the entire listening test
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-700 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isListeningTest && !form.audioPath}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Create Test
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Create Part Modal - Enhanced with Media Upload
const CreatePartModal: React.FC<{
  test: TestFull;
  testTypes: TestType[];
  onClose: () => void;
  onPartCreated: (partData: any) => Promise<void>;
}> = ({ test, testTypes, onClose, onPartCreated }) => {
  const [form, setForm] = useState({
    partNumber: (test.testParts?.length || 0) + 1,
    title: '',
    description: '',
    content: '',
    imgPath: '', // Keep this for part-specific images (not audio)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check if this is a listening test
  const testType = testTypes.find((t) => t.testTypeId === test.testTypeId);
  const isListeningTest = testType?.name?.toLowerCase() === 'listening';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onPartCreated(form);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Create New Part for {test.testName}
            {isListeningTest && (
              <div className="text-sm text-gray-400 mt-1">
                📝 Audio is already uploaded at test level
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Part Number *
              </label>
              <input
                type="number"
                required
                min="1"
                value={form.partNumber}
                onChange={(e) =>
                  setForm({ ...form, partNumber: parseInt(e.target.value) })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="e.g., Reading Passage 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Description of this part..."
              />
            </div>

            {/* Optional Image Upload for Part (not audio) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Part Image (Optional)
              </label>
              <MediaUploader
                type="image"
                onUploadComplete={(url) => setForm({ ...form, imgPath: url })}
                currentUrl={form.imgPath}
                folder="part-images"
                disabled={isSubmitting}
              />
              <div className="text-xs text-gray-500 mt-1">
                Upload images specific to this part (diagrams, charts, etc.)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Content *
              </label>
              <textarea
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                disabled={isSubmitting}
                rows={5}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder={
                  isListeningTest
                    ? 'Instructions for this listening section...'
                    : 'Main content/passage for this part...'
                }
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 border-gray-700 text-gray-400 disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Part'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Create Section Modal - Enhanced with Image Upload
const CreateSectionModal: React.FC<{
  test: TestFull;
  onClose: () => void;
  onSectionCreated: (sectionData: any) => Promise<void>;
}> = ({ test, onClose, onSectionCreated }) => {
  const [form, setForm] = useState({
    partId: test.testParts?.[0]?.partId || '',
    sectionNumber: 1,
    instructions: '',
    questionType: 'multiple_choice',
    content: '',
    imagePath: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSectionCreated(form);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionTypes = [
    'multiple_choice',
    'fill_in_blank',
    'true_false_not_given',
    'matching',
    'short_answer',
    'essay',
    'summary_completion',
    'diagram_labeling',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Create New Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Part *
              </label>
              <select
                required
                value={form.partId}
                onChange={(e) => setForm({ ...form, partId: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select a part</option>
                {test.testParts?.map((part) => (
                  <option key={part.partId} value={part.partId}>
                    Part {part.partNumber} - {part.title || 'Untitled'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Section Number *
              </label>
              <input
                type="number"
                required
                min="1"
                value={form.sectionNumber}
                onChange={(e) =>
                  setForm({ ...form, sectionNumber: parseInt(e.target.value) })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Question Type
              </label>
              <select
                value={form.questionType}
                onChange={(e) =>
                  setForm({ ...form, questionType: e.target.value })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {questionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type
                      .replace('_', ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Instructions *
              </label>
              <textarea
                required
                value={form.instructions}
                onChange={(e) =>
                  setForm({ ...form, instructions: e.target.value })
                }
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Instructions for this section..."
              />
            </div>

            {/* Image Upload for Visual Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Section Image (Optional)
              </label>
              <MediaUploader
                type="image"
                onUploadComplete={(url) => setForm({ ...form, imagePath: url })}
                currentUrl={form.imagePath}
                folder="section-images"
                disabled={isSubmitting}
              />
              <div className="text-xs text-gray-500 mt-1">
                Upload charts, diagrams, or images that accompany this section's
                questions
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Additional Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Any additional content for this section..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 border-gray-700 text-gray-400 disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Section'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Create Question Modal - Enhanced with Better Question Types
const CreateQuestionModal: React.FC<{
  section: SectionFull;
  test: TestFull;
  onClose: () => void;
  onQuestionCreated: (questionData: any) => Promise<void>;
}> = ({ section, onClose, onQuestionCreated }) => {
  const [form, setForm] = useState({
    questionNumber: (section.questions?.length || 0) + 1,
    type: 'multiple_choice',
    question: '',
    instruction: '',
    points: 1,
    correctAnswer: '',
    explanation: '',
    alternativeAnswers: '',
    options: {
      A: '',
      B: '',
      C: '',
      D: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create proper content object based on question type
      let content: any = {
        type: form.type,
        question: form.question,
        instruction: form.instruction,
      };

      if (form.type === 'multiple_choice') {
        // Only include non-empty options
        const options: Record<string, string> = {};
        Object.entries(form.options).forEach(([key, value]) => {
          if (value.trim()) {
            options[key] = value.trim();
          }
        });
        content.options = options;
      }

      const questionData = {
        questionNumber: form.questionNumber,
        content: content,
        points: form.points,
        correctAnswer: form.correctAnswer,
        explanation: form.explanation,
        alternativeAnswers: form.alternativeAnswers,
      };

      await onQuestionCreated(questionData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'fill_in_blank', label: 'Fill in the Blank' },
    { value: 'true_false_not_given', label: 'True/False/Not Given' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'matching', label: 'Matching' },
    { value: 'essay', label: 'Essay' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-700 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Create New Question for Section {section.sectionNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Question Number *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.questionNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      questionNumber: parseInt(e.target.value),
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Question Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Question Text *
              </label>
              <textarea
                required
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Enter the question text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Instructions (Optional)
              </label>
              <input
                type="text"
                value={form.instruction}
                onChange={(e) =>
                  setForm({ ...form, instruction: e.target.value })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="e.g., Choose the correct answer A, B, C or D"
              />
            </div>

            {/* Options for Multiple Choice */}
            {form.type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Answer Options *
                </label>
                <div className="space-y-2">
                  {Object.entries(form.options).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {key}
                      </span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            options: { ...form.options, [key]: e.target.value },
                          })
                        }
                        disabled={isSubmitting}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        placeholder={`Option ${key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Correct Answer *
                </label>
                <input
                  type="text"
                  required
                  value={form.correctAnswer}
                  onChange={(e) =>
                    setForm({ ...form, correctAnswer: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder={
                    form.type === 'multiple_choice'
                      ? 'A, B, C, or D'
                      : 'Enter the correct answer'
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Points *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.points}
                  onChange={(e) =>
                    setForm({ ...form, points: parseInt(e.target.value) || 1 })
                  }
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Explanation (Optional)
              </label>
              <textarea
                value={form.explanation}
                onChange={(e) =>
                  setForm({ ...form, explanation: e.target.value })
                }
                disabled={isSubmitting}
                rows={2}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Explanation for the correct answer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Alternative Answers (Optional)
              </label>
              <input
                type="text"
                value={form.alternativeAnswers}
                onChange={(e) =>
                  setForm({ ...form, alternativeAnswers: e.target.value })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Other acceptable answers, separated by commas"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 border-gray-700 text-gray-400 disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Question'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestManagementPage;
