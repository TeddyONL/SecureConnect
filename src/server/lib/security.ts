import crypto from 'crypto';

export const security = {
  hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  },

  generateRandomBytes(length: number = 32): string {
    return crypto
      .randomBytes(length)
      .toString('hex');
  },

  encryptData(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  },

  decryptData(encryptedData: string, key: string): string {
    const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },

  compareHash(data: string, hash: string): boolean {
    const newHash = this.hashData(data);
    return crypto.timingSafeEqual(Buffer.from(newHash), Buffer.from(hash));
  }
};
