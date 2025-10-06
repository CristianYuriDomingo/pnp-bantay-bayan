'use client';
import { useState, useEffect } from 'react';
import { Plus, FolderPlus, Edit2, Trash2, Award, ChevronDown, ChevronUp, Eye, X, Check, AlertCircle } from 'lucide-react';

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
  children?: Quiz[];
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
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_mastery' | 'parent_quiz_mastery' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Toast Notification Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`}>
    {type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-4"><X className="w-4 h-4" /></button>
  </div>
);

// Badge Modal Component
const BadgeModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  targetQuiz,
  existingBadge,
  badgeType,
  parentQuiz
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (badge: Badge) => void;
  targetQuiz: Quiz | null;
  existingBadge?: Badge;
  badgeType: 'sub' | 'parent';
  parentQuiz?: Quiz;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetQuiz) {
      if (existingBadge) {
        setName(existingBadge.name);
        setDescription(existingBadge.description);
        setImagePreview(existingBadge.image);
      } else {
        const suffix = badgeType === 'parent' ? 'Master' : 'Expert';
        setName(`${targetQuiz.title} ${suffix}`);
        setDescription(
          badgeType === 'parent'
            ? `Master all quizzes in ${targetQuiz.title} with 90%+ scores`
            : `Achieve 90%+ mastery on ${targetQuiz.title}`
        );
      }
    }
  }, [isOpen, targetQuiz, existingBadge, badgeType]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !imagePreview || !targetQuiz) {
      alert('Please fill in all required fields and select an image');
      return;
    }
    
    setLoading(true);
    try {
      const rarity: 'Legendary' | 'Epic' = badgeType === 'parent' ? 'Legendary' : 'Epic';
      const triggerType: 'parent_quiz_mastery' | 'quiz_mastery' = badgeType === 'parent' ? 'parent_quiz_mastery' : 'quiz_mastery';
      
      const badgeData = {
        ...(existingBadge?.id && { id: existingBadge.id }),
        name: name.trim(),
        description: description.trim(),
        image: imagePreview,
        category: parentQuiz?.title || targetQuiz.subjectDomain || 'Quiz Mastery',
        rarity: rarity,
        triggerType: triggerType,
        triggerValue: targetQuiz.id,
        xpValue: badgeType === 'parent' ? 100 : 50,
      };
      
      const method = existingBadge ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/badges', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) throw new Error('Failed to save badge');

      const savedBadge = await response.json();
      onSave(savedBadge);
      onClose();
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Error saving badge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetQuiz) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h3 className="text-xl font-semibold text-gray-900">
            {existingBadge ? 'Edit' : 'Create'} {badgeType === 'parent' ? 'Master' : 'Mastery'} Badge
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-lg ${badgeType === 'parent' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-start space-x-3">
              <Award className={`w-5 h-5 mt-0.5 ${badgeType === 'parent' ? 'text-yellow-600' : 'text-blue-600'}`} />
              <div>
                <p className={`text-sm font-medium ${badgeType === 'parent' ? 'text-yellow-900' : 'text-blue-900'}`}>
                  {badgeType === 'parent' ? 'Legendary Badge' : 'Epic Badge'}
                </p>
                <p className={`text-sm mt-1 ${badgeType === 'parent' ? 'text-yellow-700' : 'text-blue-700'}`}>
                  {badgeType === 'parent' 
                    ? 'Awarded when users achieve 90%+ on ALL sub-quizzes'
                    : 'Awarded when users score 90%+ on this quiz'}
                </p>
              </div>
            </div>
          </div>

          {badgeType === 'parent' && targetQuiz.children && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-2">Required Sub-quizzes:</p>
              <ul className="text-sm text-purple-700 space-y-1">
                {targetQuiz.children.map((child, idx) => (
                  <li key={child.id} className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs">{idx + 1}</span>
                    <span>{child.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badge Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Cybersecurity Expert"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe what this badge represents..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badge Image *</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-3 w-24 h-24 object-cover rounded-lg border-2 border-gray-200" />
            )}
          </div>
        </div>
        
        <div className="border-t px-6 py-4 flex space-x-3">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Saving...' : (existingBadge ? 'Update Badge' : 'Create Badge')}
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Question Form Component
const QuestionForm = ({ 
  question, 
  onSave, 
  onCancel, 
  questionNumber 
}: { 
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
  const [imagePreview, setImagePreview] = useState(question?.image || '');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-lg text-gray-900">Question {questionNumber}</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
        <textarea 
          value={questionText} 
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question..."
          className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lesson *</label>
          <input 
            type="text"
            value={lesson} 
            onChange={(e) => setLesson(e.target.value)}
            placeholder="e.g., Crime Prevention"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image (Optional)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
          />
        </div>
      </div>

      {imagePreview && (
        <img src={imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded-lg border" />
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options *</label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="radio"
                name={`correct-${questionNumber}`}
                checked={correctAnswer === index}
                onChange={() => setCorrectAnswer(index)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)}.</span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {correctAnswer === index && <Check className="w-5 h-5 text-green-600" />}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
        <textarea 
          value={explanation} 
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain why this is correct..."
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
      
      <div className="flex space-x-3 pt-2">
        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium">
          Save Question
        </button>
        <button onClick={onCancel} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
};

// Quiz Form Component
const QuizForm = ({ 
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
  const [questions, setQuestions] = useState<Question[]>(initialQuiz?.questions || []);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
    if (confirm('Delete this question?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuiz = async () => {
    if (!title.trim() || questions.length === 0) {
      alert('Please fill in the quiz title and add at least one question');
      return;
    }
    
    setLoading(true);
    
    try {
      const quizData = {
        title: title.trim(),
        timer,
        parentId: parentId || null,
        isParent: false,
        questions
      };
      
      const response = await fetch(
        initialQuiz ? `/api/admin/quizzes/${initialQuiz.id}` : '/api/admin/quizzes',
        {
          method: initialQuiz ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quizData),
        }
      );
      
      if (!response.ok) throw new Error('Failed to save quiz');
      
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {initialQuiz ? 'Edit Quiz' : 'Create New Quiz'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {selectedParent && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            Adding to category: <strong>{selectedParent.title}</strong>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Cybersecurity Basics"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timer (seconds) *</label>
          <input 
            type="number" 
            value={timer} 
            onChange={(e) => setTimer(Number(e.target.value))}
            min="10"
            max="300"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {!selectedParent && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category (Optional)</label>
            <select 
              value={parentId} 
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No category (standalone)</option>
              {parentQuizzes.filter(p => p.isParent).map(parent => (
                <option key={parent.id} value={parent.id}>{parent.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-900">Questions ({questions.length})</h4>
          {!showAddQuestion && (
            <button 
              onClick={() => {
                setShowAddQuestion(true);
                setEditingQuestion(null);
                setEditingIndex(null);
              }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          )}
        </div>
        
        {showAddQuestion && (
          <QuestionForm 
            question={editingQuestion || undefined}
            onSave={handleSaveQuestion}
            onCancel={() => {
              setShowAddQuestion(false);
              setEditingQuestion(null);
              setEditingIndex(null);
            }}
            questionNumber={editingIndex !== null ? editingIndex + 1 : questions.length + 1}
          />
        )}

        {!showAddQuestion && questions.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">No questions yet. Add at least one question.</p>
          </div>
        )}
        
        {!showAddQuestion && questions.length > 0 && (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-2">
                      <span className="font-semibold text-gray-900">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="text-gray-900 mb-1">{q.question}</p>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{q.lesson}</span>
                      </div>
                    </div>
                    {q.image && <img src={q.image} alt="" className="w-24 h-16 object-cover rounded mb-2" />}
                    <div className="text-sm space-y-1 mt-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className={i === q.correctAnswer ? 'text-green-700 font-medium' : 'text-gray-600'}>
                          {String.fromCharCode(65 + i)}. {opt} {i === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => handleEditQuestion(q, index)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteQuestion(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex space-x-3 pt-4 border-t">
        <button 
          onClick={handleSaveQuiz} 
          disabled={loading || questions.length === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : (initialQuiz ? 'Update Quiz' : 'Create Quiz')}
        </button>
        <button 
          onClick={onClose}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Parent Quiz Modal
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
      alert('Please enter a category title');
      return;
    }
    
    setLoading(true);
    try {
      await onSave({ title: title.trim() });
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error saving parent quiz:', error);
      alert('Error saving category');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Create Quiz Category</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Categories help organize related quizzes together. They don't contain questions themselves.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cybersecurity Fundamentals"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="border-t px-6 py-4 flex space-x-3">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Quiz Card Component
const QuizCard = ({ 
  quiz, 
  onView, 
  onDelete,
  onAddSubQuiz,
  badges,
  onManageSubQuizBadge,
  onManageParentBadge,
}: { 
  quiz: Quiz; 
  onView: (quiz: Quiz) => void; 
  onDelete: (quizId: string) => void;
  onAddSubQuiz?: (parentQuiz: Quiz) => void;
  badges: Badge[];
  onManageSubQuizBadge: (quiz: Quiz) => void;
  onManageParentBadge: (quiz: Quiz) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const subQuizBadge = !quiz.isParent ? badges.find(badge => 
    badge.triggerType === 'quiz_mastery' && badge.triggerValue === quiz.id
  ) : null;

  const parentQuizBadge = quiz.isParent ? badges.find(badge => 
    badge.triggerType === 'parent_quiz_mastery' && badge.triggerValue === quiz.id
  ) : null;

  const canCreateParentBadge = quiz.isParent && (quiz.children?.length || 0) > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-32 flex items-center justify-center ${
        quiz.isParent 
          ? 'bg-gradient-to-br from-purple-100 to-purple-200' 
          : 'bg-gradient-to-br from-blue-100 to-blue-200'
      }`}>
        <div className="text-center">
          <div className="text-4xl mb-2">
            {quiz.isParent ? '📂' : '📝'}
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            quiz.isParent 
              ? 'bg-purple-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {quiz.isParent ? 'CATEGORY' : 'QUIZ'}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 flex-1">{quiz.title}</h3>
          {quiz.isParent && quiz.children && quiz.children.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1 mb-4">
          {quiz.isParent ? (
            <>
              <div className="flex items-center space-x-2">
                <span>📁</span>
                <span>{quiz.children?.length || 0} sub-quizzes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>❓</span>
                <span>{quiz.children?.reduce((sum, child) => sum + child.questions.length, 0) || 0} total questions</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <span>❓</span>
                <span>{quiz.questions.length} questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⏱️</span>
                <span>{quiz.timer}s per question</span>
              </div>
            </>
          )}
        </div>
        
        {/* Badge Status */}
        <div className="mb-4">
          {quiz.isParent ? (
            parentQuizBadge ? (
              <div className="flex items-center space-x-2 text-yellow-600 text-sm bg-yellow-50 px-3 py-2 rounded-lg">
                <Award className="w-4 h-4" />
                <span className="font-medium">Master Badge Created</span>
              </div>
            ) : (
              <button 
                onClick={() => onManageParentBadge(quiz)}
                disabled={!canCreateParentBadge}
                className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  canCreateParentBadge
                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title={!canCreateParentBadge ? 'Add sub-quizzes first' : ''}
              >
                <Award className="w-4 h-4" />
                <span>Create Master Badge</span>
              </button>
            )
          ) : (
            subQuizBadge ? (
              <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                <Award className="w-4 h-4" />
                <span className="font-medium">Mastery Badge Created</span>
              </div>
            ) : (
              <button 
                onClick={() => onManageSubQuizBadge(quiz)}
                className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition border border-blue-200"
              >
                <Award className="w-4 h-4" />
                <span>Create Mastery Badge</span>
              </button>
            )
          )}
        </div>
        
        <div className="flex space-x-2">
          {quiz.isParent ? (
            <>
              <button 
                onClick={() => onAddSubQuiz && onAddSubQuiz(quiz)} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Quiz</span>
              </button>
              <button 
                onClick={() => onDelete(quiz.id)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onView(quiz)} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => onDelete(quiz.id)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                title="Delete quiz"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Sub-quizzes */}
      {quiz.isParent && isExpanded && quiz.children && quiz.children.length > 0 && (
        <div className="border-t bg-gray-50 p-4 space-y-3">
          {quiz.children.map((subQuiz) => (
            <div key={subQuiz.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{subQuiz.title}</h4>
                  <p className="text-sm text-gray-600">{subQuiz.questions.length} questions • {subQuiz.timer}s each</p>
                  {badges.find(b => b.triggerType === 'quiz_mastery' && b.triggerValue === subQuiz.id) && (
                    <span className="inline-flex items-center space-x-1 text-xs text-green-600 mt-1">
                      <Award className="w-3 h-3" />
                      <span>Has badge</span>
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(subQuiz)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit quiz"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(subQuiz.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedParent, setSelectedParent] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubQuizBadgeModal, setShowSubQuizBadgeModal] = useState(false);
  const [showParentQuizBadgeModal, setShowParentQuizBadgeModal] = useState(false);
  const [selectedQuizForBadge, setSelectedQuizForBadge] = useState<Quiz | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const quizzesResponse = await fetch('/api/admin/quizzes');
      if (quizzesResponse.ok) {
        const data = await quizzesResponse.json();
        setQuizzes(data);
      }

      const badgesResponse = await fetch('/api/admin/badges');
      if (badgesResponse.ok) {
        const data = await badgesResponse.json();
        setBadges(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!confirm(`Delete "${quiz?.title}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        setBadges(badges.filter(badge => badge.triggerValue !== quizId));
        showToast('Quiz deleted successfully');
      } else {
        showToast('Failed to delete quiz', 'error');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showToast('Failed to delete quiz', 'error');
    }
  };

  const handleSaveQuiz = (savedQuiz: Quiz) => {
    if (editingQuiz) {
      setQuizzes(quizzes.map(quiz => quiz.id === savedQuiz.id ? savedQuiz : quiz));
      showToast('Quiz updated successfully');
    } else {
      setQuizzes([savedQuiz, ...quizzes]);
      showToast('Quiz created successfully');
    }
    setShowAddQuiz(false);
    setEditingQuiz(null);
    setSelectedParent(null);
    fetchData();
  };

  const handleSaveParentQuiz = async (parentData: { title: string }) => {
    try {
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: parentData.title,
          isParent: true,
          timer: 30
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create category');
      
      const savedParent = await response.json();
      setQuizzes([savedParent, ...quizzes]);
      setShowParentModal(false);
      showToast('Category created successfully');
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to create category', 'error');
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

  const handleManageSubQuizBadge = (quiz: Quiz) => {
    if (quiz.isParent) return;
    setSelectedQuizForBadge(quiz);
    setShowSubQuizBadgeModal(true);
  };

  const handleManageParentBadge = (quiz: Quiz) => {
    if (!quiz.isParent || !quiz.children || quiz.children.length === 0) return;
    setSelectedQuizForBadge(quiz);
    setShowParentQuizBadgeModal(true);
  };

  const handleSaveBadge = (savedBadge: Badge) => {
    const existingIndex = badges.findIndex(b => b.id === savedBadge.id);
    if (existingIndex >= 0) {
      setBadges(badges.map((b, i) => i === existingIndex ? savedBadge : b));
      showToast('Badge updated successfully');
    } else {
      setBadges([...badges, savedBadge]);
      showToast('Badge created successfully');
    }
    
    setShowSubQuizBadgeModal(false);
    setShowParentQuizBadgeModal(false);
    setSelectedQuizForBadge(null);
  };

  const parentQuizzes = quizzes.filter(quiz => quiz.isParent);
  const standaloneSubQuizzes = quizzes.filter(quiz => !quiz.isParent && !quiz.parentId);
  
  const quizHierarchy = parentQuizzes.map(parentQuiz => ({
    ...parentQuiz,
    children: quizzes.filter(q => q.parentId === parentQuiz.id)
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600 mt-1">Organize quizzes into categories and create achievement badges</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowParentModal(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
            >
              <FolderPlus className="w-5 h-5" />
              <span>New Category</span>
            </button>
            <button 
              onClick={() => setShowAddQuiz(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>New Quiz</span>
            </button>
          </div>
        </div>

        {showAddQuiz && (
          <QuizForm 
            onClose={handleCloseForm}
            onSave={handleSaveQuiz}
            initialQuiz={editingQuiz || undefined}
            parentQuizzes={quizzes}
            selectedParent={selectedParent || undefined}
          />
        )}

        <ParentQuizModal 
          isOpen={showParentModal}
          onClose={() => setShowParentModal(false)}
          onSave={handleSaveParentQuiz}
        />

        <BadgeModal 
          isOpen={showSubQuizBadgeModal}
          onClose={() => {
            setShowSubQuizBadgeModal(false);
            setSelectedQuizForBadge(null);
          }}
          onSave={handleSaveBadge}
          targetQuiz={selectedQuizForBadge}
          existingBadge={selectedQuizForBadge ? badges.find(b => b.triggerType === 'quiz_mastery' && b.triggerValue === selectedQuizForBadge.id) : undefined}
          badgeType="sub"
          parentQuiz={selectedQuizForBadge?.parentId ? quizzes.find(q => q.id === selectedQuizForBadge.parentId) : undefined}
        />

        <BadgeModal 
          isOpen={showParentQuizBadgeModal}
          onClose={() => {
            setShowParentQuizBadgeModal(false);
            setSelectedQuizForBadge(null);
          }}
          onSave={handleSaveBadge}
          targetQuiz={selectedQuizForBadge}
          existingBadge={selectedQuizForBadge ? badges.find(b => b.triggerType === 'parent_quiz_mastery' && b.triggerValue === selectedQuizForBadge.id) : undefined}
          badgeType="parent"
        />

        {quizHierarchy.length === 0 && standaloneSubQuizzes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first category or quiz</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={() => setShowParentModal(true)}
                className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                <FolderPlus className="w-5 h-5" />
                <span>Create Category</span>
              </button>
              <button 
                onClick={() => setShowAddQuiz(true)}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                <Plus className="w-5 h-5" />
                <span>Create Quiz</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Categories with quizzes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizHierarchy.map((quiz) => (
                <QuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onView={handleEditQuiz}
                  onDelete={handleDeleteQuiz}
                  onAddSubQuiz={handleAddSubQuiz}
                  badges={badges}
                  onManageSubQuizBadge={handleManageSubQuizBadge}
                  onManageParentBadge={handleManageParentBadge}
                />
              ))}
            </div>

            {/* Standalone quizzes */}
            {standaloneSubQuizzes.length > 0 && (
              <div className="mt-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Uncategorized Quizzes</h3>
                      <p className="text-sm text-yellow-700">These quizzes aren't in any category. Consider organizing them for better structure.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standaloneSubQuizzes.map((quiz) => (
                    <QuizCard 
                      key={quiz.id} 
                      quiz={quiz} 
                      onView={handleEditQuiz}
                      onDelete={handleDeleteQuiz}
                      badges={badges}
                      onManageSubQuizBadge={handleManageSubQuizBadge}
                      onManageParentBadge={handleManageParentBadge}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>Badge System Guide</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p><strong className="text-purple-700">Categories:</strong> Organize related quizzes together</p>
                  <p><strong className="text-blue-700">Quiz Badges (Epic):</strong> Awarded at 90%+ score</p>
                </div>
                <div className="space-y-2">
                  <p><strong className="text-yellow-700">Master Badges (Legendary):</strong> Awarded when all category quizzes are mastered</p>
                  <p><strong className="text-green-700">Auto-Award:</strong> Badges are given automatically based on performance</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}