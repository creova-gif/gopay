/**
 * Server-Side Encryption Utilities for goPay Tanzania
 * 
 * Features:
 * - AES-256-GCM encryption for sensitive data at rest
 * - HMAC-SHA256 for data integrity
 * - Secure key management from environment variables
 * - PII encryption (NIDA, phone numbers, addresses)
 * - Transaction data encryption
 * - BOT compliance for data protection
 */

// Server-side encryption using Web Crypto API (Deno)
const crypto = globalThis.crypto;

interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
  timestamp: number;
}

/**
 * Get encryption key from environment (256-bit)
 * In production, this should be rotated regularly
 */
function getEncryptionKey(): string {
  const key = Deno.env.get('ENCRYPTION_KEY');
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required. Set it in Supabase Edge Function secrets.');
  }
  return key;
}

/**
 * Convert string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Convert Uint8Array to string
 */
function uint8ArrayToString(arr: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(arr);
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive encryption key from master key
 */
async function deriveKey(masterKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToUint8Array(masterKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive data (server-side)
 */
export async function encryptServerData(plaintext: string): Promise<EncryptedData> {
  try {
    const masterKey = getEncryptionKey();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(masterKey, salt);
    const plaintextBuffer = stringToUint8Array(plaintext);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      plaintextBuffer
    );

    // Split ciphertext and tag
    const ciphertext = encryptedBuffer.slice(0, -16);
    const tag = encryptedBuffer.slice(-16);

    // Combine salt + iv + ciphertext for storage
    const combined = new Uint8Array([
      ...salt,
      ...iv,
      ...new Uint8Array(ciphertext)
    ]);

    return {
      ciphertext: arrayBufferToBase64(combined),
      iv: arrayBufferToBase64(iv),
      tag: arrayBufferToBase64(tag),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Server encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data (server-side)
 */
export async function decryptServerData(encrypted: EncryptedData): Promise<string> {
  try {
    const masterKey = getEncryptionKey();
    const combined = base64ToArrayBuffer(encrypted.ciphertext);
    const combinedArray = new Uint8Array(combined);

    // Extract salt, iv, and ciphertext
    const salt = combinedArray.slice(0, 16);
    const iv = combinedArray.slice(16, 28);
    const ciphertext = combinedArray.slice(28);
    const tag = base64ToArrayBuffer(encrypted.tag);

    // Recombine ciphertext and tag
    const encryptedBuffer = new Uint8Array([
      ...ciphertext,
      ...new Uint8Array(tag)
    ]);

    const key = await deriveKey(masterKey, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      encryptedBuffer
    );

    return uint8ArrayToString(new Uint8Array(decryptedBuffer));
  } catch (error) {
    console.error('Server decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way) for database storage
 */
export async function hashData(data: string): Promise<string> {
  const buffer = stringToUint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Encrypt PII (Personal Identifiable Information)
 * - NIDA numbers
 * - Phone numbers
 * - Email addresses
 * - Physical addresses
 * - Bank account numbers
 */
export async function encryptPII(piiData: {
  nida?: string;
  phone?: string;
  email?: string;
  address?: string;
  accountNumber?: string;
  [key: string]: any;
}): Promise<any> {
  const encrypted: any = { ...piiData };

  // Encrypt sensitive fields
  const sensitiveFields = ['nida', 'phone', 'address', 'accountNumber'];

  for (const field of sensitiveFields) {
    if (piiData[field]) {
      const encryptedValue = await encryptServerData(piiData[field]);
      encrypted[field] = encryptedValue.ciphertext;
      encrypted[`${field}_iv`] = encryptedValue.iv;
      encrypted[`${field}_tag`] = encryptedValue.tag;
    }
  }

  // Hash email (for lookup purposes, but not reversible)
  if (piiData.email) {
    encrypted.email_hash = await hashData(piiData.email);
    encrypted.email = await encryptServerData(piiData.email);
  }

  return encrypted;
}

/**
 * Decrypt PII for authorized access only
 */
export async function decryptPII(encryptedPII: any): Promise<any> {
  const decrypted: any = { ...encryptedPII };

  const sensitiveFields = ['nida', 'phone', 'email', 'address', 'accountNumber'];

  for (const field of sensitiveFields) {
    if (encryptedPII[field] && typeof encryptedPII[field] === 'object') {
      const encrypted: EncryptedData = {
        ciphertext: encryptedPII[field],
        iv: encryptedPII[`${field}_iv`],
        tag: encryptedPII[`${field}_tag`],
        timestamp: Date.now()
      };
      decrypted[field] = await decryptServerData(encrypted);
      
      // Remove encryption metadata
      delete decrypted[`${field}_iv`];
      delete decrypted[`${field}_tag`];
    }
  }

  return decrypted;
}

/**
 * Generate HMAC for API request validation
 */
export async function generateHMAC(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    stringToUint8Array(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToUint8Array(data)
  );

  return arrayBufferToBase64(signature);
}

/**
 * Verify HMAC signature
 */
export async function verifyHMAC(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      stringToUint8Array(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBuffer = base64ToArrayBuffer(signature);

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      stringToUint8Array(data)
    );
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Encrypt transaction for audit log
 * - Protects transaction details in database
 * - Allows for secure auditing
 */
export async function encryptTransactionLog(transaction: any): Promise<string> {
  const jsonData = JSON.stringify(transaction);
  const encrypted = await encryptServerData(jsonData);
  return JSON.stringify(encrypted);
}

/**
 * Decrypt transaction from audit log
 */
export async function decryptTransactionLog(encryptedLog: string): Promise<any> {
  const encrypted = JSON.parse(encryptedLog);
  const decrypted = await decryptServerData(encrypted);
  return JSON.parse(decrypted);
}

/**
 * Mask sensitive data for logging (prevent exposure in logs)
 */
export function maskSensitiveData(data: any): any {
  const masked = { ...data };
  
  const sensitiveFields = [
    'password', 'pin', 'nida', 'cardNumber', 'cvv',
    'accountNumber', 'privateKey', 'secret', 'token'
  ];

  for (const field of sensitiveFields) {
    if (masked[field]) {
      const value = masked[field].toString();
      if (value.length > 4) {
        // Show first 2 and last 2 characters
        masked[field] = `${value.slice(0, 2)}***${value.slice(-2)}`;
      } else {
        masked[field] = '****';
      }
    }
  }

  // Mask phone numbers (show first 3 and last 2 digits)
  if (masked.phone) {
    const phone = masked.phone.toString();
    if (phone.length >= 9) {
      masked.phone = `${phone.slice(0, 3)}****${phone.slice(-2)}`;
    }
  }

  // Mask email (show first 2 chars and domain)
  if (masked.email) {
    const email = masked.email.toString();
    const [username, domain] = email.split('@');
    if (username && domain) {
      masked.email = `${username.slice(0, 2)}***@${domain}`;
    }
  }

  return masked;
}

/**
 * Generate secure API key for merchant integrations
 */
export function generateAPIKey(): string {
  const array = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypt data for transmission to Bank of Tanzania
 * - Extra layer of security for regulatory reporting
 */
export async function encryptForBOT(reportData: any): Promise<string> {
  const jsonData = JSON.stringify(reportData);
  const encrypted = await encryptServerData(jsonData);
  
  // Add digital signature for authenticity
  const hmac = await generateHMAC(encrypted.ciphertext, getEncryptionKey());
  
  return JSON.stringify({
    ...encrypted,
    signature: hmac,
    issuer: 'goPay Tanzania',
    timestamp: new Date().toISOString()
  });
}

export default {
  encryptServerData,
  decryptServerData,
  hashData,
  encryptPII,
  decryptPII,
  generateHMAC,
  verifyHMAC,
  encryptTransactionLog,
  decryptTransactionLog,
  maskSensitiveData,
  generateAPIKey,
  encryptForBOT
};
