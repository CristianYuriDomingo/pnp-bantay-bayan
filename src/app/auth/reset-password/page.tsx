// app/auth/reset-password/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';
import Image from 'next/image';
import { calculatePasswordStrength, FieldValidators } from '@/lib/validation';

interface ValidationErrors {
  [key: string]: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ 
    score: 0, label: '', color: '', suggestions: [] 
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setErrors({ general: 'Invalid reset link. Please request a new password reset.' });
    }
  }, [token]);

  // Real-time password validation
  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Password validation
    if (touched.password && formData.password) {
      const passwordErrors = FieldValidators.password(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0].message;
      }
    }

    // Confirm password validation
    if (touched.confirmPassword && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrors({ general: 'Invalid reset link. Please request a new password reset.' });
      return;
    }

    // Mark all fields as touched
    setTouched({ password: true, confirmPassword: true });
    
    // Validate form
    validateForm();
    
    if (Object.keys(errors).filter(key => key !== 'general').length > 0) {
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setErrors({ general: 'Please fill in all required fields' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors: ValidationErrors = {};
          data.errors.forEach((error: any) => {
            serverErrors[error.field] = error.message;
          });
          setErrors(serverErrors);
        } else {
          setErrors({ general: data.message || 'Password reset failed. Please try again.' });
        }
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldStatus = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) return 'error';
    if (formData[fieldName as keyof typeof formData]) return 'success';
    return null;
  };

  const renderFieldIcon = (fieldName: string) => {
    const status = getFieldStatus(fieldName);
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return null;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-40 h-20 flex items-center justify-center">
                <Image 
                  src="/DashboardImage/logo.png" 
                  alt="Bantay Bayan Logo" 
                  width={160} 
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Success Container */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3 text-center">Password Reset Complete!</h1>
            <p className="text-gray-600 mb-6 text-center">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>

            {/* Sign In Button */}
            <Link
              href="/auth/signin"
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 inline-block text-center"
            >
              Continue to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-40 h-20 flex items-center justify-center">
              <Image 
                src="/DashboardImage/logo.png" 
                alt="Bantay Bayan Logo" 
                width={160} 
                height={80}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h1>
          <p className="text-gray-600">Please create a strong password for your account</p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm font-medium">{errors.general}</p>
          </div>
        )}

        {/* Form Container */}
        {token && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="space-y-5 mb-6">
              {/* Password Field */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('password')}
                    onFocus={() => setTouched(prev => ({ ...prev, password: true }))}
                    required
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 ${
                      errors.password ? 'border-red-300 bg-red-50' : 
                      getFieldStatus('password') === 'success' ? 'border-green-300 bg-green-50' : 
                      'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <div className="mt-2 animate-fadeIn">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score <= 2 ? 'text-red-600' : 
                        passwordStrength.score <= 3 ? 'text-yellow-600' : 
                        passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    {passwordStrength.suggestions.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-600">Missing: {passwordStrength.suggestions.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    required
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 
                      getFieldStatus('confirmPassword') === 'success' ? 'border-green-300 bg-green-50' : 
                      'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || Object.keys(errors).length > 0}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 text-sm">Security Tips:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Use a unique password you haven't used elsewhere</li>
                <li>• Include uppercase, lowercase, numbers, and symbols</li>
                <li>• Make it at least 8 characters long</li>
                <li>• Consider using a password manager</li>
              </ul>
            </div>
          </div>
        )}

        {/* Back to Sign In */}
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}