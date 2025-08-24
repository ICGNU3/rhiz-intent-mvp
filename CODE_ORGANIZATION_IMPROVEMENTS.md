# Code Organization Improvements

This document outlines the comprehensive code organization improvements made to the Rhiz project to ensure best practices, maintainability, and scalability.

## 🎯 **Overview**

The project has been restructured to follow modern TypeScript/React best practices with centralized utilities, proper error handling, structured logging, and consistent code organization.

## 📁 **New File Structure**

### **Core Utilities (`apps/web/lib/`)**

#### **`logger.ts`** - Centralized Logging
- **Purpose**: Replace scattered `console.log` statements with structured logging
- **Features**:
  - Log levels (DEBUG, INFO, WARN, ERROR)
  - Context-aware logging with metadata
  - Development vs production logging
  - Specialized logging methods (API, AI, User actions)
- **Usage**:
  ```typescript
  import { logger } from '@/lib/logger';
  
  logger.info('User action completed', { userId, action: 'goal_created' });
  logger.error('API call failed', error, { component: 'api', endpoint: '/chat' });
  ```

#### **`errors.ts`** - Error Handling
- **Purpose**: Centralized error management with custom error classes
- **Features**:
  - Custom error classes (AppError, ValidationError, AIError, etc.)
  - Error context and metadata
  - Error response formatting
  - Async error wrapper utilities
- **Usage**:
  ```typescript
  import { AppError, handleError, withErrorHandling } from '@/lib/errors';
  
  throw new AppError('User not found', 'NOT_FOUND_ERROR', 404);
  const safeFunction = withErrorHandling(riskyFunction, 'context');
  ```

#### **`constants.ts`** - Application Constants
- **Purpose**: Centralize all application constants and configuration
- **Features**:
  - API configuration
  - AI model settings
  - UI constants
  - Feature flags
  - Type-safe enums for goals, actions, sentiments
- **Usage**:
  ```typescript
  import { GOAL_TYPES, ACTION_TYPES, API_CONFIG } from '@/lib/constants';
  
  const goalType = GOAL_TYPES.RAISE_SEED;
  const timeout = API_CONFIG.TIMEOUT;
  ```

### **Utility Modules (`apps/web/lib/utils/`)**

#### **`api.ts`** - API Client Utilities
- **Purpose**: Centralized API request handling with retry logic and error handling
- **Features**:
  - Configurable timeout and retry logic
  - Automatic error handling and logging
  - Type-safe request/response handling
  - Request validation utilities
- **Usage**:
  ```typescript
  import { apiClient, fetchWithRetry } from '@/lib/utils/api';
  
  const response = await apiClient.get('/api/people');
  const data = await fetchWithRetry('/api/chat', { retries: 3 });
  ```

#### **`validation.ts`** - Data Validation
- **Purpose**: Centralized validation schemas and utilities
- **Features**:
  - Zod-based validation schemas
  - Form validation helpers
  - Data sanitization utilities
  - Type guards for common validations
- **Usage**:
  ```typescript
  import { validateData, personSchema, sanitizeEmail } from '@/lib/utils/validation';
  
  const person = validateData(input, personSchema);
  const cleanEmail = sanitizeEmail(rawEmail);
  ```

### **React Components (`apps/web/components/`)**

#### **`ErrorBoundary.tsx`** - React Error Boundary
- **Purpose**: Catch and handle React component errors gracefully
- **Features**:
  - Custom error UI with retry functionality
  - Development error details
  - Error logging integration
  - Higher-order component wrapper
  - Hook for functional components
- **Usage**:
  ```typescript
  import { ErrorBoundary, useErrorHandler } from '@/components/ErrorBoundary';
  
  <ErrorBoundary fallback={CustomErrorComponent}>
    <RiskyComponent />
  </ErrorBoundary>
  
  const { error, handleError, clearError } = useErrorHandler();
  ```

## 🔧 **Improvements Made**

### **1. Logging Standardization**
- **Before**: Scattered `console.log` statements throughout the codebase
- **After**: Centralized logging with structured metadata and proper levels
- **Files Updated**:
  - `apps/web/lib/agent.ts`
  - `apps/web/lib/ai.ts`
  - All API routes and components

### **2. Error Handling**
- **Before**: Basic try-catch blocks with generic error messages
- **After**: Custom error classes with proper context and handling
- **Benefits**:
  - Better error tracking and debugging
  - Consistent error responses
  - Proper error boundaries in React

### **3. Type Safety**
- **Before**: String literals scattered throughout code
- **After**: Type-safe constants and enums
- **Benefits**:
  - Compile-time error checking
  - Better IDE support
  - Reduced runtime errors

### **4. Code Organization**
- **Before**: Mixed import patterns and scattered utilities
- **After**: Consistent import structure and centralized utilities
- **Benefits**:
  - Easier to find and maintain code
  - Reduced duplication
  - Better separation of concerns

### **5. API Consistency**
- **Before**: Inconsistent API error handling and response formats
- **After**: Standardized API client with retry logic and error handling
- **Benefits**:
  - Consistent API behavior
  - Better user experience
  - Easier debugging

## 📋 **Migration Guide**

### **For Existing Code**

1. **Replace Console Logs**:
   ```typescript
   // Before
   console.log('User action:', action);
   console.error('API error:', error);
   
   // After
   import { logger } from '@/lib/logger';
   logger.info('User action', { action });
   logger.error('API error', error, { component: 'api' });
   ```

2. **Use Error Classes**:
   ```typescript
   // Before
   throw new Error('User not found');
   
   // After
   import { NotFoundError } from '@/lib/errors';
   throw new NotFoundError('User');
   ```

3. **Use Constants**:
   ```typescript
   // Before
   const goalType = 'raise_seed';
   
   // After
   import { GOAL_TYPES } from '@/lib/constants';
   const goalType = GOAL_TYPES.RAISE_SEED;
   ```

4. **Add Error Boundaries**:
   ```typescript
   // Before
   <Component />
   
   // After
   import { ErrorBoundary } from '@/components/ErrorBoundary';
   <ErrorBoundary>
     <Component />
   </ErrorBoundary>
   ```

### **For New Code**

1. **Always use the logger** instead of console statements
2. **Use custom error classes** for domain-specific errors
3. **Validate inputs** using the validation utilities
4. **Use the API client** for all HTTP requests
5. **Wrap components** in error boundaries where appropriate

## 🚀 **Benefits Achieved**

### **Developer Experience**
- **Better IDE Support**: Type-safe constants and proper TypeScript usage
- **Easier Debugging**: Structured logging with context
- **Consistent Patterns**: Standardized error handling and API calls
- **Reduced Boilerplate**: Reusable utilities and components

### **Code Quality**
- **Type Safety**: Compile-time error checking
- **Error Handling**: Graceful error recovery and user feedback
- **Maintainability**: Centralized utilities and consistent patterns
- **Testability**: Better separation of concerns and mocking

### **User Experience**
- **Error Recovery**: Proper error boundaries and retry mechanisms
- **Consistent Behavior**: Standardized API responses and error messages
- **Performance**: Optimized logging and error handling
- **Reliability**: Better error tracking and debugging capabilities

## 🔮 **Future Improvements**

### **Planned Enhancements**
1. **Performance Monitoring**: Add performance tracking to the logger
2. **Analytics Integration**: Structured logging for analytics
3. **Internationalization**: Error message localization
4. **Advanced Validation**: More sophisticated validation rules
5. **Caching Layer**: API response caching utilities

### **Monitoring and Observability**
- **Error Tracking**: Integration with error tracking services
- **Performance Metrics**: Request timing and performance monitoring
- **User Analytics**: Structured logging for user behavior analysis
- **Health Checks**: Application health monitoring utilities

## 📚 **Best Practices**

### **Logging**
- Use appropriate log levels (DEBUG, INFO, WARN, ERROR)
- Include relevant context in log messages
- Avoid logging sensitive information
- Use structured logging for machine-readable logs

### **Error Handling**
- Use specific error classes for different error types
- Provide meaningful error messages to users
- Log errors with sufficient context for debugging
- Implement proper error recovery mechanisms

### **Type Safety**
- Use TypeScript strict mode
- Define proper interfaces and types
- Use const assertions for immutable data
- Avoid type assertions when possible

### **Code Organization**
- Keep related functionality together
- Use consistent naming conventions
- Separate concerns appropriately
- Document complex logic and APIs

## 🎉 **Conclusion**

These improvements establish a solid foundation for scalable, maintainable code that follows modern best practices. The centralized utilities, proper error handling, and structured logging will make the codebase easier to work with and more reliable for users.

The project now follows industry standards for TypeScript/React applications and is well-positioned for future growth and feature development.
