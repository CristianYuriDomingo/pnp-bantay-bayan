// app/admin/quest/friday/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Upload, X, Loader2 } from 'lucide-react';

interface RankOption {
  id?: string;
  rankName: string;
  rankImage: string;
  isCorrect: boolean;
}

export default function QuestFridayAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questId, setQuestId] = useState<string | null>(null);
  const [title, setTitle] = useState('Guess The Rank');
  const [instructionText, setInstructionText] = useState('Police Corporal');
  
  const [rankOptions, setRankOptions] = useState<RankOption[]>([
    { rankName: 'POLICE MASTER SERGEANT', rankImage: '', isCorrect: false },
    { rankName: 'POLICE CORPORAL', rankImage: '', isCorrect: true },
    { rankName: 'PATROLMAN', rankImage: '', isCorrect: false },
  ]);

  // Fetch existing quest data
  useEffect(() => {
    fetchQuestData();
  }, []);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/quest/friday');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setQuestId(data.data.id);
          setTitle(data.data.title);
          setInstructionText(data.data.instruction);
          setRankOptions(data.data.rankOptions.map((option: any) => ({
            id: option.id,
            rankName: option.rankName,
            rankImage: option.rankImage,
            isCorrect: option.isCorrect
          })));
        }
      } else if (response.status === 404) {
        // No quest exists yet, use default values
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

    if (!instructionText.trim()) {
      alert('Please enter instruction text');
      return;
    }

    if (rankOptions.length !== 3) {
      alert('Must have exactly 3 rank options');
      return;
    }

    // Validate each rank option
    for (let i = 0; i < rankOptions.length; i++) {
      const option = rankOptions[i];
      if (!option.rankName.trim()) {
        alert(`Rank option ${i + 1} name is empty`);
        return;
      }
      if (!option.rankImage) {
        alert(`Rank option ${i + 1} image is missing`);
        return;
      }
    }

    // Check exactly one correct answer
    const correctCount = rankOptions.filter(opt => opt.isCorrect).length;
    if (correctCount !== 1) {
      alert(`Must have exactly one correct answer. Currently: ${correctCount}`);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        questId,
        title,
        instruction: instructionText,
        rankOptions: rankOptions.map(({ id, ...option }) => option) // Remove id for API
      };

      const url = '/api/admin/quest/friday';
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

      alert(data.message || 'Quest Friday saved successfully!');
      
      // Update questId if it was a new creation
      if (data.data?.id) {
        setQuestId(data.data.id);
      }

      // Refresh data
      await fetchQuestData();

    } catch (error) {
      console.error('Error saving quest:', error);
      alert(error instanceof Error ? error.message : 'Failed to save quest');
    } finally {
      setSaving(false);
    }
  };

  const updateRankLabel = (index: number, label: string) => {
    const newOptions = [...rankOptions];
    newOptions[index].rankName = label;
    setRankOptions(newOptions);
  };

  const handleImageUpload = (index: number, file: File) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newOptions = [...rankOptions];
      newOptions[index].rankImage = reader.result as string;
      setRankOptions(newOptions);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const newOptions = [...rankOptions];
    newOptions[index].rankImage = '';
    setRankOptions(newOptions);
  };

  const toggleCorrectAnswer = (index: number) => {
    const newOptions = [...rankOptions];
    // Set all to false first, then set the selected one to true
    newOptions.forEach((opt, i) => {
      opt.isCorrect = i === index;
    });
    setRankOptions(newOptions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Quest Friday...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-pink-100 text-pink-700 border-pink-300">
                Friday
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-pink-500 focus:outline-none bg-transparent"
                placeholder="Quest Title"
              />
            </div>
            <p className="text-sm text-gray-600">Quest Type: Drag & Drop</p>
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

        {/* Instruction Text */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Game Instruction</h2>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drag Pibi to the __________ Rank
          </label>
          <input
            type="text"
            value={instructionText}
            onChange={(e) => setInstructionText(e.target.value)}
            placeholder="e.g., Police Corporal"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            This text will appear in the instruction: "Drag Pibi to the <strong>{instructionText}</strong> Rank"
          </p>
        </div>

        {/* Rank Options */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Rank Insignia Options</h2>
            <span className="text-sm text-gray-600">Upload 3 rank insignia images</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rankOptions.map((option, index) => (
              <div 
                key={index}
                className={`relative border-2 rounded-xl p-4 transition-all ${
                  option.isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-white'
                }`}
              >
                {/* Correct Answer Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <label className="flex items-center cursor-pointer bg-white rounded-md px-2 py-1 shadow-sm">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={() => toggleCorrectAnswer(index)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                    />
                    <span className="ml-2 text-xs font-medium text-gray-700">
                      {option.isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </label>
                </div>

                {/* Option Number */}
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                    Option {index + 1}
                  </span>
                </div>

                {/* Image Upload Area */}
                <div className="mb-3 bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center relative group">
                  {option.rankImage ? (
                    <>
                      <img 
                        src={option.rankImage} 
                        alt={option.rankName}
                        className="w-full h-full object-contain p-4"
                      />
                      {/* Remove Image Button */}
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No insignia</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(index, file);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 hover:border-pink-500 rounded-lg text-center cursor-pointer transition-colors bg-white hover:bg-pink-50">
                    <span className="text-gray-700 font-medium">
                      {option.rankImage ? 'Change Insignia' : 'Upload Insignia'}
                    </span>
                  </div>
                </label>

                {/* Validation Warnings */}
                {!option.rankName.trim() && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    ⚠️ Rank name is empty
                  </div>
                )}
                {!option.rankImage && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                    ⚠️ Insignia image missing
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Global Validation Warning */}
          {rankOptions.filter(opt => opt.isCorrect).length !== 1 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Warning: Please select exactly one correct rank insignia.
                Currently selected: {rankOptions.filter(opt => opt.isCorrect).length}
              </p>
            </div>
          )}

          {/* Missing Images Warning */}
          {rankOptions.filter(opt => !opt.rankImage).length > 0 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                ⚠️ Warning: {rankOptions.filter(opt => !opt.rankImage).length} insignia image(s) missing.
                Please upload images for all rank options.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-pink-50 border border-pink-200 rounded-2xl p-6">
          <h3 className="font-bold text-pink-900 mb-3">Instructions:</h3>
          <ul className="text-pink-800 space-y-2 text-sm">
            <li>• Upload 3 different rank insignia images (police badges/emblems)</li>
            <li>• Enter the rank name for each insignia in UPPERCASE</li>
            <li>• Select exactly one rank as the correct answer</li>
            <li>• Set the instruction text to match the correct rank name</li>
            <li>• Players will drag Pibi character to the correct insignia</li>
            <li>• Supported formats: JPG, PNG, GIF (max 5MB per image)</li>
            <li>• Insignia images should be clear and easily distinguishable</li>
            <li>• Click "Save Changes" when done to update the quest</li>
          </ul>
        </div>
      </div>
    </div>
  );
}