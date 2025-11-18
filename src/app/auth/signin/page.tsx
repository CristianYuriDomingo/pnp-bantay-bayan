//src/app/auth/signin/page.tsx
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

// Validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationErrors {
  [key: string]: string;
}

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Account lockout after too many failed attempts
  React.useEffect(() => {
    if (isLocked && lockTimer > 0) {
      const timer = setTimeout(() => {
        setLockTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTimer === 0) {
      setIsLocked(false);
      setAttemptCount(0);
    }
  }, [isLocked, lockTimer]);

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Email validation
    if (touched.email && formData.email.trim()) {
      if (!EMAIL_REGEX.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (touched.password && !formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    setTimeout(validateForm, 100);
  };

  const handleSocialSignIn = async (provider: string) => {
    if (isLocked) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await signIn(provider, {
        callbackUrl: '/users/dashboard',
        redirect: false
      });
      
      if (result?.error) {
        setErrors({ general: `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in failed. Please try again.` });
      } else if (result?.ok) {
        router.push('/users/dashboard');
      }
    } catch (err) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setErrors({ general: `Account temporarily locked. Please wait ${lockTimer} seconds before trying again.` });
      return;
    }

    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Basic required field validation
    if (!formData.email.trim() || !formData.password) {
      setErrors({ general: 'Please fill in all required fields' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setAttemptCount(prev => {
          const newCount = prev + 1;
          
          // Lock account after 5 failed attempts
          if (newCount >= 5) {
            setIsLocked(true);
            setLockTimer(300); // 5 minutes lockout
            setErrors({ 
              general: 'Too many failed attempts. Account locked for 5 minutes for security.' 
            });
          } else {
            const attemptsLeft = 5 - newCount;
            setErrors({ 
              general: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining before temporary lockout.` 
            });
          }
          
          return newCount;
        });
      } else if (result?.ok) {
        // Reset attempt count on successful login
        setAttemptCount(0);
        router.push('/users/dashboard');
      } else {
        setErrors({ general: 'Sign-in failed. Please try again.' });
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldStatus = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) return 'error';
    if (formData[fieldName as keyof typeof formData].trim()) return 'success';
    return null;
  };

  const renderFieldIcon = (fieldName: string) => {
    const status = getFieldStatus(fieldName);
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return null;
  };

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Please sign in to your account</p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className={`border rounded-lg p-4 mb-6 flex items-start gap-3 ${
            isLocked ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
          }`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              isLocked ? 'text-orange-500' : 'text-red-500'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                isLocked ? 'text-orange-700' : 'text-red-700'
              }`}>
                {errors.general}
              </p>
              {isLocked && lockTimer > 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  Time remaining: {Math.floor(lockTimer / 60)}:{(lockTimer % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Attempt Counter Warning */}
        {attemptCount > 0 && attemptCount < 5 && !isLocked && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-yellow-800 text-sm">
              Security Notice: {attemptCount} failed attempt{attemptCount !== 1 ? 's' : ''} detected
            </p>
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
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  disabled={isLocked}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.email ? 'border-red-300 bg-red-50' : 
                    getFieldStatus('email') === 'success' ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {renderFieldIcon('email')}
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('password')}
                  disabled={isLocked}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 z-10"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading || isLocked || Object.keys(errors).filter(key => key !== 'general').length > 0}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : isLocked ? `Locked (${Math.floor(lockTimer / 60)}:${(lockTimer % 60).toString().padStart(2, '0')})` : 'Sign In'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-gray-500 text-sm">Or continue with</span>
            </div>
          </div>

          {/* Social Sign In Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialSignIn('google')}
              disabled={isLoading || isLocked}
              className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700">Continue with Google</span>
            </button>

            <button
              onClick={() => handleSocialSignIn('facebook')}
              disabled={isLoading || isLocked}
              className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-gray-700">Continue with Facebook</span>
            </button>
          </div>
        </div>

        {/* Link to Sign Up */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        {attemptCount > 2 && !isLocked && (
          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs">
              Multiple failed attempts detected. Account will be temporarily locked after 5 failed attempts for security.
            </p>
          </div>
        )}

        {/* Footer - FIXED: Changed from <a> to <Link> */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs">
            By signing in to Bantay Bayan, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 transition-colors">
              Terms
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;