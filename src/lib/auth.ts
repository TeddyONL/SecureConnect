import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import CryptoJS from 'crypto-js';
import { security } from './security';

// AWS Cognito configuration
const cognitoClient = new CognitoIdentityClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export class AuthService {
  // End-to-end encryption key (in production this would be stored securely)
  private static readonly E2E_KEY = process.env.E2E_ENCRYPTION_KEY || 'your-secret-key';

  // Generate MFA secret for a user
  static async generateMFASecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `SecureConnect:${userId}`,
    });

    // Generate QR code for the secret
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl
    };
  }

  // Verify MFA token
  static verifyMFAToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 30 seconds window
    });
  }

  // Encrypt sensitive data
  static encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.E2E_KEY).toString();
  }

  // Decrypt sensitive data
  static decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.E2E_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Enhanced token generation with encryption
  static generateSecureToken(payload: any): string {
    const token = security.generateToken();
    const encryptedPayload = this.encryptData(JSON.stringify({
      ...payload,
      token,
      timestamp: Date.now()
    }));
    return encryptedPayload;
  }

  // Validate encrypted token
  static validateSecureToken(encryptedToken: string): boolean {
    try {
      const decryptedData = this.decryptData(encryptedToken);
      const payload = JSON.parse(decryptedData);
      
      // Check token expiration (24 hours)
      const isExpired = Date.now() - payload.timestamp > 24 * 60 * 60 * 1000;
      
      return !isExpired;
    } catch {
      return false;
    }
  }
}