/**
 * Resend Transactional Email API Client
 * The Jawed Habib Salon – Lalganj
 * Uses native fetch for zero-dependency Vercel Serverless execution.
 */

import { BRAND_CONFIG } from "@/lib/constants/brand";
import type { EmailAttachment, EmailSendResult } from "./types";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

export class ResendEmailClient {
  private apiKey: string | null;
  private defaultFrom: string;
  private defaultReplyTo: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY?.trim() || null;
    this.defaultFrom =
      process.env.EMAIL_FROM?.trim() ||
      `The Jawed Habib Salon – Lalganj <notifications@thejawedhabibsalons.in>`;
    this.defaultReplyTo =
      process.env.EMAIL_REPLY_TO?.trim() ||
      `The Jawed Habib Salon Concierge <support@thejawedhabibsalons.in>`;
  }

  /**
   * Dispatches transactional email via Resend REST API or simulates in sandbox/test mode.
   */
  async send(options: SendEmailOptions): Promise<EmailSendResult> {
    const toRecipients = Array.isArray(options.to) ? options.to : [options.to];

    // Filter and sanitize recipients
    const validRecipients = toRecipients
      .map((r) => r.trim().toLowerCase())
      .filter((r) => r.includes("@") && !r.includes(" "));

    if (validRecipients.length === 0) {
      return {
        success: false,
        error: "No valid recipient email address provided.",
      };
    }

    // Sandbox / Test Mode Simulation if no API key is provided
    if (!this.apiKey || this.apiKey === "YOUR_RESEND_API_KEY" || this.apiKey.startsWith("mock_")) {
      const simulatedId = `msg_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      if (process.env.NODE_ENV !== "test") {
        console.log(`[RESEND_EMAIL_SIMULATED] (No RESEND_API_KEY configured)`, {
          to: validRecipients,
          subject: options.subject,
          simulatedMessageId: simulatedId,
          hasAttachments: Boolean(options.attachments?.length),
        });
      }
      return {
        success: true,
        messageId: simulatedId,
        provider: "RESEND_SANDBOX_SIMULATOR",
        simulated: true,
      };
    }

    try {
      const payload: Record<string, any> = {
        from: options.from || this.defaultFrom,
        to: validRecipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo || this.defaultReplyTo,
      };

      if (options.attachments && options.attachments.length > 0) {
        payload.attachments = options.attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
        }));
      }

      if (options.headers) {
        payload.headers = options.headers;
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || data?.error?.message || `HTTP ${response.status} from Resend API`;
        console.warn("[RESEND_API_ERROR]", {
          status: response.status,
          error: errorMsg,
          to: validRecipients,
        });
        return {
          success: false,
          error: errorMsg,
          provider: "RESEND",
        };
      }

      return {
        success: true,
        messageId: data?.id || `msg_${Date.now()}`,
        provider: "RESEND",
        simulated: false,
      };
    } catch (err: any) {
      console.error("[RESEND_DISPATCH_EXCEPTION]", {
        message: err.message,
        to: validRecipients,
      });
      return {
        success: false,
        error: err.message || "Failed to communicate with Resend API",
        provider: "RESEND",
      };
    }
  }
}

export const resendClient = new ResendEmailClient();
export default resendClient;
