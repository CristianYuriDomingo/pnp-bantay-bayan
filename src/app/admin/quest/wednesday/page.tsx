'use client';
import { useState } from 'react';
import { ChevronLeft, Save, Plus, X, Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuestWednesdayAdmin() {
  const router = useRouter();
  
  const [questData, setQuestData] = useState({
    description: "PNP", // The blank to fill: "Arrange the digits to form a valid (___) mobile number"
    correctNumber: ['0', '9', '5', '5', '9', '6', '2', '7', '3', '3', '1'],
    shuffledDigits: ['5', '5', '9', '6', '2', '7', '3', '3', '1']
  });

  const handleSave = () => {
    // Validation
    if (!questData.description.trim()) {
      alert('Please enter a description (e.g., PNP, Emergency, Fire Station)');
      return;
    }

    if (questData.correctNumber.length !== 11) {
      alert('Phone number must be exactly 11 digits');
      return;
    }

    if (questData.shuffledDigits.length !== 9) {
      alert('Shuffled digits must be exactly 9 digits (excluding first two 0 and 9)');
      return;
    }

    // Check if shuffled digits match the last 9 digits of correct number
    const lastNineDigits = questData.correctNumber.slice(2);
    const shuffledSorted = [...questData.shuffledDigits].sort();
    const correctSorted = [...lastNineDigits].sort();
    
    if (JSON.stringify(shuffledSorted) !== JSON.stringify(correctSorted)) {
      alert('Shuffled digits must contain the same digits as positions 3-11 of the correct number');
      return;
    }

    console.log('Saving quest data:', questData);
    alert('Quest Wednesday saved successfully!');
  };

  const updateDescription = (value: string) => {
    setQuestData(prev => ({
      ...prev,
      description: value
    }));
  };

  const updateCorrectNumber = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return; // Only allow single digits
    
    const newNumber = [...questData.correctNumber];
    newNumber[index] = value;
    setQuestData(prev => ({
      ...prev,
      correctNumber: newNumber
    }));

    // Auto-update shuffled digits (excluding first two digits 0 and 9)
    if (index >= 2) {
      const lastNine = newNumber.slice(2).filter(d => d !== '');
      if (lastNine.length === 9) {
        setQuestData(prev => ({
          ...prev,
          shuffledDigits: lastNine
        }));
      }
    }
  };

  const updateShuffledDigit = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    
    const newShuffled = [...questData.shuffledDigits];
    newShuffled[index] = value;
    setQuestData(prev => ({
      ...prev,
      shuffledDigits: newShuffled
    }));
  };

  const shuffleDigits = () => {
    const shuffled = [...questData.shuffledDigits].sort(() => Math.random() - 0.5);
    setQuestData(prev => ({
      ...prev,
      shuffledDigits: shuffled
    }));
  };

  const autoGenerateFromCorrect = () => {
    const lastNine = questData.correctNumber.slice(2);
    if (lastNine.every(d => d !== '')) {
      const shuffled = [...lastNine].sort(() => Math.random() - 0.5);
      setQuestData(prev => ({
        ...prev,
        shuffledDigits: shuffled
      }));
    } else {
      alert('Please complete the correct number first (all 11 digits)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border">
          <button 
            onClick={() => router.push('/admin/quest')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Quests
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700 border-purple-300">
                Wednesday
              </span>
              <h1 className="text-2xl font-bold text-gray-900">Code the Call</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">Quest Type: Number Puzzle</p>
          </div>
          <button 
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Description Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quest Description</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fill in the blank: "Arrange the digits to form a valid (_____) mobile number"
              </label>
              <input
                type="text"
                value={questData.description}
                onChange={(e) => updateDescription(e.target.value)}
                placeholder="e.g., PNP, Emergency, Fire Station"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <p className="text-xs text-gray-500 mt-2">
                This will appear as: "Arrange the digits to form a valid <strong>{questData.description || '(_____)'}</strong> mobile number"
              </p>
            </div>
          </div>

          {/* Correct Number Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Correct Phone Number</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter the complete 11-digit phone number
              </label>
              
              <div className="flex gap-2 flex-wrap">
                {questData.correctNumber.map((digit, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <input
                      type="text"
                      value={digit}
                      onChange={(e) => updateCorrectNumber(index, e.target.value)}
                      maxLength={1}
                      disabled={index === 0 || index === 1}
                      className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${index === 0 || index === 1 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'bg-white'
                        }`}
                    />
                    <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ First two digits (0 and 9) are fixed. Users will arrange the remaining 9 digits.
                </p>
              </div>
            </div>
          </div>

          {/* Shuffled Digits Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Shuffled Digits</h2>
              <div className="flex gap-2">
                <button
                  onClick={autoGenerateFromCorrect}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Auto-Generate
                </button>
                <button
                  onClick={shuffleDigits}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors font-medium text-sm"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                These 9 digits will be shown to users (in shuffled order)
              </label>
              
              <div className="flex gap-2 flex-wrap">
                {questData.shuffledDigits.map((digit, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <input
                      type="text"
                      value={digit}
                      onChange={(e) => updateShuffledDigit(index, e.target.value)}
                      maxLength={1}
                      className="w-14 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ These digits must match positions 3-11 of the correct number (just in different order)
                </p>
              </div>
            </div>
          </div>

          {/* Validation Warnings */}
          {questData.correctNumber.some(d => d === '') && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                ⚠️ Warning: Please complete all 11 digits of the correct number
              </p>
            </div>
          )}

          {questData.shuffledDigits.some(d => d === '') && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                ⚠️ Warning: Please complete all 9 shuffled digits
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 mb-3">Instructions:</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• Enter a descriptive name (e.g., "PNP", "Emergency", "Fire Station") for the phone number type</li>
              <li>• First two digits are automatically set to "0" and "9" (Philippine mobile number format)</li>
              <li>• Enter the remaining 9 digits to complete the 11-digit phone number</li>
              <li>• Click "Auto-Generate" to automatically create shuffled digits from your correct number</li>
              <li>• Click "Shuffle" to randomize the order of the shuffled digits</li>
              <li>• Shuffled digits must contain the exact same digits as positions 3-11 of the correct number</li>
              <li>• Players will need to arrange these shuffled digits in the correct order</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}