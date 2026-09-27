import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes
const IV_LENGTH = 16;

export function encrypt(text: string | null | undefined): string | null {
  if (!text) return null;
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string | null | undefined): string | null {
  if (!text) return null;
  if (!text.includes(':')) return text; // Fallback for unencrypted legacy data during transition
  try {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift() as string, 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return '***[DECRYPTION_FAILED]***';
  }
}

// Structured Logger for Observability
export const logger = {
  info: (event: string, metadata: any = {}) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'INFO', event, ...metadata }));
  },
  error: (event: string, error: any, metadata: any = {}) => {
    // Strip PII from error objects if necessary, though our standard structure avoids it
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'ERROR', event, error: error?.message || error, ...metadata }));
  },
  transition: (orderId: string, oldStatus: string, newStatus: string) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'INFO', event: 'ORDER_STATUS_TRANSITION', orderId, oldStatus, newStatus }));
  }
};
