// Centralized logging utility for the web app
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  workspaceId?: string;
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.level = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      if (this.isDevelopment) {
        console.log(this.formatMessage('DEBUG', message, context));
      }
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        error: error?.message,
        stack: error?.stack,
      };
      console.error(this.formatMessage('ERROR', message, errorContext));
    }
  }

  // Specialized logging methods
  api(route: string, method: string, status: number, duration?: number, context?: LogContext): void {
    this.info(`API ${method} ${route} - ${status}${duration ? ` (${duration}ms)` : ''}`, {
      ...context,
      component: 'api',
      route,
      method,
      status,
      duration,
    });
  }

  ai(operation: string, model?: string, duration?: number, context?: LogContext): void {
    this.info(`AI ${operation}${model ? ` (${model})` : ''}${duration ? ` (${duration}ms)` : ''}`, {
      ...context,
      component: 'ai',
      operation,
      model,
      duration,
    });
  }

  user(userId: string, action: string, details?: any, context?: LogContext): void {
    this.info(`User ${action}`, {
      ...context,
      component: 'user',
      userId,
      action,
      details,
    });
  }
}

export const logger = new Logger();

