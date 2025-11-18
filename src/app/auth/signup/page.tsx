// app/auth/signup/page.tsx - Updated to handle email verification flow
'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, CheckCircle, XCircle, AlertCircle, Mail as MailIcon } from 'lucide-react';
import Image from 'next/image';

// Validation patterns
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s\-']{2,50}$/;

interface ValidationErrors {
  [key: string]: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ 
    score: 0, label: '', color: '', suggestions: [] 
  });
  
  // Track verification requirement
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [formData, touched]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: '', color: '', suggestions: [] };

    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) score += 1;
    else suggestions.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('One lowercase letter');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('One uppercase letter');

    if (/\d/.test(password)) score += 1;
    else suggestions.push('One number');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score += 1;
    else suggestions.push('One special character');

    if (password.length >= 12) score += 1;

    const strengthLevels = [
      { min: 0, max: 1, label: 'Very Weak', color: 'bg-red-500' },
      { min: 2, max: 2, label: 'Weak', color: 'bg-orange-500' },
      { min: 3, max: 3, label: 'Fair', color: 'bg-yellow-500' },
      { min: 4, max: 4, label: 'Good', color: 'bg-blue-500' },
      { min: 5, max: 6, label: 'Strong', color: 'bg-green-500' }
    ];

    const level = strengthLevels.find(l => score >= l.min && score <= l.max) || strengthLevels[0];

    return {
      score: Math.min(score, 5),
      label: level.label,
      color: level.color,
      suggestions: suggestions.slice(0, 3)
    };
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (touched.name && formData.name) {
      if (!NAME_REGEX.test(formData.name.trim())) {
        newErrors.name = 'Name must be 2-50 characters (letters, spaces, hyphens, apostrophes only)';
      }
    }

    // Email validation
    if (touched.email && formData.email) {
      if (!EMAIL_REGEX.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
      
      if (touched.password) {
        if (!PASSWORD_REGEX.test(formData.password)) {
          newErrors.password = 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character';
        }

        const commonPasswords = ['password', '123456789', 'qwerty123', 'abc123456', 'password123'];
        if (commonPasswords.includes(formData.password.toLowerCase())) {
          newErrors.password = 'This password is too common. Please choose a stronger one';
        }
      }
    } else {
      setPasswordStrength({ score: 0, label: '', color: '', suggestions: [] });
    }

    // Confirm password validation
    if (touched.confirmPassword && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await signIn(provider, {
        callbackUrl: '/users/dashboard',
        redirect: false
      });
      
      if (result?.error) {
        setErrors({ general: `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-up failed. Please try again.` });
      } else if (result?.ok) {
        router.push('/users/dashboard');
      }
    } catch (err) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    
    validateForm();
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Check if verification is required
        if (data.requiresVerification) {
          setRequiresVerification(true);
          setUserEmail(data.email);
        } else {
          // Old flow - auto sign in (for OAuth users)
          const signInResult = await signIn('credentials', {
            email: formData.email.trim(),
            password: formData.password,
            redirect: false
          });

          if (signInResult?.ok) {
            router.push('/users/dashboard');
          } else {
            setErrors({ general: 'Account created but sign-in failed. Please try signing in manually.' });
          }
        }
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors: ValidationErrors = {};
          data.errors.forEach((error: any) => {
            serverErrors[error.field] = error.message;
          });
          setErrors(serverErrors);
        } else {
          setErrors({ general: data.message || 'Registration failed. Please try again.' });
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
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

  // Verification required screen
  if (requiresVerification) {
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

          {/* Verification Notice */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <MailIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3 text-center">Verify Your Email</h1>
            <p className="text-gray-600 mb-4 text-center">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-gray-800 bg-blue-50 rounded-lg py-2 px-4 border border-blue-200 text-center mb-4">
              {userEmail}
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              Please check your email and click the verification link to activate your account. 
              The link will expire in 24 hours.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/resend-verification"
                className="block w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-center"
              >
                Resend Verification Email
              </Link>
              
              <Link
                href="/auth/signin"
                className="block w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors text-center"
              >
                Back to Sign In
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm">What's next?</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Check your inbox for the verification email</li>
              <li>• Click the verification link in the email</li>
              <li>• Your account will be activated automatically</li>
              <li>• Check spam folder if you don't see it</li>
            </ul>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Bantay Bayan!</h1>
          <p className="text-gray-600">Create your secure account to get started</p>
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
            {/* Name Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 ${
                    errors.name ? 'border-red-300 bg-red-50' : 
                    getFieldStatus('name') === 'success' ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {renderFieldIcon('name')}
                </div>
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 ${
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
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
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
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
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
              onClick={handleSignUp}
              disabled={isLoading || Object.keys(errors).length > 0}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
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

          {/* Social Sign Up Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialSignIn('google')}
              disabled={isLoading}
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
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-gray-700">Continue with Facebook</span>
            </button>
          </div>
        </div>

        {/* Link to Sign In */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer - FIXED: Changed from <a> to <Link> */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs">
            By signing up to Bantay Bayan, you agree to our{' '}
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

export default SignUpPage;