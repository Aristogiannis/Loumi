'use client';

// AES-GCM encryption utilities for Sovereign tier

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

// Generate a new encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Derive a key from a password
export async function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const actualSalt = salt || crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: actualSalt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );

  return { key, salt: actualSalt };
}

// Export key to base64
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Import key from base64
export async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyData);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt text
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    data
  );

  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return arrayBufferToBase64(combined.buffer as ArrayBuffer);
}

// Decrypt text
export async function decrypt(ciphertext: string, key: CryptoKey): Promise<string> {
  const combined = base64ToArrayBuffer(ciphertext);
  const combinedArray = new Uint8Array(combined);

  const iv = combinedArray.slice(0, IV_LENGTH);
  const data = combinedArray.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Hash a string (for key verification)
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Encryption manager for managing user keys
class EncryptionManager {
  private key: CryptoKey | null = null;

  async initialize(password?: string): Promise<void> {
    if (password) {
      const { key } = await deriveKeyFromPassword(password);
      this.key = key;
    } else {
      this.key = await generateEncryptionKey();
    }
  }

  async setKey(key: CryptoKey): Promise<void> {
    this.key = key;
  }

  async encrypt(plaintext: string): Promise<string> {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }
    return encrypt(plaintext, this.key);
  }

  async decrypt(ciphertext: string): Promise<string> {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }
    return decrypt(ciphertext, this.key);
  }

  isInitialized(): boolean {
    return this.key !== null;
  }

  clear(): void {
    this.key = null;
  }
}

// Singleton instance
export const encryptionManager = new EncryptionManager();
