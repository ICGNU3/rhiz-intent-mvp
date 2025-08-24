// Validation utilities and schemas
import { z } from 'zod';
import { ValidationError } from '../errors';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const urlSchema = z.string().url('Invalid URL');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');

// User input validation schemas
export const personSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.string().optional(),
  company: z.string().optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  linkedin: urlSchema.optional(),
});

export const goalSchema = z.object({
  kind: z.enum([
    'raise_seed',
    'hire_engineer',
    'hire_designer',
    'hire_sales',
    'find_investor',
    'find_customer',
    'learn_skill',
    'connect'
  ]),
  title: z.string().min(1, 'Goal title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  timeframe: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

export const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(1000, 'Note too long'),
  tags: z.array(z.string()).optional(),
  relatedPeople: z.array(z.string()).optional(),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required').max(500, 'Query too long'),
  filters: z.record(z.any()).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// API request validation schemas
export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  context: z.record(z.any()).optional(),
  stream: z.boolean().optional(),
});

export const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

// Validation utility functions
export function validateData<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(messages.join(', '));
    }
    throw error;
  }
}

export function validatePartialData<T>(data: unknown, schema: z.ZodSchema<T>): Partial<T> {
  try {
    return schema.parse(data) as Partial<T>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(messages.join(', '));
    }
    throw error;
  }
}

export function safeValidate<T>(data: unknown, schema: z.ZodSchema<T>): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors: messages };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Form validation helpers
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { isValid: boolean; errors: Record<string, string> } => {
    try {
      schema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { _form: 'Unknown validation error' } };
    }
  };
}

// Sanitization utilities
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d\s\-\(\)\+]/g, '');
}

// Type guards
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function isValidUrl(url: string): boolean {
  return urlSchema.safeParse(url).success;
}

export function isValidPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}
