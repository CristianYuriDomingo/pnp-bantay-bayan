// FILE: src/app/admin/quiz/page.tsx - Fixed to hide standalone sub-quizzes from main view
'use client';
import { useState, useEffect } from 'react';

// Types
interface Quiz {
  id: string;
  title: string;
  timer: number;
  parentId?: string | null;
  isParent: boolean;
  subjectDomain?: string;
  skillArea?: string;
  questions: Question[];
  children?: Quiz[]; // For parent quizzes
}

interface Question {
  id: string;
  question: string;
  lesson: string;
  image?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_mastery_bronze' | 'quiz_mastery_silver' | 'quiz_mastery_gold' | 'quiz_perfect' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Parent Quiz Creation Modal
const ParentQuizModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (parentQuiz: { title: string }) => void;
}) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      return alert('Please enter a parent quiz title');
    }
    
    setLoading(true);
    try {
      await onSave({
        title: title.trim()
      });
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error saving parent quiz:', error);
      alert('Error saving parent quiz');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create Parent Quiz Category</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Parent quizzes are containers that group related sub-quizzes together. They don't contain questions themselves.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Cybersecurity Fundamentals, Crime Prevention Basics"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Parent Quiz'}
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Badge creation modal (existing code - no changes needed)
const QuizMasteryBadgeModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  targetQuiz,
  existingBadges 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (badges: Badge[]) => void;
  targetQuiz: Quiz | null;
  existingBadges: Badge[];
}) => {
  // ... existing badge modal code remains the same
  if (!isOpen || !targetQuiz || targetQuiz.isParent) return null;
  // Only show for sub-quizzes, not parent quizzes
  return null; // Simplified for now - use your existing modal code
};

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => 
  isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Quiz Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        {children}
      </div>
    </div>
  ) : null;

// Updated Quiz Card for hierarchical display
const QuizCard = ({ 
  quiz, 
  onView, 
  onDelete,
  onAddSubQuiz,
  badges,
  onManageBadge,
  level = 0,
  showAsStandalone = false
}: { 
  quiz: Quiz; 
  onView: (quiz: Quiz) => void; 
  onDelete: (quizId: string) => void;
  onAddSubQuiz?: (parentQuiz: Quiz) => void;
  badges: Badge[];
  onManageBadge: (quiz: Quiz) => void;
  level?: number;
  showAsStandalone?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique lessons from questions (only for sub-quizzes)
  const uniqueLessons = quiz.isParent ? [] : [...new Set(quiz.questions.map(q => q.lesson))];
  
  // Get quiz mastery badges (only for sub-quizzes)
  const quizBadges = quiz.isParent ? [] : badges.filter(badge => 
    ['quiz_mastery_bronze', 'quiz_mastery_silver', 'quiz_mastery_gold', 'quiz_perfect'].includes(badge.triggerType) && 
    badge.triggerValue === quiz.id
  );

  const cardWidth = level === 0 ? 'w-80' : 'w-72';
  const cardMargin = level > 0 ? 'ml-8 mt-4' : '';

  return (
    <>
      <div className={`bg-white rounded-lg shadow border overflow-hidden ${cardWidth} ${cardMargin}`}>
        {/* Header with parent/child indicator */}
        <div className={`h-48 flex items-center justify-center ${
          quiz.isParent 
            ? 'bg-gradient-to-br from-purple-50 to-purple-100' 
            : showAsStandalone
            ? 'bg-gradient-to-br from-orange-50 to-orange-100'
            : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}>
          <div className="text-center">
            <div className={`text-4xl mb-2 ${
              quiz.isParent 
                ? 'text-purple-500' 
                : showAsStandalone 
                ? 'text-orange-500'
                : 'text-indigo-500'
            }`}>
              {quiz.isParent ? '📂' : showAsStandalone ? '📝' : '🧠'}
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              quiz.isParent 
                ? 'bg-purple-100 text-purple-800' 
                : showAsStandalone
                ? 'bg-orange-100 text-orange-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {quiz.isParent ? 'PARENT CATEGORY' : showAsStandalone ? 'STANDALONE QUIZ' : 'SUB QUIZ'}
            </div>
            {showAsStandalone && (
              <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1">
                NOT IN CATEGORY
              </div>
            )}
            {quiz.subjectDomain && (
              <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mt-1">
                {quiz.subjectDomain.replace('_', ' ').toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg flex-1">{quiz.title}</h3>
            {quiz.isParent && quiz.children && quiz.children.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <svg 
                  className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600 mb-3">
            {quiz.isParent ? (
              <>
                <div>📁 {quiz.children?.length || 0} sub-quizzes</div>
                <div>📚 Total questions: {quiz.children?.reduce((sum, child) => sum + child.questions.length, 0) || 0}</div>
              </>
            ) : (
              <>
                <div>📚 {uniqueLessons.length > 1 ? `${uniqueLessons.length} lessons` : uniqueLessons[0] || 'No lessons'}</div>
                <div>⏱️ {quiz.timer}s per question</div>
                <div>❓ {quiz.questions.length} questions</div>
                {quiz.skillArea && (
                  <div className="text-xs text-blue-600 mt-1">🎯 {quiz.skillArea.replace('_', ' ')}</div>
                )}
              </>
            )}
          </div>
          
          {/* Mastery badge indicator (only for sub-quizzes) */}
          {!quiz.isParent && (
            <div className="mb-4">
              <button 
                onClick={() => onManageBadge(quiz)}
                className="flex items-center space-x-2 text-sm border rounded-lg px-3 py-2 hover:bg-opacity-50 transition-colors text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
              >
                <span className="text-lg">⭐</span>
                <span>Mastery badges ({quizBadges.length}/4)</span>
              </button>
            </div>
          )}
          
          <div className="flex space-x-2">
            {quiz.isParent ? (
              <>
                <button 
                  onClick={() => onAddSubQuiz && onAddSubQuiz(quiz)} 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-medium transition-colors text-sm"
                >
                  Add Sub-Quiz
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition-colors text-sm"
                >
                  View
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition-colors"
              >
                View Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded sub-quizzes */}
      {quiz.isParent && isExpanded && quiz.children && (
        <div className="ml-4 mt-2 space-y-4">
          {quiz.children.map((subQuiz) => (
            <QuizCard 
              key={subQuiz.id}
              quiz={subQuiz}
              onView={onView}
              onDelete={onDelete}
              badges={badges}
              onManageBadge={onManageBadge}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Modal for viewing details */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{quiz.title}</h3>
          
          {quiz.isParent ? (
            <>
              {/* Parent quiz details */}
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Parent Quiz Category</h4>
                <div className="text-sm text-purple-700 space-y-1">
                  <p>Sub-quizzes: {quiz.children?.length || 0}</p>
                  <p>Total questions: {quiz.children?.reduce((sum, child) => sum + child.questions.length, 0) || 0}</p>
                  {quiz.subjectDomain && <p>Subject Domain: {quiz.subjectDomain.replace('_', ' ')}</p>}
                  {quiz.skillArea && <p>Skill Area: {quiz.skillArea.replace('_', ' ')}</p>}
                </div>
              </div>

              {quiz.children && quiz.children.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Sub-Quizzes:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {quiz.children.map((subQuiz) => (
                      <div key={subQuiz.id} className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{subQuiz.title}</p>
                            <p className="text-sm text-gray-600">{subQuiz.questions.length} questions</p>
                          </div>
                          <button
                            onClick={() => { onView(subQuiz); setIsModalOpen(false); }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Sub-quiz details (existing code) */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Lessons:</strong> {uniqueLessons.join(', ')}</p>
                  <p><strong>Timer:</strong> {quiz.timer} seconds per question</p>
                  <p><strong>Questions:</strong> {quiz.questions.length}</p>
                </div>
                <div>
                  {quiz.subjectDomain && (
                    <p><strong>Subject Domain:</strong> {quiz.subjectDomain.replace('_', ' ')}</p>
                  )}
                  {quiz.skillArea && (
                    <p><strong>Skill Area:</strong> {quiz.skillArea.replace('_', ' ')}</p>
                  )}
                  {quiz.parentId ? (
                    <p><strong>Parent Category:</strong> Yes</p>
                  ) : (
                    <p><strong>Status:</strong> <span className="text-orange-600 font-medium">Standalone (not in category)</span></p>
                  )}
                </div>
              </div>
              
              {/* Questions preview */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Questions Preview:</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {quiz.questions.slice(0, 3).map((q, index) => (
                    <div key={q.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{q.lesson}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        {q.options.map((option, optIndex) => (
                          <div key={optIndex} className={`${optIndex === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                            {String.fromCharCode(65 + optIndex)}. {option} {optIndex === q.correctAnswer && <span className="text-green-600">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quiz.questions.length > 3 && (
                    <p className="text-gray-500 text-center">... and {quiz.questions.length - 3} more questions</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="flex space-x-3">
            {!quiz.isParent && (
              <button onClick={() => { onView(quiz); setIsModalOpen(false); }} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                Edit Quiz
              </button>
            )}
            <button onClick={() => { 
              if (confirm(`Are you sure you want to delete "${quiz.title}"${quiz.isParent ? ' and all its sub-quizzes' : ''}?`)) { 
                onDelete(quiz.id); 
                setIsModalOpen(false); 
              } 
            }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors">
              Delete {quiz.isParent ? 'Category' : 'Quiz'}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const FormField = ({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    {children}
  </div>
);

const QuestionForm = ({ question, onSave, onCancel, questionNumber }: { 
  question?: Question; 
  onSave: (question: Question) => void; 
  onCancel: () => void; 
  questionNumber: number;
}) => {
  // ... existing question form code remains the same
  const [questionText, setQuestionText] = useState(question?.question || '');
  const [lesson, setLesson] = useState(question?.lesson || '');
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || 0);
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(question?.image || '');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!questionText.trim()) return alert('Please enter a question');
    if (!lesson.trim()) return alert('Please enter a lesson');
    if (options.some(opt => !opt.trim())) return alert('Please fill all options');
    
    onSave({
      id: question?.id || Date.now().toString(),
      question: questionText.trim(),
      lesson: lesson.trim(),
      image: imagePreview,
      options: options.map(opt => opt.trim()),
      correctAnswer,
      explanation: explanation.trim()
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-gray-50">
      <h4 className="font-semibold mb-4">Question {questionNumber}</h4>
      
      <FormField label="Question" required>
        <textarea 
          value={questionText} 
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question here..."
          className="w-full border border-gray-300 p-2 rounded h-20 resize-none"
        />
      </FormField>
      
      <FormField label="Lesson" required>
        <input 
          type="text"
          value={lesson} 
          onChange={(e) => setLesson(e.target.value)}
          placeholder="Enter lesson name (e.g., Crime Prevention, Cyber Security, etc.)"
          className="w-full border border-gray-300 p-2 rounded"
        />
      </FormField>
      
      <FormField label="Question Image (Optional)">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Question Preview" className="mt-2 w-32 h-20 object-cover rounded border" />
        )}
      </FormField>
      
      <FormField label="Options" required>
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="radio"
              name={`correct-${questionNumber}`}
              checked={correctAnswer === index}
              onChange={() => setCorrectAnswer(index)}
              className="mr-2"
            />
            <span className="mr-2 font-medium">{String.fromCharCode(65 + index)}.</span>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            {correctAnswer === index && <span className="ml-2 text-green-600 font-medium">✓ Correct</span>}
          </div>
        ))}
      </FormField>
      
      <FormField label="Explanation (Optional)">
        <textarea 
          value={explanation} 
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain why this is the correct answer..."
          className="w-full border border-gray-300 p-2 rounded h-16 resize-none"
        />
      </FormField>
      
      <div className="flex space-x-2">
        <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
          Save Question
        </button>
        <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
};

// Updated Add Quiz Form with parent selection
const AddQuizForm = ({ 
  onClose, 
  onSave, 
  initialQuiz,
  parentQuizzes,
  selectedParent 
}: { 
  onClose: () => void; 
  onSave: (quiz: Quiz) => void; 
  initialQuiz?: Quiz;
  parentQuizzes: Quiz[];
  selectedParent?: Quiz;
}) => {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [timer, setTimer] = useState(initialQuiz?.timer || 30);
  const [parentId, setParentId] = useState(initialQuiz?.parentId || selectedParent?.id || '');
  const [subjectDomain, setSubjectDomain] = useState(initialQuiz?.subjectDomain || selectedParent?.subjectDomain || '');
  const [skillArea, setSkillArea] = useState(initialQuiz?.skillArea || selectedParent?.skillArea || '');
  const [questions, setQuestions] = useState<Question[]>(initialQuiz?.questions || []);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const subjectDomains = [
    'cybersecurity',
    'crime_prevention',
    'emergency_preparedness',
    'financial_security',
    'personal_safety',
    'digital_literacy',
    'risk_assessment'
  ];

  const handleSaveQuestion = (question: Question) => {
    if (editingIndex !== null) {
      const newQuestions = [...questions];
      newQuestions[editingIndex] = question;
      setQuestions(newQuestions);
      setEditingIndex(null);
      setEditingQuestion(null);
    } else {
      setQuestions([...questions, question]);
    }
    setShowAddQuestion(false);
  };

  const handleEditQuestion = (question: Question, index: number) => {
    setEditingQuestion(question);
    setEditingIndex(index);
    setShowAddQuestion(true);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSaveQuiz = async () => {
    if (!title.trim() || questions.length === 0) {
      return alert('Please fill in the quiz title and add at least one question');
    }
    
    setLoading(true);
    
    try {
      const quizData = {
        title: title.trim(),
        timer,
        parentId: parentId || null,
        isParent: false, // This form is for sub-quizzes only
        subjectDomain: subjectDomain || null,
        skillArea: skillArea || null,
        questions
      };
      
      const response = await fetch(
        initialQuiz ? `/api/admin/quizzes/${initialQuiz.id}` : '/api/admin/quizzes',
        {
          method: initialQuiz ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizData),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }
      
      const savedQuiz = await response.json();
      onSave(savedQuiz);
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialQuiz ? 'Edit Sub-Quiz' : 'Add New Sub-Quiz'}
      </h3>
      
      {selectedParent && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            Adding sub-quiz to: <strong>{selectedParent.title}</strong>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField label="Sub-Quiz Title" required>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Password Security Quiz, Phishing Prevention Quiz"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </FormField>
        
        <FormField label="Timer per Question (seconds)">
          <input 
            type="number" 
            value={timer} 
            onChange={(e) => setTimer(Number(e.target.value))}
            min="10"
            max="300"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </FormField>

        {!selectedParent && (
          <FormField label="Parent Category (Optional)">
            <select 
              value={parentId} 
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Select parent category</option>
              {parentQuizzes.filter(p => p.isParent).map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.title}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Subject Domain (Optional)">
          <select 
            value={subjectDomain} 
            onChange={(e) => setSubjectDomain(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">Select domain for badge linking</option>
            {subjectDomains.map(domain => (
              <option key={domain} value={domain}>
                {domain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField label="Skill Area (Optional)">
          <input 
            type="text"
            value={skillArea} 
            onChange={(e) => setSkillArea(e.target.value)}
            placeholder="e.g., network_security, password_management"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </FormField>
      </div>
      
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Mastery Badge System:</strong> Create mastery badges that are automatically awarded based on performance:
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• <strong>Bronze:</strong> 60-74% accuracy with good time efficiency</li>
          <li>• <strong>Silver:</strong> 75-89% accuracy with good time efficiency</li>
          <li>• <strong>Gold:</strong> 90-99% accuracy with excellent time efficiency</li>
          <li>• <strong>Perfect:</strong> 100% accuracy (any time)</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold">Questions ({questions.length})</h4>
          <button 
            onClick={() => setShowAddQuestion(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
          >
            + Add Question
          </button>
        </div>
        
        {questions.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-500">
            No questions added yet. Add at least one question to create the quiz.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{index + 1}. {question.question}</p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">{question.lesson}</span>
                    </div>
                    {question.image && (
                      <img src={question.image} alt="Question" className="w-32 h-20 object-cover rounded border mb-2" />
                    )}
                    <div className="text-sm space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={`${optIndex === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                          {String.fromCharCode(65 + optIndex)}. {option} {optIndex === question.correctAnswer && <span className="text-green-600">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => handleEditQuestion(question, index)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteQuestion(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showAddQuestion && (
        <QuestionForm 
          question={editingQuestion || undefined}
          onSave={handleSaveQuestion}
          onCancel={() => { setShowAddQuestion(false); setEditingQuestion(null); setEditingIndex(null); }}
          questionNumber={editingIndex !== null ? editingIndex + 1 : questions.length + 1}
        />
      )}
      
      <div className="flex space-x-3">
        <button 
          onClick={handleSaveQuiz} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Saving...' : (initialQuiz ? 'Update Sub-Quiz' : 'Save Sub-Quiz')}
        </button>
        <button 
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedParent, setSelectedParent] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  // Mastery badge modal states
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Fetch quizzes and badges from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch quizzes with hierarchical structure
      const quizzesResponse = await fetch('/api/admin/quizzes');
      if (quizzesResponse.ok) {
        const data = await quizzesResponse.json();
        setQuizzes(data);
      }

      // Fetch badges
      const badgesResponse = await fetch('/api/admin/badges');
      if (badgesResponse.ok) {
        const data = await badgesResponse.json();
        setBadges(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        // Also remove associated badges
        setBadges(badges.filter(badge => badge.triggerValue !== quizId));
      } else {
        alert('Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const handleSaveQuiz = (savedQuiz: Quiz) => {
    if (editingQuiz) {
      setQuizzes(quizzes.map(quiz => quiz.id === savedQuiz.id ? savedQuiz : quiz));
      setEditingQuiz(null);
    } else {
      setQuizzes([savedQuiz, ...quizzes]);
    }
    setShowAddQuiz(false);
    setSelectedParent(null);
  };

  // Updated handleSaveParentQuiz function - replace in your component
  const handleSaveParentQuiz = async (parentData: { title: string }) => {
    try {
      console.log('Creating parent quiz with data:', parentData);
      
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: parentData.title,
          isParent: true,
          timer: 30,
          // Don't send questions field for parent quizzes
          subjectDomain: null,
          skillArea: null
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`Failed to create parent quiz: ${response.status} ${errorData}`);
      }
      
      const savedParent = await response.json();
      console.log('Parent quiz created successfully:', savedParent);
      
      setQuizzes([savedParent, ...quizzes]);
      setShowParentModal(false);
    } catch (error) {
      console.error('Error saving parent quiz:', error);
      throw error;
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowAddQuiz(true);
  };

  const handleCloseForm = () => {
    setShowAddQuiz(false);
    setEditingQuiz(null);
    setSelectedParent(null);
  };

  const handleAddSubQuiz = (parentQuiz: Quiz) => {
    setSelectedParent(parentQuiz);
    setShowAddQuiz(true);
  };

  const handleManageQuizBadge = (quiz: Quiz) => {
    if (quiz.isParent) {
      alert('Mastery badges can only be created for sub-quizzes, not parent categories.');
      return;
    }
    setSelectedQuiz(quiz);
    setShowBadgeModal(true);
  };

  const handleSaveBadges = async (savedBadges: Badge[]) => {
    try {
      // Save badges to API
      const promises = savedBadges.map(async (badge) => {
        const response = await fetch('/api/admin/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(badge),
        });
        return response.json();
      });

      const results = await Promise.all(promises);
      
      // Update local badges state
      const updatedBadges = [...badges];
      results.forEach(newBadge => {
        const existingIndex = updatedBadges.findIndex(b => b.id === newBadge.id);
        if (existingIndex >= 0) {
          updatedBadges[existingIndex] = newBadge;
        } else {
          updatedBadges.push(newBadge);
        }
      });
      
      setBadges(updatedBadges);
      setShowBadgeModal(false);
      setSelectedQuiz(null);
      
      alert(`Successfully created ${savedBadges.length} mastery badge(s)!`);
    } catch (error) {
      console.error('Error saving badges:', error);
      alert('Error saving badges. Please try again.');
    }
  };

  const handleCloseBadgeModal = () => {
    setShowBadgeModal(false);
    setSelectedQuiz(null);
  };

  // FIXED: Organize quizzes to only show parent quizzes and standalone sub-quizzes that need categories
  const parentQuizzes = quizzes.filter(quiz => quiz.isParent);
  const standaloneSubQuizzes = quizzes.filter(quiz => !quiz.isParent && !quiz.parentId);
  
  // Create quiz hierarchy for display
  const quizHierarchy = parentQuizzes.map(parentQuiz => ({
    ...parentQuiz,
    children: quizzes.filter(q => q.parentId === parentQuiz.id)
  }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quiz Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Create parent categories and sub-quizzes with automatic mastery badge system.
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowParentModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Category</span>
          </button>
          <button 
            onClick={() => setShowAddQuiz(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Sub-Quiz</span>
          </button>
        </div>
      </div>

      {showAddQuiz && (
        <AddQuizForm 
          onClose={handleCloseForm}
          onSave={handleSaveQuiz}
          initialQuiz={editingQuiz || undefined}
          parentQuizzes={quizzes}
          selectedParent={selectedParent || undefined}
        />
      )}

      {/* Parent Quiz Creation Modal */}
      <ParentQuizModal 
        isOpen={showParentModal}
        onClose={() => setShowParentModal(false)}
        onSave={handleSaveParentQuiz}
      />

      {/* Quiz Mastery Badge Creation Modal */}
      <QuizMasteryBadgeModal 
        isOpen={showBadgeModal}
        onClose={handleCloseBadgeModal}
        onSave={handleSaveBadges}
        targetQuiz={selectedQuiz}
        existingBadges={badges.filter(b => 
          selectedQuiz && 
          ['quiz_mastery_bronze', 'quiz_mastery_silver', 'quiz_mastery_gold', 'quiz_perfect'].includes(b.triggerType) && 
          b.triggerValue === selectedQuiz.id
        )}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Quiz Categories & Sub-Quizzes</h2>
        </div>
        <div className="p-6">
          {quizHierarchy.length === 0 && standaloneSubQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes created yet</h3>
              <p className="text-gray-600 mb-6">Create your first parent category or standalone quiz</p>
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={() => setShowParentModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded"
                >
                  Create Category
                </button>
                <button 
                  onClick={() => setShowAddQuiz(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
                >
                  Create Sub-Quiz
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-6">
                {/* Display parent quizzes with their children */}
                {quizHierarchy.map((quiz) => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    onView={handleEditQuiz}
                    onDelete={handleDeleteQuiz}
                    onAddSubQuiz={handleAddSubQuiz}
                    badges={badges}
                    onManageBadge={handleManageQuizBadge}
                  />
                ))}

                {/* Display standalone sub-quizzes that need to be assigned to categories */}
                {standaloneSubQuizzes.length > 0 && (
                  <>
                    <div className="border-t pt-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Standalone Sub-Quizzes</h3>
                        <p className="text-sm text-yellow-700">
                          These sub-quizzes are not assigned to any parent category. Consider organizing them under appropriate categories for better user experience.
                        </p>
                      </div>
                      
                      {standaloneSubQuizzes.map((quiz) => (
                        <QuizCard 
                          key={quiz.id} 
                          quiz={quiz} 
                          onView={handleEditQuiz}
                          onDelete={handleDeleteQuiz}
                          badges={badges}
                          onManageBadge={handleManageQuizBadge}
                          showAsStandalone={true}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Help text */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Quiz Management Guide</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• <strong>Parent Categories:</strong> Organize related quizzes under meaningful categories (e.g., "Cybersecurity Fundamentals")</p>
                  <p>• <strong>Sub-Quizzes:</strong> Individual quizzes with questions that users actually take</p>
                  <p>• <strong>Mastery Badges:</strong> Create automatic badges for Bronze (60-74%), Silver (75-89%), Gold (90-99%), and Perfect (100%) performance</p>
                  <p>• <strong>Hierarchical View:</strong> Expand parent categories to see and manage their sub-quizzes</p>
                  <p>• <strong>Standalone Quizzes:</strong> Sub-quizzes without parent categories are shown separately - assign them to categories for better organization</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}