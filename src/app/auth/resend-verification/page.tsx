// app/auth/resend-verification/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationErrors {
  [key: string]: string;
}

const ResendVerificationPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState(false);

  const validateEmail = (emailValue: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!emailValue.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(emailValue.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (emailValue.length > 254) {
      newErrors.email = 'Email address is too long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (errors.email) {
      setErrors({});
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validateEmail(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setErrors({ general: data.message || 'Failed to send verification email. Please try again.' });
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldStatus = () => {
    if (!touched) return null;
    if (errors.email) return 'error';
    if (email.trim() && EMAIL_REGEX.test(email.trim())) return 'success';
    return null;
  };

  const renderFieldIcon = () => {
    const status = getFieldStatus();
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
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3 text-center">Check your email</h1>
            <p className="text-gray-600 mb-4 text-center">
              If an unverified account exists with this email, we've sent a new verification link to:
            </p>
            <p className="font-semibold text-gray-800 bg-green-50 rounded-lg py-2 px-4 border border-green-200 text-center">
              {email}
            </p>
            <p className="text-sm text-gray-500 mt-4 text-center">
              The verification link will expire in 24 hours. If you don't see the email, check your spam folder.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/auth/signin"
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 inline-block text-center"
              >
                Back to Sign In
              </Link>
              
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                  setTouched(false);
                  setErrors({});
                }}
                className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors"
              >
                Try with different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Resend Verification Email</h1>
          <p className="text-gray-600">Enter your email to receive a new verification link</p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm font-medium">{errors.general}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-5 mb-6">
            {/* Email Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 ${
                    errors.email ? 'border-red-300 bg-red-50' : 
                    getFieldStatus() === 'success' ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {renderFieldIcon()}
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !email.trim() || !!errors.email}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Verification Email'}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm">Why verify your email?</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Secure your account from unauthorized access</li>
              <li>• Enable password reset functionality</li>
              <li>• Receive important account notifications</li>
              <li>• Ensure you're a real person, not a bot</li>
            </ul>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Remember your verification link?{' '}
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Try signing in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;