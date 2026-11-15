/**
 * Centralized Environment Configuration & Validation
 * The Jawed Habib Salon – Lalganj
 *
 * Implements strict schema validation using Zod.
 * Protects against missing configurations, invalid formats, and secret leakage in logs.
 */

import { z } from "zod";

// -------------------------------------------------------------
// 1. Server-Side Environment Variables Schema
// -------------------------------------------------------------
export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required for database operations.")
    .optional(),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters long (32+ recommended).")
    .default("development-jwt-secret-key-32-chars-long-minimum"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_DEFAULT_EMAIL: z.string().email().optional(),
  ADMIN_DEFAULT_PASSWORD: z.string().min(8).optional(),
  PAYMENT_ENCRYPTION_KEY: z.string().min(16).optional(),
  RAZORPAY_ENVIRONMENT: z.enum(["TEST", "LIVE"]).optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_LIVE_KEY_ID: z.string().optional(),
  RAZORPAY_LIVE_KEY_SECRET: z.string().optional(),
  RAZORPAY_LIVE_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_TEST_KEY_ID: z.string().optional(),
  RAZORPAY_TEST_KEY_SECRET: z.string().optional(),
  RAZORPAY_TEST_WEBHOOK_SECRET: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
});

// -------------------------------------------------------------
// 2. Client-Side (NEXT_PUBLIC_) Environment Variables Schema
// -------------------------------------------------------------
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_SALON_NAME: z.string().default("The Jawed Habib Salon – Lalganj"),
  NEXT_PUBLIC_SALON_PHONE_PRIMARY: z.string().default("7707000463"),
  NEXT_PUBLIC_SALON_PHONE_SECONDARY: z.string().default("9831722983"),
  NEXT_PUBLIC_SALON_PHONE_TERTIARY: z.string().default("9580000175"),
  NEXT_PUBLIC_SALON_WHATSAPP: z.string().default("917707000463"),
  NEXT_PUBLIC_SALON_INSTAGRAM: z
    .string()
    .url()
    .default("https://www.instagram.com/the_jawedhabib_lalganj/"),
  NEXT_PUBLIC_SALON_MAPS_URL: z
    .string()
    .url()
    .default("https://maps.app.goo.gl/TVx48xoWEu8dMvXT9"),
  NEXT_PUBLIC_PAYMENT_MODE: z.enum(["TEST", "LIVE"]).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type FullEnv = ServerEnv & ClientEnv;

export interface EnvValidationResult {
  valid: boolean;
  isProduction: boolean;
  errors: Record<string, string[]>;
  warnings: string[];
  data?: FullEnv;
}

/**
 * Validates the runtime environment variables against the authoritative schemas.
 * Never logs or prints sensitive secret values.
 */
export function validateEnv(
  customEnv?: Record<string, string | undefined>
): EnvValidationResult {
  const raw = customEnv || process.env;
  const isProd = raw.NODE_ENV === "production";

  const serverValidation = serverEnvSchema.safeParse(raw);
  const clientValidation = clientEnvSchema.safeParse(raw);

  const errors: Record<string, string[]> = {};
  const warnings: string[] = [];

  if (!serverValidation.success) {
    const fieldErrors = serverValidation.error.flatten().fieldErrors;
    for (const [key, msgs] of Object.entries(fieldErrors)) {
      if (msgs && msgs.length > 0) {
        errors[key] = msgs;
      }
    }
  }

  if (!clientValidation.success) {
    const fieldErrors = clientValidation.error.flatten().fieldErrors;
    for (const [key, msgs] of Object.entries(fieldErrors)) {
      if (msgs && msgs.length > 0) {
        errors[key] = msgs;
      }
    }
  }

  // Production-specific security checks
  if (isProd) {
    if (!raw.DATABASE_URL) {
      errors.DATABASE_URL = ["DATABASE_URL is strictly required in production."];
    }
    if (
      raw.JWT_SECRET === "development-jwt-secret-key-32-chars-long-minimum" ||
      raw.JWT_SECRET === "super-secret-jwt-key-replace-in-production-min-32-chars"
    ) {
      errors.JWT_SECRET = [
        "Insecure default JWT_SECRET detected in production. Rotate with a random 32+ char secret.",
      ];
    }
    if (!raw.JWT_SECRET || raw.JWT_SECRET.length < 32) {
      errors.JWT_SECRET = [
        "JWT_SECRET must be at least 32 characters long in production.",
      ];
    }
    if (!raw.PAYMENT_ENCRYPTION_KEY && !raw.JWT_SECRET) {
      errors.PAYMENT_ENCRYPTION_KEY = [
        "PAYMENT_ENCRYPTION_KEY or a strong JWT_SECRET is required to secure gateway secrets.",
      ];
    }
  } else {
    // Development warnings
    if (!raw.DATABASE_URL) {
      warnings.push(
        "DATABASE_URL is not set. Application will utilize the high-fidelity In-Memory repository."
      );
    }
    if (!raw.RAZORPAY_KEY_ID || raw.RAZORPAY_KEY_ID.includes("mock")) {
      warnings.push(
        "Razorpay test keys not configured. System is running in simulated sandbox mode."
      );
    }
  }

  const isValid = Object.keys(errors).length === 0;

  const data: FullEnv | undefined = isValid
    ? ({
        ...(serverValidation.success ? serverValidation.data : {}),
        ...(clientValidation.success ? clientValidation.data : {}),
      } as FullEnv)
    : undefined;

  return {
    valid: isValid,
    isProduction: isProd,
    errors,
    warnings,
    data,
  };
}

/**
 * Returns a safely sanitized summary of the environment status for diagnostics.
 * Never outputs sensitive passwords, secrets, or keys.
 */
export function getSanitizedEnvReport(): {
  environment: string;
  hasDatabaseUrl: boolean;
  hasJwtSecret: boolean;
  hasPaymentEncryptionKey: boolean;
  hasRazorpayCredentials: boolean;
  hasCloudinaryCredentials: boolean;
  salonName: string;
  appUrl: string;
} {
  return {
    environment: process.env.NODE_ENV || "development",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasPaymentEncryptionKey: Boolean(process.env.PAYMENT_ENCRYPTION_KEY),
    hasRazorpayCredentials: Boolean(
      process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ),
    hasCloudinaryCredentials: Boolean(
      process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
    ),
    salonName:
      process.env.NEXT_PUBLIC_SALON_NAME || "The Jawed Habib Salon – Lalganj",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };
}

// Perform initial validation pass
export const envValidation = validateEnv();
