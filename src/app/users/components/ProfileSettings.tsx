import React, { useState } from 'react';
import { User, Calendar, Mail, Camera, Edit3, Check, X } from 'lucide-react';

const ProfileSettings = () => {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    joinDate: '2023-03-15',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setUser(prev => ({ ...prev, profileImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setUser(prev => ({
      ...prev,
      name: editForm.name
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email
    });
    setIsEditing(false);
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
    const emailNumbers = email.match(/\d+/g)?.join('') || Math.floor(Math.random() * 100000);
    return `${firstName}${emailNumbers}`;
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-lg">
      {/* Header section */}
      <div className="bg-gradient-to-b from-blue-400 to-white px-8 py-12 relative overflow-hidden">
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
              className="p-3 rounded-2xl bg-green-500 bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 shadow-lg"
            >
              <Check size={18} className="text-white" />
            </button>
            <button
              onClick={handleCancel}
              className="p-3 rounded-2xl bg-red-500 bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 shadow-lg"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        )}

        {/* Profile Avatar */}
        <div className="flex justify-center relative z-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-500 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                <img
                  src={user.profileImage}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full p-3 cursor-pointer shadow-xl transform transition-all duration-300 hover:scale-110 border-2 border-white">
              <Camera size={16} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-8 py-8 bg-white">
        {/* Main Name */}
        <div className="text-center mb-6">
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
            <p className="text-lg text-blue-600 font-medium">@{generateUsername(user.name, user.email)}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="flex justify-between items-start gap-8">
          {/* Email Section */}
          <div className="flex-1 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
            <p className="text-sm font-medium text-gray-800 border-b-2 border-blue-300 pb-2 inline-block">{user.email}</p>
          </div>

          {/* Join Date Section */}
          <div className="flex-1 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
            <p className="text-sm font-medium text-gray-800 border-b-2 border-blue-300 pb-2 inline-block">{formatDate(user.joinDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;