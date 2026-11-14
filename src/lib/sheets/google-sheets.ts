/**
 * Google Sheets API v4 Integration Service
 * The Jawed Habib Salon – Lalganj
 * Uses Google Cloud Service Account with RS256 JWT OAuth2 token exchange
 * Appends customer contact enquiries directly via Google Sheets REST API.
 */

import crypto from "crypto";

export interface GoogleSheetsEnquiryRow {
  enquiryId: string;
  submissionDate: string; // e.g. "14 Nov 2026" or "2026-11-14"
  submissionTime: string; // e.g. "05:30 PM"
  customerName: string;
  mobileNumber: string;
  serviceInterest: string;
  message: string;
  status: string;
  source: string;
}

export interface GoogleSheetsSyncResult {
  success: boolean;
  status: "SYNCED" | "FAILED" | "DISABLED" | "SIMULATED";
  updatedRange?: string;
  error?: string;
  timestamp: Date;
}

export interface GoogleSheetsTestResult {
  success: boolean;
  spreadsheetTitle?: string;
  error?: string;
  simulated?: boolean;
}

function base64UrlEncode(str: string | Buffer): string {
  const buf = Buffer.isBuffer(str) ? str : Buffer.from(str, "utf8");
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export class GoogleSheetsService {
  private enabled: boolean;
  private sheetId: string | null;
  private serviceAccountEmail: string | null;
  private privateKey: string | null;

  constructor() {
    this.enabled = process.env.GOOGLE_SHEETS_ENABLED === "true";
    this.sheetId = process.env.GOOGLE_SHEET_ID?.trim() || null;
    this.serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || null;
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim() || null;
  }

  /**
   * Checks whether Google Sheets synchronization is enabled and valid credentials are set.
   */
  isConfigured(): boolean {
    if (!this.enabled) return false;
    if (!this.sheetId || this.sheetId === "YOUR_GOOGLE_SPREADSHEET_ID" || this.sheetId.includes("your_")) return false;
    if (!this.serviceAccountEmail || !this.serviceAccountEmail.includes("@") || this.serviceAccountEmail.includes("your-")) return false;
    if (!this.privateKey || this.privateKey.includes("YOUR_GOOGLE") || this.privateKey.includes("your_private_key")) return false;
    return true;
  }

  /**
   * Generates a short-lived OAuth2 Bearer token using Google Service Account credentials (RS256 JWT).
   */
  async getAccessToken(): Promise<string> {
    if (!this.serviceAccountEmail || !this.privateKey) {
      throw new Error("Missing Google Service Account email or private key");
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const claimSet = {
      iss: this.serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
    const signInput = `${encodedHeader}.${encodedClaimSet}`;

    // Format RSA private key (unescape \n and \\n)
    let formattedKey = this.privateKey.replace(/\\n/g, "\n");
    if (!formattedKey.includes("-----BEGIN PRIVATE KEY-----")) {
      formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    }

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(signInput);
    const signature = base64UrlEncode(signer.sign(formattedKey));
    const assertion = `${signInput}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      signal: AbortSignal.timeout(12000),
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
      throw new Error(data.error_description || data.error || "Failed to exchange Google OAuth2 access token");
    }

    return data.access_token;
  }

  /**
   * Appends an enquiry row into the configured Google Sheet using the official Sheets API v4.
   * Uses valueInputOption=RAW to strictly prevent spreadsheet formula injection.
   */
  async appendEnquiryRow(payload: GoogleSheetsEnquiryRow): Promise<GoogleSheetsSyncResult> {
    const timestamp = new Date();

    if (!this.enabled) {
      return {
        success: true,
        status: "DISABLED",
        timestamp,
      };
    }

    if (!this.isConfigured()) {
      if (process.env.NODE_ENV !== "test") {
        console.log("[GOOGLE_SHEETS_SIMULATED] (Enabled but placeholder credentials configured)", {
          enquiryId: payload.enquiryId,
          customerName: payload.customerName,
          mobileNumber: payload.mobileNumber,
        });
      }
      return {
        success: true,
        status: "SIMULATED",
        updatedRange: "Sheet1!A2:I2",
        timestamp,
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      // Row layout matches Section 4 exactly:
      // A: Enquiry ID, B: Date, C: Time, D: Name, E: Mobile, F: Service, G: Message, H: Status, I: Source
      const rowValues = [
        payload.enquiryId,
        payload.submissionDate,
        payload.submissionTime,
        payload.customerName,
        payload.mobileNumber,
        payload.serviceInterest,
        payload.message,
        payload.status,
        payload.source,
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        this.sheetId!
      )}/values/Sheet1!A:I:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
        signal: AbortSignal.timeout(15000),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || `Google Sheets API returned HTTP ${res.status}`);
      }

      return {
        success: true,
        status: "SYNCED",
        updatedRange: json.updates?.updatedRange || "Sheet1!A:I",
        timestamp,
      };
    } catch (err: any) {
      console.error("[GOOGLE_SHEETS_SYNC_ERROR]:", err.message || err);
      return {
        success: false,
        status: "FAILED",
        error: err.message || "Failed to append row to Google Spreadsheet",
        timestamp,
      };
    }
  }

  /**
   * Tests connection to Google Spreadsheet and verifies service account permissions.
   */
  async testConnection(): Promise<GoogleSheetsTestResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Google Sheets integration is disabled or credentials are unconfigured.",
        simulated: true,
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(this.sheetId!)}?fields=properties.title`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to access spreadsheet");
      }

      return {
        success: true,
        spreadsheetTitle: json.properties?.title || "Google Sheet",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to connect to Google Sheets API",
      };
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
