'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  completedLessons: number;
  totalScore: number;
}

interface ApiResponse {
  success: boolean;
  data?: User[] | any;
  error?: string;
  message?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (session.user.role !== 'admin') {
      router.push('/users/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch users
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session]);

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Enhanced fetch with better debugging
  const fetchUsers = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching users...');
      
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get response text first to see what we actually received
      const responseText = await response.text();
      console.log('📄 Raw response (first 500 chars):', responseText.substring(0, 500));
      
      // Check if it's HTML (404 page)
      if (responseText.trim().startsWith('<!DOCTYPE')) {
        throw new Error('API route not found - received HTML page instead of JSON. Check that /api/admin/users/route.ts exists.');
      }
      
      // Try to parse as JSON
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed JSON:', data);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error(`Server returned invalid JSON response. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      // Handle consistent API response format
      if (data.success && data.data) {
        setUsers(data.data);
        console.log('✅ Users loaded:', data.data.length);
      } else if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch users');
      } else {
        // Fallback for direct array response
        const usersData = Array.isArray(data) ? data : [];
        setUsers(usersData);
        console.log('⚠️ Fallback: Users loaded:', usersData.length);
      }
      
    } catch (error) {
      console.error('💥 Error fetching users:', error);
      let errorMessage = 'Failed to fetch users';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
    setError(null);
    setSuccess(null);
  };

  // Enhanced update with better debugging
  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    setUpdating(true);
    setError(null);
    
    try {
      console.log('🔄 Updating user:', userId, updates);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      console.log('📡 Update response status:', response.status);
      
      // Get response text first
      const responseText = await response.text();
      console.log('📄 Update raw response (first 500 chars):', responseText.substring(0, 500));
      
      // Check if it's HTML (404 page)
      if (responseText.trim().startsWith('<!DOCTYPE')) {
        throw new Error(`API route not found - received HTML page. Check that /api/admin/users/[userId]/route.ts exists and has PATCH method.`);
      }
      
      // Try to parse as JSON
      let responseData: ApiResponse;
      try {
        responseData = JSON.parse(responseText);
        console.log('✅ Update parsed JSON:', responseData);
      } catch (parseError) {
        console.error('❌ Update JSON Parse Error:', parseError);
        throw new Error(`Server returned invalid JSON response. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`);
      }

      if (responseData.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        ));
        setShowEditModal(false);
        setEditingUser(null);
        setSuccess('User updated successfully!');
        console.log('✅ User updated successfully');
      } else {
        throw new Error(responseData.error || 'Update failed');
      }
    } catch (error) {
      console.error('💥 Error updating user:', error);
      let errorMessage = 'Failed to update user';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Enhanced delete with better debugging and error handling
  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    const confirmMessage = `Are you sure you want to delete ${userToDelete?.name || 'this user'} (${userToDelete?.email})? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;

    setDeleting(userId);
    setError(null);
    
    try {
      console.log('🔄 Deleting user:', userId);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Delete response status:', response.status);
      console.log('📡 Delete response URL:', response.url);
      
      // Get response text first
      const responseText = await response.text();
      console.log('📄 Delete raw response (first 500 chars):', responseText.substring(0, 500));
      
      // Check if it's HTML (404 page) - this was the main issue
      if (responseText.trim().startsWith('<!DOCTYPE')) {
        throw new Error(`DELETE API route not found. Please ensure:\n1. File exists at: /api/admin/users/[userId]/route.ts\n2. File exports a DELETE function\n3. File is properly saved and server is restarted\n4. Folder structure is correct: app/api/admin/users/[userId]/route.ts`);
      }
      
      // Try to parse as JSON
      let responseData: ApiResponse;
      try {
        responseData = JSON.parse(responseText);
        console.log('✅ Delete parsed JSON:', responseData);
      } catch (parseError) {
        console.error('❌ Delete JSON Parse Error:', parseError);
        console.error('❌ Response text that failed to parse:', responseText);
        throw new Error(`Server returned invalid JSON response. Status: ${response.status}. Expected JSON but got: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`);
      }

      if (responseData.success) {
        setUsers(users.filter(user => user.id !== userId));
        setSuccess('User deleted successfully!');
        console.log('✅ User deleted successfully');
      } else {
        throw new Error(responseData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('💥 Error deleting user:', error);
      let errorMessage = 'Failed to delete user';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase()) ||
                         user.id.includes(search);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Show loading while session is being checked
  if (status === 'loading' || loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchUsers}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <div className="text-sm text-gray-600">
            Total Users: {users.length}
          </div>
        </div>
      </div>
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
            <button 
              onClick={() => setSuccess(null)}
              className="text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Error Message - Enhanced with better formatting */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <div className="font-medium mb-1">Error:</div>
                <div className="whitespace-pre-line break-words">{error}</div>
              </div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 ml-4 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by email, name, or ID..."
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1 min-w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Admins</h3>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Inactive Users</h3>
          <p className="text-2xl font-bold text-red-600">
            {users.filter(u => u.status === 'inactive').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredUsers.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Profile</th>
                <th className="text-left p-4 font-medium text-gray-900">Email</th>
                <th className="text-left p-4 font-medium text-gray-900">Role</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Join Date</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-900">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={updating || deleting === user.id}
                      >
                        {updating && editingUser?.id === user.id ? 'Updating...' : 'Edit'}
                      </button>
                      {session?.user?.id !== user.id && (
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updating || deleting === user.id}
                        >
                          {deleting === user.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                      {session?.user?.id === user.id && (
                        <span className="text-gray-400 text-sm">Your Account</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding your first user.'}
            </p>
            {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-500"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={updating}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Information
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Name: {editingUser.name}</p>
                  <p className="text-sm text-gray-600">Email: {editingUser.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    role: e.target.value as 'admin' | 'user'
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={updating}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    status: e.target.value as 'active' | 'inactive'
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={updating}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setError(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateUser(editingUser.id, {
                  role: editingUser.role,
                  status: editingUser.status
                })}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updating}
              >
                {updating ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : (
                  'Update User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}