import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Security constants
const PEPPER = import.meta.env.VITE_PEPPER || 'your-pepper-value';
const MIN_PASSWORD_LENGTH = 12;

// Input validation schemas
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

// Security utilities
export const security = {
  // Sanitize HTML content
  sanitizeHtml: (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    });
  },

  // Hash password with salt and pepper
  hashPassword: async (password: string): Promise<{ hash: string; salt: string }> => {
    const salt = crypto.randomUUID();
    const encoder = new TextEncoder();
    const data = encoder.encode(password + PEPPER + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { hash, salt };
  },

  // Verify password
  verifyPassword: async (
    password: string,
    hash: string,
    salt: string
  ): Promise<boolean> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + PEPPER + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verifyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hash === verifyHash;
  },

  // Generate secure random token
  generateToken: (length: number = 32): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Hash sensitive data (e.g., for URLs)
  hashData: async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data + PEPPER);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Validate email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  // Encode data for URLs
  encodeForUrl: (data: string): string => {
    return encodeURIComponent(data).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16);
    });
  },

  // Check for common security risks in text
  hasSecurityRisks: (text: string): boolean => {
    const riskPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /data:/gi,
      /vbscript:/gi,
      /on\w+=/gi,
    ];
    return riskPatterns.some(pattern => pattern.test(text));
  },

  // Rate limiting helper
  createRateLimit: (windowMs: number, max: number) => {
    const requests = new Map<string, number[]>();

    return (ip: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get existing requests for this IP
      const ipRequests = requests.get(ip) || [];
      
      // Filter out old requests
      const recentRequests = ipRequests.filter(time => time > windowStart);
      
      // Add current request
      recentRequests.push(now);
      requests.set(ip, recentRequests);

      return recentRequests.length <= max;
    };
  },

  // Content Security Policy builder
  buildCSP: () => {
    return {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'wasm-unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'", 'https://api.example.com'],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"],
      'object-src': ["'none'"],
    };
  },

  // Security headers
  securityHeaders: {
    'Content-Security-Policy': Object.entries({
      'default-src': ["'self'"],
      'script-src': ["'self'", "'wasm-unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'", 'https://api.example.com'],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"],
      'object-src': ["'none'"],
    })
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; '),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};
