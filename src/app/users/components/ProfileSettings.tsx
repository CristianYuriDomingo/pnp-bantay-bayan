'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Calendar, Mail, Camera, Edit3, Check, X, Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  role: string;
  status: string;
}

const ProfileSettings = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    image: ''
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        // ✅ FIXED: Changed from '/api/profile' to '/api/users/profile'
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setEditForm({
            name: data.user.name,
            image: data.user.image || ''
          });
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, status]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setEditForm(prev => ({ ...prev, image: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // ✅ FIXED: Changed from '/api/profile' to '/api/users/profile'
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          image: editForm.image
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name,
        image: user.image || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateUsername = (name: string, email: string) => {
    const firstName = name.split(' ')[0].toLowerCase();
    const emailNumbers = email.match(/\d+/g)?.join('') || '123';
    return `${firstName}${emailNumbers}`;
  };

  const getProfileImage = () => {
    if (isEditing && editForm.image) {
      return editForm.image;
    }
    if (user?.image) {
      return user.image;
    }
    // Default avatar
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session || !user) {
    return (
      <div className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header section */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 px-8 py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-8 right-16 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute bottom-12 left-12 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute top-20 left-1/4 w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
        </div>

        {/* Edit Controls */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 p-3 rounded-2xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
          >
            <Edit3 size={18} className="text-white" />
          </button>
        ) : (
          <div className="absolute top-6 right-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-3 rounded-2xl bg-green-500 bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <Check size={18} className="text-white" />
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="p-3 rounded-2xl bg-red-500 bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        )}

        {/* Profile Avatar */}
        <div className="flex justify-center relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                <img
                  src={getProfileImage()}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full p-3 cursor-pointer shadow-xl transform transition-all duration-300 hover:scale-110 border-3 border-white">
                <Camera size={16} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-8 py-8 bg-white">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Main Name */}
        <div className="text-center mb-8">
          {isEditing ? (
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="text-3xl font-bold text-gray-800 bg-white border-2 border-blue-300 rounded-2xl px-4 py-3 w-full text-center focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-sm"
              placeholder="Enter your name"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h1>
          )}
          
          {!isEditing && (
            <p className="text-lg text-blue-500 font-medium">@{generateUsername(user.name, user.email)}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Section */}
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email Address</p>
            <p className="text-sm font-medium text-gray-800">{user.email}</p>
          </div>

          {/* Join Date Section */}
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Member Since</p>
            <p className="text-sm font-medium text-gray-800">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;