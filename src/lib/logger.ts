/**
 * Logger utility for production-safe logging
 * In production, logs are disabled or sent to a logging service
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
    // In production, optionally send to logging service
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, but format appropriately
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, send to error tracking service
      console.error('[Error]', args);
      // TODO: Integrate with error tracking service (e.g., Sentry)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
    // In production, optionally send to logging service
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

