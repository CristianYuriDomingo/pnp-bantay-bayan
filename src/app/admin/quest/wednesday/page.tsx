// app/admin/quest/wednesday/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Shuffle, Loader2 } from 'lucide-react';

export default function QuestWednesdayAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questId, setQuestId] = useState<string | null>(null);
  const [title, setTitle] = useState('Code the Call');
  
  const [questData, setQuestData] = useState({
    description: "PNP", // The blank to fill
    networkName: "Smart", // NEW: Network provider
    correctNumber: ['0', '9', '5', '5', '9', '6', '2', '7', '3', '3', '1'],
    shuffledDigits: ['5', '5', '9', '6', '2', '7', '3', '3', '1']
  });

  // Fetch existing quest data
  useEffect(() => {
    fetchQuestData();
  }, []);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/quest/wednesday');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setQuestId(data.data.id);
          setTitle(data.data.title);
          
          const correctNumberArray = data.data.correctNumber.split('');
          const shuffledArray = Array.isArray(data.data.shuffledDigits) 
            ? data.data.shuffledDigits 
            : JSON.parse(data.data.shuffledDigits);
          
          setQuestData({
            description: data.data.description,
            networkName: data.data.networkName,
            correctNumber: correctNumberArray,
            shuffledDigits: shuffledArray
          });
        }
      } else if (response.status === 404) {
        console.log('No existing quest found, using defaults');
      } else {
        const errorData = await response.json();
        console.error('Error fetching quest:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching quest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!questData.description.trim()) {
      alert('Please enter a description (e.g., PNP, Emergency, Fire Station)');
      return;
    }

    if (!questData.networkName.trim()) {
      alert('Please enter a network name (e.g., Globe, Smart, TM)');
      return;
    }

    if (questData.correctNumber.length !== 11) {
      alert('Phone number must be exactly 11 digits');
      return;
    }

    if (questData.correctNumber.some(d => d === '')) {
      alert('Please complete all 11 digits of the correct number');
      return;
    }

    if (questData.shuffledDigits.length !== 9) {
      alert('Shuffled digits must be exactly 9 digits (excluding first two 0 and 9)');
      return;
    }

    if (questData.shuffledDigits.some(d => d === '')) {
      alert('Please complete all 9 shuffled digits');
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

    try {
      setSaving(true);

      const payload = {
        questId,
        title,
        description: questData.description,
        networkName: questData.networkName,
        correctNumber: questData.correctNumber.join(''),
        shuffledDigits: questData.shuffledDigits
      };

      const url = '/api/admin/quest/wednesday';
      const method = questId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save quest');
      }

      alert(data.message || 'Quest Wednesday saved successfully!');
      
      if (data.data?.id) {
        setQuestId(data.data.id);
      }

      await fetchQuestData();

    } catch (error) {
      console.error('Error saving quest:', error);
      alert(error instanceof Error ? error.message : 'Failed to save quest');
    } finally {
      setSaving(false);
    }
  };

  const updateDescription = (value: string) => {
    setQuestData(prev => ({
      ...prev,
      description: value
    }));
  };

  const updateNetworkName = (value: string) => {
    setQuestData(prev => ({
      ...prev,
      networkName: value
    }));
  };

  const updateCorrectNumber = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Quest Wednesday...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700 border-purple-300">
                Wednesday
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none bg-transparent"
                placeholder="Quest Title"
              />
            </div>
            <p className="text-sm text-gray-600">Quest Type: Number Puzzle</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Description Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quest Description</h2>
            
            <div className="space-y-4">
              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization/Purpose
                </label>
                <input
                  type="text"
                  value={questData.description}
                  onChange={(e) => updateDescription(e.target.value)}
                  placeholder="e.g., PNP, Emergency, Fire Station"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will appear as: &quot;Arrange the digits to form a valid <strong>{questData.description || '(_____)'}</strong> mobile number&quot;
                </p>
              </div>

              {/* Network Name Input - NEW */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Network Provider
                </label>
                <input
                  type="text"
                  value={questData.networkName}
                  onChange={(e) => updateNetworkName(e.target.value)}
                  placeholder="e.g., Globe, Smart, TM, TNT"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Network name will be displayed to users (e.g., &quot;Smart&quot;, &quot;Globe&quot;)
                </p>
              </div>
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
                      className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
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
                      className="w-14 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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

          {!questData.description.trim() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                ⚠️ Warning: Organization/Purpose is empty
              </p>
            </div>
          )}

          {!questData.networkName.trim() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                ⚠️ Warning: Network Provider is empty
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
            <h3 className="font-bold text-purple-900 mb-3">Instructions:</h3>
            <ul className="text-purple-800 space-y-2 text-sm">
              <li>• Enter the organization/purpose (e.g., &quot;PNP&quot;, &quot;Emergency&quot;, &quot;Fire Station&quot;)</li>
              <li>• Enter the network provider (e.g., &quot;Globe&quot;, &quot;Smart&quot;, &quot;TM&quot;, &quot;TNT&quot;)</li>
              <li>• First two digits are automatically set to "0" and "9" (Philippine mobile number format)</li>
              <li>• Enter the remaining 9 digits to complete the 11-digit phone number</li>
              <li>• Click "Auto-Generate" to automatically create shuffled digits from your correct number</li>
              <li>• Click "Shuffle" to randomize the order of the shuffled digits</li>
              <li>• Shuffled digits must contain the exact same digits as positions 3-11 of the correct number</li>
              <li>• Players will need to arrange these shuffled digits in the correct order</li>
              <li>• Click "Save Changes" when done to update the quest</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}