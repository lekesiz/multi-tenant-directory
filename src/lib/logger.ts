/**
 * Production-Safe Logging Utility
 *
 * Usage:
 * - Development: Logs to console
 * - Production: Can be integrated with Sentry, LogRocket, etc.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Info level logging (general information)
   */
  info(message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage('info', message, context);
    
    if (this.isDevelopment) {
      logger.info(formattedMessage);
    }
    
    // In production: send to logging service (never console.log)
    if (this.isProduction) {
      if (process.env.SENTRY_DSN) {
        // Sentry.captureMessage(message, 'info');
      }
      // Store in file or external service, but never console.log in production
    }
  }

  /**
   * Warning level logging (potential issues)
   */
  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      logger.warn(this.formatMessage('warn', message, context));
    }
    if (this.isProduction && process.env.SENTRY_DSN) {
      // Sentry.captureMessage(message, 'warning');
    }
  }

  /**
   * Error level logging (errors and exceptions)
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(this.formatMessage('error', message, { ...context, error: errorMessage }));

    if (errorStack && this.isDevelopment) {
      logger.error(errorStack);
    }

    // In production: send to error tracking service
    if (this.isProduction && process.env.SENTRY_DSN) {
      // Sentry.captureException(error, { contexts: { custom: context } });
    }
  }

  /**
   * Debug level logging (detailed debugging info)
   * Only logs in development
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      logger.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log API request/response
   */
  api(method: string, path: string, status: number, duration?: number, context?: LogContext) {
    const message = `${method} ${path} - ${status}${duration ? ` (${duration}ms)` : ''}`;

    if (status >= 500) {
      this.error(message, undefined, context);
    } else if (status >= 400) {
      this.warn(message, context);
    } else if (this.isDevelopment) {
      this.info(message, context);
    }
  }

  /**
   * Log database query (useful for debugging slow queries)
   */
  db(query: string, duration: number, context?: LogContext) {
    if (this.isDevelopment) {
      const level = duration > 1000 ? 'warn' : 'debug';
      this[level](`DB Query (${duration}ms): ${query}`, context);
    }
  }

  /**
   * Log authentication events
   */
  auth(event: string, userId?: string, context?: LogContext) {
    this.info(`Auth: ${event}`, { userId, ...context });
  }

  /**
   * Log business events (important for analytics)
   */
  business(event: string, context?: LogContext) {
    this.info(`Business Event: ${event}`, context);

    // In production: send to analytics service
    if (this.isProduction) {
      // Analytics.track(event, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel, LogContext };
