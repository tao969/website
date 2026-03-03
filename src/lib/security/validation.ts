/**
 * Input validation and sanitization utilities
 * Provides common validation functions for API endpoints
 */

import { NextRequest } from 'next/server';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface SanitizedContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

export class InputValidator {
  /**
   * Validate email format (ReDoS-safe and RFC compliant)
   */
  static validateEmail(email: string): boolean {
    if (!email || email.length > 254 || email.length < 3) return false;

    // Safe email validation with basic RFC compliance
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) return false;

    // Additional checks for common issues
    const [localPart, domainPart] = email.split('@');

    // Local part should not be empty and not start/end with dots
    if (!localPart || localPart.startsWith('.') || localPart.endsWith('.')) return false;

    // Domain part should not be empty and not start/end with dots or hyphens
    if (!domainPart || domainPart.startsWith('.') || domainPart.endsWith('.') ||
        domainPart.startsWith('-') || domainPart.endsWith('-')) return false;

    // Check for consecutive dots
    if (localPart.includes('..') || domainPart.includes('..')) return false;

    return true;
  }

  /**
   * Validate phone number format (E.164 international standard)
   */
  static validatePhone(phone: string): boolean {
    if (!phone || phone.length < 7 || phone.length > 16) return false;

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Must start with + for international numbers or digit for local
    if (!cleaned.startsWith('+') && !/^\d/.test(cleaned)) return false;

    // If starts with +, must be followed by country code and number
    if (cleaned.startsWith('+')) {
      const withoutPlus = cleaned.substring(1);
      // Country code (1-4 digits) + subscriber number (6-12 digits)
      return /^\d{1,4}\d{6,12}$/.test(withoutPlus) && withoutPlus.length >= 7 && withoutPlus.length <= 15;
    }

    // For local numbers (no +), validate as North American or general format
    return /^\d{7,15}$/.test(cleaned);
  }

  /**
   * Sanitize string input with comprehensive XSS protection
   */
  static sanitizeString(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      .slice(0, maxLength)
      // Remove null bytes and other control characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // HTML encode dangerous characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Remove javascript: protocol and other dangerous protocols
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/file:/gi, '')
      // Remove event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove script tags and other dangerous elements (safer approach)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, '');
  }

  /**
   * Sanitize HTML content (more permissive for rich text)
   */
  static sanitizeHtml(input: string, maxLength: number = 5000): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      .slice(0, maxLength)
      // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Remove script tags completely (safer regex)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      // Remove javascript: and other dangerous protocols
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Validate and sanitize contact form data
   */
  static validateContactForm(data: unknown): ValidationResult<SanitizedContactFormData> {
    const errors: string[] = [];
    const sanitized: Partial<SanitizedContactFormData> = {};

    // Type guard to ensure data is an object
    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Invalid data format'],
      };
    }

    const formData = data as Record<string, unknown>;

    // Name validation
    if (!formData.name || typeof formData.name !== 'string') {
      errors.push('Name is required');
    } else {
      const name = this.sanitizeString(formData.name, 100);
      if (name.length < 2) {
        errors.push('Name must be at least 2 characters long');
      } else {
        sanitized.name = name;
      }
    }

    // Email validation
    if (!formData.email || typeof formData.email !== 'string') {
      errors.push('Email is required');
    } else {
      const email = this.sanitizeString(formData.email, 254);
      if (!this.validateEmail(email)) {
        errors.push('Invalid email format');
      } else {
        sanitized.email = email.toLowerCase();
      }
    }

    // Subject validation
    if (!formData.subject || typeof formData.subject !== 'string') {
      errors.push('Subject is required');
    } else {
      const subject = this.sanitizeString(formData.subject, 200);
      if (subject.length < 3) {
        errors.push('Subject must be at least 3 characters long');
      } else {
        sanitized.subject = subject;
      }
    }

    // Message validation
    if (!formData.message || typeof formData.message !== 'string') {
      errors.push('Message is required');
    } else {
      const message = this.sanitizeString(formData.message, 5000);
      if (message.length < 10) {
        errors.push('Message must be at least 10 characters long');
      } else {
        sanitized.message = message;
      }
    }

    // Phone validation (optional)
    if (formData.phone && typeof formData.phone === 'string') {
      const phone = this.sanitizeString(formData.phone, 20);
      if (phone && !this.validatePhone(phone)) {
        errors.push('Invalid phone number format');
      } else if (phone) {
        sanitized.phone = phone;
      }
    }

    // Check if all required fields are present
    const hasAllRequired = Boolean(sanitized.name && sanitized.email && sanitized.subject && sanitized.message);

    return {
      isValid: errors.length === 0 && hasAllRequired,
      errors,
      data: (errors.length === 0 && hasAllRequired) ? sanitized as SanitizedContactFormData : undefined,
    };
  }

  /**
   * Validate request origin
   */
  static validateOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return false;

    return allowedOrigins.includes(origin);
  }

  /**
   * Validate Content-Type header
   */
  static validateContentType(request: NextRequest, expectedType: string = 'application/json'): boolean {
    const contentType = request.headers.get('content-type');
    return contentType?.includes(expectedType) || false;
  }

  /**
   * Check for suspicious patterns in input
   */
  static detectSuspiciousInput(input: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Comprehensive input validation for API endpoints
   */
  static validateApiInput(request: NextRequest, allowedOrigins: string[]): ValidationResult {
    const errors: string[] = [];

    // Check Content-Type
    if (!this.validateContentType(request)) {
      errors.push('Invalid Content-Type. Expected application/json');
    }

    // Check Origin
    if (!this.validateOrigin(request, allowedOrigins)) {
      errors.push('Invalid origin');
    }

    // Check for suspicious User-Agent
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      errors.push('Invalid User-Agent');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default InputValidator;
