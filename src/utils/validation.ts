import { z } from 'zod';
import { security } from '../lib/security';

// User input validation schemas
export const schemas = {
  // User registration schema
  registration: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2).max(50),
  }),

  // Login schema
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),

  // Business creation schema
  business: z.object({
    name: z.string().min(2).max(100),
    description: z.string().min(10).max(1000),
    category: z.string().min(1),
    location: z.object({
      address: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2),
      zipCode: z.string().optional(),
      country: z.string().min(2),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
    contact: z.object({
      phone: z.string().regex(/^\+?[\d\s-]+$/),
      email: z.string().email(),
      website: z.string().url().optional(),
    }),
    operatingHours: z.array(z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isClosed: z.boolean(),
    })).length(7),
  }),

  // Review schema
  review: z.object({
    content: z.string().min(10).max(1000),
    rating: z.number().min(1).max(5),
    photos: z.array(z.string().url()).max(5).optional(),
  }),

  // Message schema
  message: z.object({
    content: z.string().min(1).max(1000),
  }),

  // Search query schema
  search: z.object({
    query: z.string().min(1).max(100),
    filters: z.object({
      category: z.string().optional(),
      location: z.string().optional(),
      rating: z.number().min(0).max(5).optional(),
      price: z.string().optional(),
    }).optional(),
  }),
};

// Validation middleware creator
export const validate = (schema: z.ZodSchema) => {
  return (data: unknown) => {
    try {
      return {
        data: schema.parse(data),
        error: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          data: null,
          error: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        };
      }
      return {
        data: null,
        error: [{ path: 'unknown', message: 'Validation failed' }],
      };
    }
  };
};

// Sanitization functions
export const sanitize = {
  // Sanitize general text input
  text: (input: string): string => {
    return security.sanitizeHtml(input.trim());
  },

  // Sanitize email addresses
  email: (input: string): string => {
    return input.trim().toLowerCase();
  },

  // Sanitize phone numbers
  phone: (input: string): string => {
    return input.replace(/[^\d+\-\s]/g, '');
  },

  // Sanitize URLs
  url: (input: string): string => {
    try {
      const url = new URL(input);
      return url.toString();
    } catch {
      return '';
    }
  },
};
