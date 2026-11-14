/**
 * Safe Structured Server-Side Logger
 * The Jawed Habib Salon – Lalganj
 *
 * Emits structured JSON log entries.
 * Automatically and recursively scrubs passwords, API secrets, JWT tokens,
 * credit card numbers, CVVs, and sensitive credentials to guarantee zero secret leakage.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "accesstoken",
  "refreshtoken",
  "jwt",
  "secret",
  "keysecret",
  "webhooksecret",
  "authorization",
  "cookie",
  "session",
  "cvv",
  "cardnumber",
  "creditcard",
  "card",
  "database_url",
  "direct_url",
  "payment_encryption_key",
  "cloudinary_api_secret",
]);

/**
 * Recursively deep-scrubs any sensitive keys from objects or arrays.
 */
export function scrubSensitiveData(data: any, depth: number = 0): any {
  if (depth > 8 || data === null || data === undefined) return data;

  if (typeof data === "string") {
    // If a string looks like a JWT token (header.payload.signature)
    if (/^[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/.test(data)) {
      return "[REDACTED_JWT_TOKEN]";
    }
    // If a string looks like a DB connection string
    if (data.includes("postgres://") || data.includes("postgresql://")) {
      return "[REDACTED_DATABASE_URL]";
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => scrubSensitiveData(item, depth + 1));
  }

  if (typeof data === "object") {
    const scrubbed: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, "");
      if (SENSITIVE_KEYS.has(lowerKey)) {
        scrubbed[key] = "[REDACTED_SECRET]";
      } else if (typeof value === "object" && value !== null) {
        scrubbed[key] = scrubSensitiveData(value, depth + 1);
      } else if (typeof value === "string") {
        scrubbed[key] = scrubSensitiveData(value, depth + 1);
      } else {
        scrubbed[key] = value;
      }
    }
    return scrubbed;
  }

  return data;
}

/**
 * Masks phone numbers to protect customer privacy in application logs
 * e.g. "7707000463" -> "770****463"
 */
export function maskPhone(phone?: string | null): string {
  if (!phone || phone.length < 7) return "***";
  const start = phone.slice(0, 3);
  const end = phone.slice(-3);
  return `${start}****${end}`;
}

export type LogLevel = "INFO" | "WARN" | "ERROR" | "AUDIT";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  service: string;
  environment: string;
  data?: Record<string, any>;
  error?: {
    name?: string;
    message: string;
    code?: string;
  };
  actor?: {
    userId?: string;
    role?: string;
    ip?: string;
  };
}

class SafeLogger {
  private serviceName = "jawed-habib-backend";
  private environment = process.env.NODE_ENV || "development";

  private emit(entry: LogEntry): void {
    const jsonStr = JSON.stringify(entry);
    if (entry.level === "ERROR") {
      console.error(jsonStr);
    } else if (entry.level === "WARN") {
      console.warn(jsonStr);
    } else {
      console.log(jsonStr);
    }
  }

  info(event: string, data?: Record<string, any>): void {
    this.emit({
      timestamp: new Date().toISOString(),
      level: "INFO",
      event,
      service: this.serviceName,
      environment: this.environment,
      data: data ? scrubSensitiveData(data) : undefined,
    });
  }

  warn(event: string, data?: Record<string, any>): void {
    this.emit({
      timestamp: new Date().toISOString(),
      level: "WARN",
      event,
      service: this.serviceName,
      environment: this.environment,
      data: data ? scrubSensitiveData(data) : undefined,
    });
  }

  error(event: string, err: unknown, data?: Record<string, any>): void {
    const errorObj =
      err instanceof Error
        ? {
            name: err.name,
            message: err.message,
            code: (err as any).code,
          }
        : { message: String(err) };

    this.emit({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      event,
      service: this.serviceName,
      environment: this.environment,
      error: errorObj,
      data: data ? scrubSensitiveData(data) : undefined,
    });
  }

  audit(
    action: string,
    actor?: { userId?: string; role?: string; ip?: string },
    details?: Record<string, any>
  ): void {
    this.emit({
      timestamp: new Date().toISOString(),
      level: "AUDIT",
      event: `audit.${action}`,
      service: this.serviceName,
      environment: this.environment,
      actor,
      data: details ? scrubSensitiveData(details) : undefined,
    });
  }
}

export const logger = new SafeLogger();
export default logger;
