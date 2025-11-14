//app/admin/quest/monday/page.tsx
'use client';
import { useState } from 'react';
import { ChevronLeft, Save, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Suspect {
  id: string;
  image: string;
  isCorrect: boolean;
}

interface Level {
  level: number;
  description: string;
  suspects: Suspect[];
}

export default function QuestMondayPage() {
  const router = useRouter();
  
  const [levels, setLevels] = useState<Level[]>([
    {
      level: 1,
      description: "Wearing red cap, tattoo on right arm",
      suspects: [
        { id: '1', image: '', isCorrect: false },
        { id: '2', image: '', isCorrect: true },
        { id: '3', image: '', isCorrect: false },
        { id: '4', image: '', isCorrect: false },
      ]
    },
    {
      level: 2,
      description: "Wearing blue jacket, has glasses",
      suspects: [
        { id: '5', image: '', isCorrect: false },
        { id: '6', image: '', isCorrect: false },
        { id: '7', image: '', isCorrect: true },
        { id: '8', image: '', isCorrect: false },
      ]
    },
    {
      level: 3,
      description: "Wearing green shirt, has beard",
      suspects: [
        { id: '9', image: '', isCorrect: true },
        { id: '10', image: '', isCorrect: false },
        { id: '11', image: '', isCorrect: false },
        { id: '12', image: '', isCorrect: false },
      ]
    }
  ]);

  const handleSave = () => {
    // Add your save logic here (API call, database update, etc.)
    console.log('Saving levels:', levels);
    alert('Quest Monday saved successfully!');
  };

  const updateDescription = (levelIndex: number, description: string) => {
    const newLevels = [...levels];
    newLevels[levelIndex].description = description;
    setLevels(newLevels);
  };

  const handleImageUpload = (levelIndex: number, suspectIndex: number, file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const newLevels = [...levels];
      newLevels[levelIndex].suspects[suspectIndex].image = reader.result as string;
      setLevels(newLevels);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (levelIndex: number, suspectIndex: number) => {
    const newLevels = [...levels];
    newLevels[levelIndex].suspects[suspectIndex].image = '';
    setLevels(newLevels);
  };

  const toggleCorrectSuspect = (levelIndex: number, suspectIndex: number) => {
    const newLevels = [...levels];
    // Set all to false first, then set the selected one to true
    newLevels[levelIndex].suspects.forEach((s, i) => {
      s.isCorrect = i === suspectIndex;
    });
    setLevels(newLevels);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border-blue-300">
                Monday
              </span>
              <h1 className="text-2xl font-bold text-gray-900">Suspect Line-Up</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">Quest Type: Line-Up</p>
          </div>
          <button 
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Levels */}
        <div className="space-y-8">
          {levels.map((level, levelIndex) => (
            <div key={level.level} className="bg-white rounded-2xl shadow-sm border p-6">
              {/* Level Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                  {level.level}
                </div>
                <h2 className="text-xl font-bold text-gray-900">Level {level.level}</h2>
              </div>

              {/* Suspect Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suspect Description
                </label>
                <textarea
                  value={level.description}
                  onChange={(e) => updateDescription(levelIndex, e.target.value)}
                  rows={2}
                  placeholder="e.g., Wearing red cap, tattoo on right arm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Suspects Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Suspects (Upload images and select the correct suspect)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {level.suspects.map((suspect, suspectIndex) => (
                    <div 
                      key={suspect.id} 
                      className={`relative border-2 rounded-xl p-4 transition-all ${
                        suspect.isCorrect 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {/* Correct Suspect Checkbox */}
                      <div className="absolute top-2 right-2 z-10">
                        <label className="flex items-center cursor-pointer bg-white rounded-md px-2 py-1 shadow-sm">
                          <input
                            type="checkbox"
                            checked={suspect.isCorrect}
                            onChange={() => toggleCorrectSuspect(levelIndex, suspectIndex)}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                          <span className="ml-2 text-xs font-medium text-gray-700">
                            {suspect.isCorrect ? 'Correct' : 'Wrong'}
                          </span>
                        </label>
                      </div>

                      {/* Suspect Number */}
                      <div className="text-center mb-2">
                        <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                          Suspect {suspectIndex + 1}
                        </span>
                      </div>

                      {/* Image Upload Area */}
                      <div className="mb-3 bg-gray-100 rounded-lg overflow-hidden aspect-[3/4] flex items-center justify-center relative group">
                        {suspect.image ? (
                          <>
                            <img 
                              src={suspect.image} 
                              alt={`Suspect ${suspectIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Remove Image Button */}
                            <button
                              onClick={() => removeImage(levelIndex, suspectIndex)}
                              className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">No image</p>
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
                              handleImageUpload(levelIndex, suspectIndex, file);
                            }
                          }}
                          className="hidden"
                        />
                        <div className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg text-center cursor-pointer transition-colors bg-white hover:bg-blue-50">
                          <span className="text-gray-700 font-medium">
                            {suspect.image ? 'Change Image' : 'Upload Image'}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Warning */}
              {level.suspects.filter(s => s.isCorrect).length !== 1 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Warning: Please select exactly one correct suspect for this level.
                    Currently selected: {level.suspects.filter(s => s.isCorrect).length}
                  </p>
                </div>
              )}

              {/* Missing Images Warning */}
              {level.suspects.filter(s => !s.image).length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ Warning: {level.suspects.filter(s => !s.image).length} suspect(s) missing image.
                    Please upload images for all suspects.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">Instructions:</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Each level must have exactly one correct suspect</li>
            <li>• Upload images for all 4 suspects in each level</li>
            <li>• Write clear descriptions that match the correct suspect</li>
            <li>• Supported formats: JPG, PNG, GIF (max 5MB per image)</li>
            <li>• Hover over uploaded images to see the remove button</li>
            <li>• Click "Save Changes" when done to update the quest</li>
          </ul>
        </div>
      </div>
    </div>
  );
}