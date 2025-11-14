//app/admin/quest/thursday/page.tsx
'use client';
import { useState } from 'react';
import { ChevronLeft, Save, Plus, Trash2, Upload, X } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  image: string;
  isAllowed: boolean;
  explanation: string;
}

export default function QuestThursdayAdmin() {
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      name: "KNIFE",
      image: "",
      isAllowed: false,
      explanation: "Knives are dangerous weapons and are confiscated for everyone's safety."
    },
    {
      id: '2',
      name: "BOOK",
      image: "",
      isAllowed: true,
      explanation: "Books are allowed! Reading materials are safe and educational."
    },
    {
      id: '3',
      name: "GUN",
      image: "",
      isAllowed: false,
      explanation: "Firearms are strictly prohibited and will be confiscated immediately."
    },
    {
      id: '4',
      name: "PHONE",
      image: "",
      isAllowed: true,
      explanation: "Mobile phones are allowed for communication and emergencies."
    },
    {
      id: '5',
      name: "DRUGS",
      image: "",
      isAllowed: false,
      explanation: "Illegal drugs are prohibited and will be confiscated by authorities."
    }
  ]);

  const handleSave = () => {
    console.log('Saving items:', items);
    alert('Quest Thursday saved successfully!');
  };

  const updateItem = (index: number, field: keyof Item, value: string | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
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
      const newItems = [...items];
      newItems[index].image = reader.result as string;
      setItems(newItems);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const newItems = [...items];
    newItems[index].image = '';
    setItems(newItems);
  };

  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: "",
      image: "",
      isAllowed: true,
      explanation: ""
    };
    setItems([...items, newItem]);
  };

  const deleteItem = (index: number) => {
    if (items.length <= 1) {
      alert('You must have at least one item!');
      return;
    }
    if (confirm('Are you sure you want to delete this item?')) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
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
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700 border-orange-300">
                Thursday
              </span>
              <h1 className="text-2xl font-bold text-gray-900">Confiscate or Allow</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">Quest Type: Item Inspection</p>
          </div>
          <button 
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border p-6">
              {/* Item Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Item {index + 1}</h2>
                </div>
                <button
                  onClick={() => deleteItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Image and Name */}
                <div>
                  {/* Item Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Image (for bubble speech)
                    </label>
                    <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center relative group">
                      {item.image ? (
                        <>
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-contain p-4"
                          />
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
                          <p className="text-xs text-gray-500">No image uploaded</p>
                        </div>
                      )}
                    </div>
                    <label className="block mt-2">
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
                      <div className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-lg text-center cursor-pointer transition-colors bg-white hover:bg-orange-50">
                        <span className="text-gray-700 font-medium">
                          {item.image ? 'Change Image' : 'Upload Image'}
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name (for bubble speech)
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="e.g., KNIFE, BOOK, PHONE"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
                    />
                  </div>
                </div>

                {/* Right Column: Decision and Explanation */}
                <div className="flex flex-col">
                  {/* Decision Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Decision
                    </label>
                    <div className="space-y-3">
                      <label className="cursor-pointer block">
                        <div className={`p-4 border-2 rounded-lg transition-all ${
                          !item.isAllowed 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 bg-white hover:border-red-300'
                        }`}>
                          <input
                            type="radio"
                            name={`decision-${item.id}`}
                            checked={!item.isAllowed}
                            onChange={() => updateItem(index, 'isAllowed', false)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              !item.isAllowed 
                                ? 'border-red-500 bg-red-500' 
                                : 'border-gray-300'
                            }`}>
                              {!item.isAllowed && (
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className={`font-bold text-lg ${
                                !item.isAllowed ? 'text-red-700' : 'text-gray-600'
                              }`}>
                                CONFISCATE
                              </span>
                              <p className="text-xs text-gray-600 mt-0.5">Item is not allowed</p>
                            </div>
                          </div>
                        </div>
                      </label>

                      <label className="cursor-pointer block">
                        <div className={`p-4 border-2 rounded-lg transition-all ${
                          item.isAllowed 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 bg-white hover:border-green-300'
                        }`}>
                          <input
                            type="radio"
                            name={`decision-${item.id}`}
                            checked={item.isAllowed}
                            onChange={() => updateItem(index, 'isAllowed', true)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              item.isAllowed 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300'
                            }`}>
                              {item.isAllowed && (
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className={`font-bold text-lg ${
                                item.isAllowed ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                ALLOW
                              </span>
                              <p className="text-xs text-gray-600 mt-0.5">Item is allowed</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation
                    </label>
                    <textarea
                      value={item.explanation}
                      onChange={(e) => updateItem(index, 'explanation', e.target.value)}
                      rows={4}
                      placeholder="Explain why this item should be confiscated or allowed..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Validation Warnings */}
              <div className="mt-4 space-y-2">
                {!item.name.trim() && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Warning: Item name is empty
                    </p>
                  </div>
                )}
                {!item.image && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      ⚠️ Warning: Item image is missing
                    </p>
                  </div>
                )}
                {!item.explanation.trim() && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      ⚠️ Warning: Explanation is empty
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <div className="mt-6">
          <button
            onClick={addItem}
            className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-2xl text-gray-600 hover:text-orange-600 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Item
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <h3 className="font-bold text-orange-900 mb-3">Instructions:</h3>
          <ul className="text-orange-800 space-y-2 text-sm">
            <li>• Upload an image for each item (will appear in bubble speech)</li>
            <li>• Enter the item name in UPPERCASE (e.g., KNIFE, BOOK, PHONE)</li>
            <li>• Select whether the item should be CONFISCATED or ALLOWED</li>
            <li>• Provide a clear explanation for why the decision is correct</li>
            <li>• Items should be related to security and safety inspection</li>
            <li>• Players get 3 lives (bullets) - wrong answers lose a life</li>
            <li>• Supported image formats: JPG, PNG, GIF (max 5MB)</li>
            <li>• Click "Save Changes" when done to update the quest</li>
          </ul>
        </div>
      </div>
    </div>
  );
}