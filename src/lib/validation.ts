// lib/validation.ts - Comprehensive validation utilities
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Regex patterns - FIXED to match backend
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/,
  NAME: /^[a-zA-Z\s\-']{2,50}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,15}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/
};

// Common weak passwords to reject
export const COMMON_PASSWORDS = [
  'password', '123456789', 'qwerty123', 'abc123456', 
  'password123', '12345678', 'admin123', 'user123',
  'welcome123', 'letmein123', 'monkey123', 'dragon123',
  'master123', 'shadow123', 'jesus123', 'michael123'
];

// Password strength calculation
export interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '', color: '', suggestions: [] };

  let score = 0;
  const suggestions: string[] = [];

  // Length checks
  if (password.length >= 8) score += 1;
  else suggestions.push('At least 8 characters');

  if (password.length >= 12) score += 0.5; // Bonus for longer passwords

  // Character type checks
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('One lowercase letter');

  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('One uppercase letter');

  if (/\d/.test(password)) score += 1;
  else suggestions.push('One number');

  // FIXED: Updated special character check to match backend
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score += 1;
  else suggestions.push('One special character');

  // Bonus checks
  if (/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score += 0.5; // Extra special chars
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 0.5; // Repeated characters
  if (/123|abc|qwe|asd|zxc/i.test(password)) score -= 0.5; // Sequential patterns

  // Strength levels
  const strengthLevels = [
    { min: 0, max: 1, label: 'Very Weak', color: 'bg-red-500' },
    { min: 1.5, max: 2.5, label: 'Weak', color: 'bg-orange-500' },
    { min: 3, max: 3.5, label: 'Fair', color: 'bg-yellow-500' },
    { min: 4, max: 4.5, label: 'Good', color: 'bg-blue-500' },
    { min: 5, max: 6, label: 'Strong', color: 'bg-green-500' }
  ];

  const level = strengthLevels.find(l => score >= l.min && score <= l.max) || strengthLevels[0];

  return {
    score: Math.min(Math.max(score, 0), 5),
    label: level.label,
    color: level.color,
    suggestions: suggestions.slice(0, 3)
  };
}

// Individual field validators
export class FieldValidators {
  static email(email: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const trimmed = email?.trim() || '';

    if (!trimmed) {
      errors.push({ field: 'email', message: 'Email address is required' });
      return errors;
    }

    if (trimmed.length > 254) {
      errors.push({ field: 'email', message: 'Email address is too long (max 254 characters)' });
    }

    if (!PATTERNS.EMAIL.test(trimmed)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    // Check for suspicious patterns
    if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
      errors.push({ field: 'email', message: 'Email format is invalid' });
    }

    return errors;
  }

  static password(password: string, confirmPassword?: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
      return errors;
    }

    if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
    }

    if (password.length > 128) {
      errors.push({ field: 'password', message: 'Password is too long (max 128 characters)' });
    }

    if (!PATTERNS.PASSWORD.test(password)) {
      errors.push({ 
        field: 'password', 
        message: 'Password must contain uppercase, lowercase, number, and special character' 
      });
    }

    // Check for common passwords
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push({ field: 'password', message: 'This password is too common. Please choose a stronger one' });
    }

    // Check for patterns
    if (/(.)\1{3,}/.test(password)) {
      errors.push({ field: 'password', message: 'Password cannot contain repeated characters' });
    }

    // Confirm password validation
    if (confirmPassword !== undefined && password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    return errors;
  }

  static validateName(name: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const trimmed = name?.trim() || '';

    if (!trimmed) {
      errors.push({ field: 'name', message: 'Name is required' });
      return errors;
    }

    if (!PATTERNS.NAME.test(trimmed)) {
      errors.push({ 
        field: 'name', 
        message: 'Name must be 2-50 characters, letters only (spaces, hyphens, apostrophes allowed)' 
      });
    }

    // Additional name validations
    if (trimmed.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    if (/^\s|\s$/.test(name)) {
      errors.push({ field: 'name', message: 'Name cannot start or end with spaces' });
    }

    if (/\s{2,}/.test(trimmed)) {
      errors.push({ field: 'name', message: 'Name cannot contain multiple consecutive spaces' });
    }

    return errors;
  }

  static phone(phone: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const trimmed = phone?.trim() || '';

    if (!trimmed) {
      errors.push({ field: 'phone', message: 'Phone number is required' });
      return errors;
    }

    if (!PATTERNS.PHONE.test(trimmed)) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }

    return errors;
  }

  static username(username: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const trimmed = username?.trim() || '';

    if (!trimmed) {
      errors.push({ field: 'username', message: 'Username is required' });
      return errors;
    }

    if (!PATTERNS.USERNAME.test(trimmed)) {
      errors.push({ 
        field: 'username', 
        message: 'Username must be 3-20 characters, letters, numbers, and underscores only' 
      });
    }

    return errors;
  }
}

// Composite validators for forms
export class FormValidators {
  static registration(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): ValidationResult {
    const errors: ValidationError[] = [
      ...FieldValidators.validateName(data.name),
      ...FieldValidators.email(data.email),
      ...FieldValidators.password(data.password, data.confirmPassword)
    ];

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static signin(data: {
    email: string;
    password: string;
  }): ValidationResult {
    const errors: ValidationError[] = [];

    // Basic required field validation for sign-in
    if (!data.email?.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!PATTERNS.EMAIL.test(data.email.trim())) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    if (!data.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static forgotPassword(data: {
    email: string;
  }): ValidationResult {
    const errors = FieldValidators.email(data.email);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static resetPassword(data: {
    password: string;
    confirmPassword: string;
    token: string;
  }): ValidationResult {
    const errors: ValidationError[] = [
      ...FieldValidators.password(data.password, data.confirmPassword)
    ];

    if (!data.token?.trim()) {
      errors.push({ field: 'token', message: 'Reset token is required' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Sanitization utilities
export class Sanitizer {
  static email(email: string): string {
    return email?.trim().toLowerCase() || '';
  }

  static sanitizeName(name: string): string {
    return name?.trim().replace(/\s+/g, ' ') || '';
  }

  static phone(phone: string): string {
    return phone?.trim().replace(/[^\d+\-\(\)\s]/g, '') || '';
  }

  static general(input: string): string {
    return input?.trim() || '';
  }
}

// Rate limiting helpers
export class RateLimit {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map();

  static check(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
    }

    if (record.count >= maxAttempts) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { 
      allowed: true, 
      remaining: maxAttempts - record.count, 
      resetTime: record.resetTime 
    };
  }

  static reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Security utilities
export class SecurityUtils {
  static isSecurePassword(password: string): boolean {
    const strength = calculatePasswordStrength(password);
    return strength.score >= 4; // Good or Strong
  }

  static generateSecureToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  static hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs');
    return bcrypt.hash(password, 12);
  }

  static comparePassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(password, hash);
  }
}

export default {
  PATTERNS,
  COMMON_PASSWORDS,
  calculatePasswordStrength,
  FieldValidators,
  FormValidators,
  Sanitizer,
  RateLimit,
  SecurityUtils
};