// Cryptographic utilities for the school management system
// Note: Audit logging is handled server-side. Import removed to prevent client-side writes.

/**
 * Cryptographic constants and configurations
 */
const CRYPTO_CONFIG = {
  // AES-GCM encryption parameters
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
  tagLength: 16,
  
  // PBKDF2 parameters for key derivation
  iterations: 100000,
  saltLength: 32,
  
  // Session and token security
  sessionTimeout: 3600000, // 1 hour
  maxLoginAttempts: 5,
  lockoutDuration: 900000, // 15 minutes
} as const;

/**
 * Generate a secure random salt
 */
export const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.saltLength));
};

/**
 * Generate a secure random IV for encryption
 */
export const generateIV = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.ivLength));
};

/**
 * Derive a key from password using PBKDF2
 */
export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: CRYPTO_CONFIG.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: CRYPTO_CONFIG.algorithm, length: CRYPTO_CONFIG.keyLength },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt sensitive data using AES-GCM
 */
export const encryptData = async (data: string, key: CryptoKey): Promise<{
  encryptedData: Uint8Array;
  iv: Uint8Array;
}> => {
  const encoder = new TextEncoder();
  const iv = generateIV();
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: CRYPTO_CONFIG.algorithm,
      iv,
    },
    key,
    encoder.encode(data)
  );

  return {
    encryptedData: new Uint8Array(encryptedData),
    iv,
  };
};

/**
 * Decrypt sensitive data using AES-GCM
 */
export const decryptData = async (
  encryptedData: Uint8Array,
  iv: Uint8Array,
  key: CryptoKey
): Promise<string> => {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: CRYPTO_CONFIG.algorithm,
      iv,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
};

/**
 * Hash password using bcrypt-like approach with Web Crypto API
 */
export const hashPassword = async (password: string): Promise<{
  hash: string;
  salt: string;
}> => {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);
  const keyBuffer = await crypto.subtle.exportKey('raw', key);
  
  return {
    hash: Array.from(new Uint8Array(keyBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    salt: Array.from(salt)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
  };
};

/**
 * Verify password against stored hash
 */
export const verifyPassword = async (
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> => {
  try {
    const salt = new Uint8Array(
      storedSalt.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    
    const key = await deriveKey(password, salt);
    const keyBuffer = await crypto.subtle.exportKey('raw', key);
    const hash = Array.from(new Uint8Array(keyBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return hash === storedHash;
  } catch {
    return false;
  }
};

/**
 * Generate secure session token
 */
export const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize email input (less aggressive than general input)
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim().slice(0, 254); // Max email length is 254 chars
};

/**
 * Validate and sanitize input to prevent injection attacks
 * Note: For emails, use sanitizeEmail() instead
 */
export const sanitizeInput = (input: string, allowQuotes: boolean = false): string => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[;&|`$]/g, '') // Remove command injection characters
    .trim();
  
  // Only remove quotes if not allowed (for emails, quotes might be valid)
  if (!allowQuotes) {
    sanitized = sanitized.replace(/['"]/g, '');
  }
  
  // Limit length to prevent DoS
  return sanitized.slice(0, 10000);
};

/**
 * Validate payment amount
 */
export const isValidPaymentAmount = (amount: number): { valid: boolean; error?: string } => {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }
  
  if (amount > 10000000) { // 10 million max (adjust as needed)
    return { valid: false, error: 'Amount exceeds maximum limit' };
  }
  
  // Check for too many decimal places (max 2 for currency)
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { valid: false, error: 'Amount can have at most 2 decimal places' };
  }
  
  return { valid: true };
};

/**
 * Check if a session is valid and not expired
 */
export const isSessionValid = (sessionTimestamp: number): boolean => {
  const now = Date.now();
  return (now - sessionTimestamp) < CRYPTO_CONFIG.sessionTimeout;
};

/**
 * Rate limiting for login attempts
 */
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number; lockedUntil?: number }> = new Map();

  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;

    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      return true;
    }

    if (record.lockedUntil && Date.now() >= record.lockedUntil) {
      this.attempts.delete(identifier);
      return false;
    }

    return false;
  }

  recordAttempt(identifier: string, success: boolean): void {
    if (success) {
      this.attempts.delete(identifier);
      return;
    }

    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: now };
    
    record.count++;
    record.lastAttempt = now;

    if (record.count >= CRYPTO_CONFIG.maxLoginAttempts) {
      record.lockedUntil = now + CRYPTO_CONFIG.lockoutDuration;
    }

    this.attempts.set(identifier, record);
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    return record ? Math.max(0, CRYPTO_CONFIG.maxLoginAttempts - record.count) : CRYPTO_CONFIG.maxLoginAttempts;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Audit logging for security events
 * Note: Firestore rules prevent client-side writes to audit logs.
 * In production, this should be done via Cloud Functions or a server-side API.
 * For now, we log to console in development and fail silently in production.
 */
export const auditLog = async (event: {
  action: string;
  userId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: event.action,
      user_id: event.userId,
      details: event.details,
      ip_address: event.ipAddress,
      user_agent: event.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      severity: getSeverityLevel(event.action),
    };

    // In development, log to console
    if (import.meta.env.DEV) {
      console.log('[Audit Log]', logEntry);
    }

    // In production, audit logs should be written server-side via Cloud Functions
    // Client-side writes are blocked by Firestore security rules for security
    // TODO: Implement server-side audit logging via Cloud Functions or API endpoint
    // await addDoc(collection(db, 'security_audit_logs'), logEntry);
  } catch (error) {
    // Fail silently - audit logging should never break the application
    if (import.meta.env.DEV) {
      console.error('Failed to log security event:', error);
    }
  }
};

/**
 * Determine severity level for audit events
 */
const getSeverityLevel = (action: string): 'low' | 'medium' | 'high' | 'critical' => {
  const highSeverityActions = ['password_change_failed', 'multiple_failed_logins', 'unauthorized_access'];
  const criticalActions = ['data_breach_attempt', 'privilege_escalation', 'system_compromise'];
  
  if (criticalActions.includes(action)) return 'critical';
  if (highSeverityActions.includes(action)) return 'high';
  if (action.includes('failed') || action.includes('error')) return 'medium';
  return 'low';
};

/**
 * Secure data transmission utilities
 */
export const secureTransmission = {
  /**
   * Prepare sensitive data for transmission
   */
  prepareSensitiveData: async (data: any, userKey?: CryptoKey): Promise<string> => {
    const jsonData = JSON.stringify(data);
    
    if (!userKey) {
      // If no user key, use basic encoding (not recommended for sensitive data)
      return btoa(jsonData);
    }
    
    const encrypted = await encryptData(jsonData, userKey);
    return btoa(JSON.stringify({
      data: Array.from(encrypted.encryptedData),
      iv: Array.from(encrypted.iv),
    }));
  },

  /**
   * Process received sensitive data
   */
  processSensitiveData: async (encodedData: string, userKey?: CryptoKey): Promise<any> => {
    if (!userKey) {
      // Basic decoding
      return JSON.parse(atob(encodedData));
    }
    
    const { data, iv } = JSON.parse(atob(encodedData));
    const encryptedData = new Uint8Array(data);
    const ivArray = new Uint8Array(iv);
    
    const decrypted = await decryptData(encryptedData, ivArray, userKey);
    return JSON.parse(decrypted);
  },
};