//app/admin/quest/tuesday/page.tsx
'use client';
import { useState } from 'react';
import { ChevronLeft, Save, Plus, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  correctAnswer: boolean;
  explanation: string;
}

export default function QuestTuesdayAdmin() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: "Should I join terrorist groups?",
      correctAnswer: false,
      explanation: "Never join terrorist groups. They promote violence and harm innocent people."
    },
    {
      id: '2',
      question: "Should I report suspicious activities to the police?",
      correctAnswer: true,
      explanation: "Yes! Reporting suspicious activities helps keep our community safe."
    },
    {
      id: '3',
      question: "Is it okay to share fake news about crimes?",
      correctAnswer: false,
      explanation: "Sharing fake news causes panic and misinformation. Always verify before sharing."
    },
    {
      id: '4',
      question: "Should I cooperate with police officers when asked?",
      correctAnswer: true,
      explanation: "Cooperation with law enforcement helps maintain peace and order."
    },
    {
      id: '5',
      question: "Can I take the law into my own hands?",
      correctAnswer: false,
      explanation: "Vigilante actions are illegal. Always let authorities handle law enforcement."
    }
  ]);

  const handleSave = () => {
    console.log('Saving questions:', questions);
    alert('Quest Tuesday saved successfully!');
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | boolean) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      correctAnswer: true,
      explanation: ""
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('You must have at least one question!');
      return;
    }
    if (confirm('Are you sure you want to delete this question?')) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border">
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Quests
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700 border-purple-300">
                Tuesday
              </span>
              <h1 className="text-2xl font-bold text-gray-900">Free or Jail Quiz</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">Quest Type: True/False</p>
          </div>
          <button 
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-2xl shadow-sm border p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Question {index + 1}</h2>
                </div>
                <button
                  onClick={() => deleteQuestion(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Question Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  rows={2}
                  placeholder="Enter your question here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Correct Answer Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Correct Answer
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className={`p-4 border-2 rounded-lg transition-all ${
                      question.correctAnswer 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 bg-white hover:border-green-300'
                    }`}>
                      <input
                        type="radio"
                        name={`answer-${question.id}`}
                        checked={question.correctAnswer}
                        onChange={() => updateQuestion(index, 'correctAnswer', true)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          question.correctAnswer 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300'
                        }`}>
                          {question.correctAnswer && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className={`font-bold text-lg ${
                          question.correctAnswer ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          TRUE
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className="flex-1 cursor-pointer">
                    <div className={`p-4 border-2 rounded-lg transition-all ${
                      !question.correctAnswer 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 bg-white hover:border-red-300'
                    }`}>
                      <input
                        type="radio"
                        name={`answer-${question.id}`}
                        checked={!question.correctAnswer}
                        onChange={() => updateQuestion(index, 'correctAnswer', false)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          !question.correctAnswer 
                            ? 'border-red-500 bg-red-500' 
                            : 'border-gray-300'
                        }`}>
                          {!question.correctAnswer && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className={`font-bold text-lg ${
                          !question.correctAnswer ? 'text-red-700' : 'text-gray-600'
                        }`}>
                          FALSE
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Explanation Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation
                </label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                  rows={2}
                  placeholder="Explain why this answer is correct..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Validation Warnings */}
              {!question.question.trim() && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Warning: Question text is empty
                  </p>
                </div>
              )}
              {!question.explanation.trim() && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ Warning: Explanation is empty
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <div className="mt-6">
          <button
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-2xl text-gray-600 hover:text-purple-600 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="font-bold text-purple-900 mb-3">Instructions:</h3>
          <ul className="text-purple-800 space-y-2 text-sm">
            <li>• Each question must have a clear question text</li>
            <li>• Select TRUE or FALSE as the correct answer</li>
            <li>• Provide an explanation for why the answer is correct</li>
            <li>• Questions should be related to safety and law enforcement</li>
            <li>• Players get 3 lives (bullets) - wrong answers lose a life</li>
            <li>• Click "Add New Question" to add more questions</li>
            <li>• Click "Save Changes" when done to update the quest</li>
          </ul>
        </div>
      </div>
    </div>
  );
}