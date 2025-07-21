import CryptoJS from 'crypto-js';

// Use environment variable for encryption key, fallback to default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'kolab360-secure-messaging-key-2025';

export class MessageEncryption {
  private static readonly algorithm = CryptoJS.AES;
  
  /**
   * Encrypt sensitive message content
   */
  static encrypt(message: string): string {
    try {
      const encrypted = this.algorithm.encrypt(message, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      // Fallback: return original message in development mode
      if (process.env.NODE_ENV === 'development') {
        return message;
      }
      throw new Error('Message encryption failed');
    }
  }
  
  /**
   * Decrypt message content
   */
  static decrypt(encryptedMessage: string): string {
    try {
      const decrypted = this.algorithm.decrypt(encryptedMessage, ENCRYPTION_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      // Fallback: return encrypted message in development mode
      if (process.env.NODE_ENV === 'development') {
        return encryptedMessage;
      }
      throw new Error('Message decryption failed');
    }
  }
  
  /**
   * Check if a message appears to be encrypted
   */
  static isEncrypted(message: string): boolean {
    // Basic check for encrypted format (Base64-like string)
    const encryptedPattern = /^[A-Za-z0-9+/=]+$/;
    return encryptedPattern.test(message) && message.length > 20;
  }
  
  /**
   * Encrypt only sensitive messages (containing keywords)
   */
  static shouldEncrypt(message: string): boolean {
    const sensitiveKeywords = [
      'password', 'secret', 'confidential', 'private', 'api key', 'token',
      'sensitive', 'classified', 'restricted', 'internal', 'proprietary',
      'ssn', 'social security', 'credit card', 'banking', 'financial'
    ];
    
    const lowercaseMessage = message.toLowerCase();
    return sensitiveKeywords.some(keyword => lowercaseMessage.includes(keyword));
  }
  
  /**
   * Smart encryption: Only encrypt if message contains sensitive content
   */
  static smartEncrypt(message: string): { content: string; isEncrypted: boolean } {
    if (this.shouldEncrypt(message)) {
      return {
        content: this.encrypt(message),
        isEncrypted: true
      };
    }
    return {
      content: message,
      isEncrypted: false
    };
  }
  
  /**
   * Smart decryption: Only decrypt if message is actually encrypted
   */
  static smartDecrypt(message: string, isEncrypted?: boolean): string {
    if (isEncrypted || this.isEncrypted(message)) {
      return this.decrypt(message);
    }
    return message;
  }
}