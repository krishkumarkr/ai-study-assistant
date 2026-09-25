import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;        // 12 bytes is the recommended IV length for GCM
const AUTH_TAG_LENGTH = 16;  // 16 bytes (128-bit) authentication tag
const ENCODING = 'hex';

/**
 * Get the encryption key from environment variable.
 * Must be a 64-char hex string (32 bytes = 256 bits).
 */
const getKey = () => {
    const key = process.env.CHAT_ENCRYPTION_KEY;
    if (!key) {
        throw new Error('CHAT_ENCRYPTION_KEY is not set in environment variables');
    }
    return Buffer.from(key, 'hex');
};

/**
 * Encrypt plaintext using AES-256-GCM.
 * 
 * @param {string} plaintext - The text to encrypt
 * @returns {string} Encrypted string in format "iv:authTag:ciphertext" (hex-encoded)
 */
export const encrypt = (plaintext) => {
    if (!plaintext || typeof plaintext !== 'string') {
        return plaintext;
    }

    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH
    });

    let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext (all hex-encoded)
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
};

/**
 * Decrypt an AES-256-GCM encrypted string.
 * 
 * @param {string} encryptedString - String in format "iv:authTag:ciphertext" (hex-encoded)
 * @returns {string} Decrypted plaintext
 */
export const decrypt = (encryptedString) => {
    if (!encryptedString || typeof encryptedString !== 'string') {
        return encryptedString;
    }

    // If it doesn't match the encrypted format, return as-is (plaintext fallback)
    if (!isEncrypted(encryptedString)) {
        return encryptedString;
    }

    const key = getKey();
    const [ivHex, authTagHex, ciphertext] = encryptedString.split(':');

    const iv = Buffer.from(ivHex, ENCODING);
    const authTag = Buffer.from(authTagHex, ENCODING);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH
    });

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

/**
 * Check if a string is in the encrypted format (iv:authTag:ciphertext).
 * 
 * @param {string} str - The string to check
 * @returns {boolean} True if the string appears to be encrypted
 */
export const isEncrypted = (str) => {
    if (!str || typeof str !== 'string') return false;

    const parts = str.split(':');
    if (parts.length !== 3) return false;

    const [iv, authTag, ciphertext] = parts;

    // IV should be 24 hex chars (12 bytes), authTag should be 32 hex chars (16 bytes)
    return (
        iv.length === 24 &&
        authTag.length === 32 &&
        ciphertext.length > 0 &&
        /^[0-9a-f]+$/.test(iv) &&
        /^[0-9a-f]+$/.test(authTag) &&
        /^[0-9a-f]+$/.test(ciphertext)
    );
};
