"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Lesson {
  id: string;
  title: string;
  path: string;
  description?: string;
  moduleId?: string;
  moduleName?: string;
}

interface LessonCategory {
  category: string;
  image: string;
  moduleId: string;
  lessons: Lesson[];
}

interface ApiResponse {
  success: boolean;
  data: LessonCategory[];
  total: number;
  error?: string;
}

// Updated Modal Component
const Modal = ({ isOpen, onClose, children, imageSrc }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  imageSrc?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg mx-4">
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
          <img
            src={imageSrc || "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=128&h=128&fit=crop&crop=face"}
            alt="Modal"
            className="w-32 h-32 object-cover shadow-lg"
          />
        </div>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-blue-500 hover:text-gray-900 text-xl font-bold"
        >
          ✖
        </button>
        <div className="mt-14">{children}</div>
      </div>
    </div>
  );
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<LessonCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState<LessonCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setError('');
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (term: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();

      if (data.success) {
        setSearchResults(data.data);
        setShowDropdown(data.data.length > 0 || true);
      } else {
        setError(data.error || 'Search failed');
        setSearchResults([]);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setSearchResults([]);
      setShowDropdown(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setShowDropdown(false);
      setSearchResults([]);
      setError('');
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() && (searchResults.length > 0 || error)) {
      setShowDropdown(true);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setShowDropdown(false);
    setIsModalOpen(false);
    router.push(`/users/lessons/${lesson.id}`);
  };

  const handleCategoryClick = (category: LessonCategory) => {
    setSelectedModule(category);
    setIsModalOpen(true);
    setShowDropdown(false);
  };

  const highlightMatch = (text: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  const shouldShowDropdownContent = showDropdown && searchTerm.trim() && (searchResults.length > 0 || error);

  return (
    <div ref={containerRef} className="relative w-full mb-8">
      {/* Search Input - Updated Design */}
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            className="flex-1 px-6 py-4 text-gray-600 bg-gray-50 border-0 rounded-l-full focus:outline-none focus:bg-white focus:shadow-lg transition-all duration-200 placeholder-gray-400"
            placeholder="Search for lessons..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          
          <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-full transition-colors duration-200 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {shouldShowDropdownContent && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {error ? (
            <div className="p-4 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((category, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0">
                  {/* Category Header */}
                  <button 
                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {category.category.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-600">
                        {highlightMatch(category.category)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {category.lessons.length} lesson{category.lessons.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                  
                  {/* Lessons List */}
                  {category.lessons.map((lesson, lessonIndex) => (
                    <button
                      key={lessonIndex}
                      onClick={() => handleLessonClick(lesson)}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 border-t border-gray-50 flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="flex-1">{highlightMatch(lesson.title)}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No results found for "{searchTerm}"</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        imageSrc="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=128&h=128&fit=crop&crop=face"
      >
        {selectedModule && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedModule.category}</h2>
            <p className="text-gray-600 mb-6">Choose a Lesson</p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedModule.lessons.map((lesson, index) => (
                <button
                  key={index}
                  onClick={() => handleLessonClick(lesson)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {lesson.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SearchBar;