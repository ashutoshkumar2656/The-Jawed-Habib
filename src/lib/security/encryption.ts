import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM
const AUTH_TAG_LENGTH = 16; // Standard 128-bit authentication tag

function getMasterKey(): Buffer {
  const seed =
    process.env.PAYMENT_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "jawed-habib-lalganj-secure-encryption-key-2026";
  // Derive deterministic 32-byte (256-bit) key
  return crypto.scryptSync(seed, "jawed-habib-payment-salt-lalganj", 32);
}

/**
 * Encrypts a plaintext secret using authenticated AES-256-GCM.
 * Output format: ivHex:authTagHex:encryptedHex
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText) return "";
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) {
      // In case it was already plaintext or legacy
      return cipherText;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed: signature mismatch or corrupted data");
    return "";
  }
}

/**
 * Returns a safely masked version of an API Key or Secret for administrative UI display.
 * Never leaks the full credential.
 */
export function maskSecret(secret: string | null | undefined): string {
  if (!secret) return "Not Configured";
  if (secret.length <= 8) return "••••••••";
  const start = secret.slice(0, 4);
  const end = secret.slice(-4);
  return `${start}••••••••${end}`;
}

/**
 * Mask an API Key ID (e.g. rzp_test_1234567890abcdef -> rzp_test_••••cdef)
 */
export function maskKeyId(keyId: string | null | undefined): string {
  if (!keyId) return "";
  if (keyId.length <= 12) return keyId;
  const prefix = keyId.slice(0, 8);
  const suffix = keyId.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

/**
 * Timing-safe string comparison to protect against timing attacks.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
