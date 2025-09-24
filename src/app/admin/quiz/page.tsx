'use client';
import { useState, useEffect } from 'react';

// Types
interface Quiz {
  id: string;
  title: string;
  timer: number;
  subjectDomain?: string;
  skillArea?: string;
  questions: Question[];
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

// Badge creation modal for quiz mastery badges
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
  const [badges, setBadges] = useState<{
    bronze: { name: string; description: string; image?: string; },
    silver: { name: string; description: string; image?: string; },
    gold: { name: string; description: string; image?: string; },
    perfect: { name: string; description: string; image?: string; }
  }>({
    bronze: { name: '', description: '', image: '' },
    silver: { name: '', description: '', image: '' },
    gold: { name: '', description: '', image: '' },
    perfect: { name: '', description: '', image: '' }
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetQuiz) {
      // Find existing badges
      const bronzeBadge = existingBadges.find(b => b.triggerType === 'quiz_mastery_bronze' && b.triggerValue === targetQuiz.id);
      const silverBadge = existingBadges.find(b => b.triggerType === 'quiz_mastery_silver' && b.triggerValue === targetQuiz.id);
      const goldBadge = existingBadges.find(b => b.triggerType === 'quiz_mastery_gold' && b.triggerValue === targetQuiz.id);
      const perfectBadge = existingBadges.find(b => b.triggerType === 'quiz_perfect' && b.triggerValue === targetQuiz.id);

      setBadges({
        bronze: {
          name: bronzeBadge?.name || `${targetQuiz.title} - Bronze`,
          description: bronzeBadge?.description || `Achieve Bronze mastery (60-74%) in ${targetQuiz.title}`,
          image: bronzeBadge?.image || ''
        },
        silver: {
          name: silverBadge?.name || `${targetQuiz.title} - Silver`,
          description: silverBadge?.description || `Achieve Silver mastery (75-89%) in ${targetQuiz.title}`,
          image: silverBadge?.image || ''
        },
        gold: {
          name: goldBadge?.name || `${targetQuiz.title} - Gold`,
          description: goldBadge?.description || `Achieve Gold mastery (90-99%) in ${targetQuiz.title}`,
          image: goldBadge?.image || ''
        },
        perfect: {
          name: perfectBadge?.name || `${targetQuiz.title} - Perfect`,
          description: perfectBadge?.description || `Achieve Perfect mastery (100%) in ${targetQuiz.title}`,
          image: perfectBadge?.image || ''
        }
      });
    }
  }, [isOpen, targetQuiz, existingBadges]);

  const handleImageChange = (level: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBadges(prev => ({
        ...prev,
        [level]: {
          ...prev[level as keyof typeof prev],
          image: e.target?.result as string
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!targetQuiz) return;
    
    // Validate that at least one badge has required fields
    const hasValidBadge = Object.values(badges).some(badge => 
      badge.name.trim() && badge.description.trim()
    );
    
    if (!hasValidBadge) {
      return alert('Please fill in at least one complete badge (name and description)');
    }
    
    setLoading(true);
    try {
      const badgesToCreate: Badge[] = [];
      
      const levels = [
        { key: 'bronze', triggerType: 'quiz_mastery_bronze' as const, rarity: 'Common' as const },
        { key: 'silver', triggerType: 'quiz_mastery_silver' as const, rarity: 'Rare' as const },
        { key: 'gold', triggerType: 'quiz_mastery_gold' as const, rarity: 'Epic' as const },
        { key: 'perfect', triggerType: 'quiz_perfect' as const, rarity: 'Legendary' as const }
      ];
      
      levels.forEach(level => {
        const badge = badges[level.key as keyof typeof badges];
        if (badge.name.trim() && badge.description.trim()) {
          // Find existing badge to preserve ID
          const existingBadge = existingBadges.find(b => 
            b.triggerType === level.triggerType && b.triggerValue === targetQuiz.id
          );
          
          badgesToCreate.push({
            id: existingBadge?.id || `${targetQuiz.id}-${level.key}-${Date.now()}`,
            name: badge.name.trim(),
            description: badge.description.trim(),
            image: badge.image || '/default-badge.png',
            category: 'Quiz Mastery',
            rarity: level.rarity,
            triggerType: level.triggerType,
            triggerValue: targetQuiz.id,
            createdAt: existingBadge?.createdAt || new Date(),
            updatedAt: new Date()
          });
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(badgesToCreate);
      onClose();
    } catch (error) {
      console.error('Error saving badges:', error);
      alert('Error saving badges');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetQuiz) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Create Quiz Mastery Badges - {targetQuiz.title}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Create badges for different mastery levels. Users earn these badges based on their quiz performance and time efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'bronze', label: 'Bronze Mastery', color: 'bg-amber-100 border-amber-300', requirements: '60-74% with good time efficiency' },
              { key: 'silver', label: 'Silver Mastery', color: 'bg-gray-100 border-gray-300', requirements: '75-89% with good time efficiency' },
              { key: 'gold', label: 'Gold Mastery', color: 'bg-yellow-100 border-yellow-300', requirements: '90-99% with excellent time efficiency' },
              { key: 'perfect', label: 'Perfect Mastery', color: 'bg-purple-100 border-purple-300', requirements: '100% accuracy with any time' }
            ].map(({ key, label, color, requirements }) => (
              <div key={key} className={`border rounded-lg p-4 ${color}`}>
                <h4 className="font-semibold mb-2">{label}</h4>
                <p className="text-xs text-gray-600 mb-3">{requirements}</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Badge Name</label>
                    <input 
                      type="text" 
                      value={badges[key as keyof typeof badges].name} 
                      onChange={(e) => setBadges(prev => ({
                        ...prev,
                        [key]: { ...prev[key as keyof typeof prev], name: e.target.value }
                      }))}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder={`${targetQuiz.title} - ${label}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea 
                      value={badges[key as keyof typeof badges].description} 
                      onChange={(e) => setBadges(prev => ({
                        ...prev,
                        [key]: { ...prev[key as keyof typeof prev], description: e.target.value }
                      }))}
                      className="w-full border border-gray-300 p-2 rounded h-16 resize-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Describe the ${label.toLowerCase()} achievement...`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Badge Image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageChange(key, file);
                      }}
                      className="w-full border border-gray-300 p-2 rounded"
                    />
                    {badges[key as keyof typeof badges].image && (
                      <img 
                        src={badges[key as keyof typeof badges].image} 
                        alt="Preview" 
                        className="mt-2 w-16 h-16 object-cover rounded border" 
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> These badges will be automatically awarded when users achieve the corresponding mastery levels. 
              The system calculates mastery based on both accuracy and time efficiency.
            </p>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Badges...' : 'Create Mastery Badges'}
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quiz mastery badge indicator component
const QuizMasteryBadgeIndicator = ({ 
  quizBadges, 
  onClick 
}: { 
  quizBadges: Badge[]; 
  onClick: () => void;
}) => {
  const masteryLevels = ['quiz_mastery_bronze', 'quiz_mastery_silver', 'quiz_mastery_gold', 'quiz_perfect'];
  const existingBadgeTypes = quizBadges.map(b => b.triggerType);
  const completedLevels = masteryLevels.filter(level => existingBadgeTypes.includes(level as Badge['triggerType']));
  
  if (completedLevels.length === 4) {
    return (
      <div className="flex items-center space-x-2 text-green-600 text-sm">
        <span className="text-lg">🏆</span>
        <span>All mastery badges created ({completedLevels.length}/4)</span>
        <button 
          onClick={onClick}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 text-sm border rounded-lg px-3 py-2 hover:bg-opacity-50 transition-colors ${
        completedLevels.length > 0 
          ? 'text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50' 
          : 'text-orange-600 hover:text-orange-800 border-orange-200 hover:bg-orange-50'
      }`}
    >
      <span className="text-lg">{completedLevels.length > 0 ? '⭐' : '🎯'}</span>
      <span>
        {completedLevels.length === 0 
          ? 'Add mastery badges' 
          : `Mastery badges (${completedLevels.length}/4)`
        }
      </span>
    </button>
  );
};

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => 
  isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Quiz Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        {children}
      </div>
    </div>
  ) : null;

const QuizCard = ({ 
  quiz, 
  onView, 
  onDelete,
  badges,
  onManageBadge 
}: { 
  quiz: Quiz; 
  onView: (quiz: Quiz) => void; 
  onDelete: (quizId: string) => void;
  badges: Badge[];
  onManageBadge: (quiz: Quiz) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get unique lessons from questions
  const uniqueLessons = [...new Set(quiz.questions.map(q => q.lesson))];
  
  // Get quiz mastery badges
  const quizBadges = badges.filter(badge => 
    ['quiz_mastery_bronze', 'quiz_mastery_silver', 'quiz_mastery_gold', 'quiz_perfect'].includes(badge.triggerType) && 
    badge.triggerValue === quiz.id
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow border overflow-hidden w-72">
        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl text-indigo-500 mb-2">🧠</div>
            {quiz.subjectDomain && (
              <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                {quiz.subjectDomain.replace('_', ' ').toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
          <div className="text-sm text-gray-600 mb-3">
            <div>📚 {uniqueLessons.length > 1 ? `${uniqueLessons.length} lessons` : uniqueLessons[0] || 'No lessons'}</div>
            <div>⏱️ {quiz.timer}s per question</div>
            <div>❓ {quiz.questions.length} questions</div>
            {quiz.skillArea && (
              <div className="text-xs text-blue-600 mt-1">🎯 {quiz.skillArea.replace('_', ' ')}</div>
            )}
          </div>
          
          {/* Mastery badge indicator */}
          <div className="mb-4">
            <QuizMasteryBadgeIndicator 
              quizBadges={quizBadges}
              onClick={() => onManageBadge(quiz)}
            />
          </div>
          
          <button onClick={() => setIsModalOpen(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition-colors">
            View Quiz
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{quiz.title}</h3>
          
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
            </div>
          </div>

          {/* Mastery badge status in modal */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Quiz Mastery Badges:</p>
            <QuizMasteryBadgeIndicator 
              quizBadges={quizBadges}
              onClick={() => {
                onManageBadge(quiz);
                setIsModalOpen(false);
              }}
            />
            {quizBadges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {quizBadges.map(badge => (
                  <span key={badge.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {badge.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Questions Preview:</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {quiz.questions.map((q, index) => (
                <div key={q.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{index + 1}. {q.question}</p>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{q.lesson}</span>
                  </div>
                  {q.image && (
                    <img src={q.image} alt="Question" className="w-32 h-20 object-cover rounded border mb-2" />
                  )}
                  <div className="text-sm space-y-1">
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className={`${optIndex === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                        {String.fromCharCode(65 + optIndex)}. {option} {optIndex === q.correctAnswer && <span className="text-green-600">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button onClick={() => { onView(quiz); setIsModalOpen(false); }} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
              Edit Quiz
            </button>
            <button onClick={() => { 
              if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) { 
                onDelete(quiz.id); 
                setIsModalOpen(false); 
              } 
            }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors">
              Delete Quiz
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

const AddQuizForm = ({ onClose, onSave, initialQuiz }: { onClose: () => void; onSave: (quiz: Quiz) => void; initialQuiz?: Quiz }) => {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [timer, setTimer] = useState(initialQuiz?.timer || 30);
  const [subjectDomain, setSubjectDomain] = useState(initialQuiz?.subjectDomain || '');
  const [skillArea, setSkillArea] = useState(initialQuiz?.skillArea || '');
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
        {initialQuiz ? 'Edit Quiz' : 'Add New Quiz'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField label="Quiz Title" required>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Cybersecurity Assessment Quiz"
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
          <strong>New Mastery Badge System:</strong> Create mastery badges that are automatically awarded based on performance:
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
          {loading ? 'Saving...' : (initialQuiz ? 'Update Quiz' : 'Save Quiz')}
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
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
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
      // Fetch quizzes
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
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowAddQuiz(true);
  };

  const handleCloseForm = () => {
    setShowAddQuiz(false);
    setEditingQuiz(null);
  };

  const handleManageQuizBadge = (quiz: Quiz) => {
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
      
      alert(`Successfully created ${savedBadges.length} mastery badge(s)! These will be automatically awarded when users achieve the corresponding performance levels.`);
    } catch (error) {
      console.error('Error saving badges:', error);
      alert('Error saving badges. Please try again.');
    }
  };

  const handleCloseBadgeModal = () => {
    setShowBadgeModal(false);
    setSelectedQuiz(null);
  };

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
            Create and manage quizzes with automatic mastery badge system that rewards performance and time efficiency.
          </p>
        </div>
        <button 
          onClick={() => setShowAddQuiz(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Quiz</span>
        </button>
      </div>

      {showAddQuiz && (
        <AddQuizForm 
          onClose={handleCloseForm}
          onSave={handleSaveQuiz}
          initialQuiz={editingQuiz || undefined}
        />
      )}

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
          <h2 className="text-lg font-semibold">Available Quizzes</h2>
        </div>
        <div className="p-6">
          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🧠</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes created yet</h3>
              <p className="text-gray-600 mb-6">Create your first quiz to get started with the mastery badge system</p>
              <button 
                onClick={() => setShowAddQuiz(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
              >
                Create First Quiz
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-6 mb-6">
                {quizzes.map((quiz) => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    onView={handleEditQuiz}
                    onDelete={handleDeleteQuiz}
                    badges={badges}
                    onManageBadge={handleManageQuizBadge}
                  />
                ))}
              </div>

              {/* Help text */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">New Mastery Badge System Guide</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• <strong>Automatic Badge Awards:</strong> Users earn badges based on quiz performance and time efficiency</p>
                  <p>• <strong>Four Mastery Levels:</strong> Bronze (60-74%), Silver (75-89%), Gold (90-99%), Perfect (100%)</p>
                  <p>• <strong>Smart Badge Management:</strong> Only awarded on new best scores to prevent badge inflation</p>
                  <p>• <strong>Subject Domain Linking:</strong> Quizzes can be linked to subject domains for advanced badge templates</p>
                  <p>• <strong>Badge Creation:</strong> Use the mastery badge buttons to create all four levels at once</p>
                  <p>• All mastery badges integrate with your existing Badge Management system</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}