# The Jawed Habib Salon – Lalganj
## Contact Form Enquiry, Google Sheets API v4 & Email Notification Setup Guide

> **Target Audience:** Salon Administrators, Technical Operations, and DevOps Engineers.  
> **Brand Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121.  
> **Domain:** `https://www.thejawedhabibsalons.in`

---

### Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Google Cloud Console Setup & Service Account](#2-google-cloud-console-setup--service-account)
3. [Google Spreadsheet Configuration & Permissions](#3-google-spreadsheet-configuration--permissions)
4. [Resend Transactional Email Configuration](#4-resend-transactional-email-configuration)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Local & Production Verification](#6-local--production-verification)
7. [Admin Portal Management Workflow](#7-admin-portal-management-workflow)
8. [Troubleshooting & Retry Procedures](#8-troubleshooting--retry-procedures)

---

### 1. Overview & Architecture

Whenever a customer submits an inquiry on the public website (`/contact` or home page contact drawer), the system executes a resilient three-tier lifecycle:

```
[Customer Submits Contact Form]
              │
              ▼
   [Validation & Anti-Spam]
   (Zod, Honeypot, Rate Limit, 60s Debounce)
              │
              ▼
  [Neon PostgreSQL Persistence]
  (model Enquiry: status=NEW, ref=ENQ-YYYYMMDD-XXXX)
              │
    ┌─────────┴─────────┐
    ▼                   ▼
[Google Sheets]     [Resend Email]
(RS256 OAuth2)     (Admin Notification)
valueInputOption=RAW  Call / WhatsApp links
    │                   │
    └─────────┬─────────┘
              ▼
  [Update Sync Statuses]
  (SYNCED / SENT / FAILED)
```

1. **Neon PostgreSQL Database (Single Source of Truth):**  
   Every submission is immediately validated with Zod and persisted into table `Enquiry` with an auto-generated, human-readable reference number (`ENQ-YYYYMMDD-XXXX`) and initial status `NEW`.
2. **Google Sheets API v4 (Real-Time Spreadsheet Sync):**  
   A lightweight, zero-dependency REST integration authenticates using a Google Cloud Service Account via RS256 JWT token exchange and appends row data using `valueInputOption=RAW` (preventing formula injection).
3. **Resend Email Notification:**  
   Dispatches a luxury black & champagne gold styled lead alert to `CONTACT_NOTIFICATION_EMAIL` with direct one-click action links (Call Customer `tel:`, WhatsApp chat `wa.me`, and Admin Portal `href`).
4. **Resilience & Fault Isolation:**  
   If Google Sheets or the email service encounters downtime or rate limits, the customer submission is **never failed**. The inquiry is safely saved in the database, the failure status is flagged (`FAILED`), and staff can re-trigger synchronization with one click in the Admin Portal.

---

### 2. Google Cloud Console Setup & Service Account

Follow these steps to generate a Google Cloud Service Account with access to the Google Sheets API:

#### Step 2.1: Create or Select a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your salon administrator Google account.
3. In the top navigation bar, click the Project dropdown and click **New Project**.
4. Name the project: `Jawed-Habib-Lalganj` and click **Create**.

#### Step 2.2: Enable the Google Sheets API
1. In the Google Cloud Console, open the left navigation menu and select **APIs & Services > Library**.
2. In the search box, search for `Google Sheets API`.
3. Select **Google Sheets API** from the results.
4. Click **Enable**.

#### Step 2.3: Create a Service Account
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials** at the top and select **Service Account**.
3. Fill in the service account details:
   - **Service account name:** `salon-enquiry-sync`
   - **Service account ID:** `salon-enquiry-sync` (auto-generated)
   - **Description:** `Automated sync of website customer enquiries into Google Sheets`
4. Click **Create and Continue**.
5. *Grant this service account access to project:* Leave as default (No project-level role is required since sheet permissions are granted directly on the spreadsheet). Click **Continue**.
6. Click **Done**.

#### Step 2.4: Generate and Download the Private Key (JSON)
1. In the **Credentials** page, find the newly created service account in the **Service Accounts** table.
2. Click on the service account email (e.g. `salon-enquiry-sync@jawed-habib-lalganj.iam.gserviceaccount.com`).
3. Click on the **Keys** tab at the top.
4. Click **Add Key > Create new key**.
5. Choose **JSON** as the key type and click **Create**.
6. A JSON file will automatically download to your computer. Keep this file secure! It contains:
   - `client_email`: The Service Account email.
   - `private_key`: The RSA private key (`-----BEGIN PRIVATE KEY-----\n...`).

---

### 3. Google Spreadsheet Configuration & Permissions

#### Step 3.1: Create the Google Spreadsheet
1. Open [Google Sheets](https://sheets.google.com/) and click **Blank Spreadsheet**.
2. Rename the spreadsheet to: `The Jawed Habib Salon - Lalganj | Customer Enquiries`.
3. Rename the first sheet/tab to: `Sheet1`.

#### Step 3.2: Configure Column Headers
Paste the following exact 9 headers into row 1 (columns A through I):

| Column | Header Name | Format / Example | Description |
| :---: | :--- | :--- | :--- |
| **A** | **Enquiry ID** | `ENQ-20261114-0001` | Human-readable unique reference |
| **B** | **Submission Date** | `14 Nov 2026` | Date in Asia/Kolkata timezone |
| **C** | **Submission Time** | `04:30 PM` | Time in Asia/Kolkata timezone |
| **D** | **Customer Name** | `Pooja Verma` | Full name submitted by customer |
| **E** | **Mobile Number** | `9831722983` | 10-digit Indian phone number |
| **F** | **Service of Interest**| `Bridal Makeup` | Selected category or service |
| **G** | **Message / Query** | `Need bridal booking...`| Complete query text from visitor |
| **H** | **Status** | `NEW` | Initial lead status |
| **I** | **Source** | `Website Contact Form`| Inbound traffic source |

*Tip: Format Row 1 with bold text and dark background (`#111111`) with gold/yellow text (`#C6A56B`) to match the salon brand.*

#### Step 3.3: Extract the Google Sheet ID
From the browser URL bar:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
                                       ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
                                                    GOOGLE_SHEET_ID
```
Copy the string between `/d/` and `/edit`. This is your `GOOGLE_SHEET_ID`.

#### Step 3.4: Share the Spreadsheet with the Service Account
1. In your Google Spreadsheet, click the green **Share** button at the top right.
2. In the "Add people and groups" field, paste the **Service Account Email** (e.g. `salon-enquiry-sync@jawed-habib-lalganj.iam.gserviceaccount.com`).
3. Set the permission role to **Editor**.
4. Uncheck "Notify people" (service accounts don't have inboxes).
5. Click **Share**.

---

### 4. Resend Transactional Email Configuration

1. Log in to [Resend](https://resend.com/).
2. Under **API Keys**, create an API key with sending permissions and copy it: `re_...`.
3. Under **Domains**, ensure your domain `thejawedhabibsalons.in` is verified with SPF and DKIM DNS records.
4. Set `EMAIL_FROM` to: `The Jawed Habib Salon <notifications@thejawedhabibsalons.in>`.
5. Set `CONTACT_NOTIFICATION_EMAIL` to the email where reception staff or salon management receives inbound leads (e.g. `contact@thejawedhabibsalons.in` or `thejawedhabiblalganj@gmail.com`).

---

### 5. Environment Variables Reference

Add the following environment variables to your `.env.local` (local development) and Vercel Project Settings (Production):

```bash
# ------------------------------------------------------------------------------
# CONTACT ENQUIRY & GOOGLE SHEETS SYNCHRONIZATION
# ------------------------------------------------------------------------------
# Destination administrator email for customer website enquiry notifications
CONTACT_NOTIFICATION_EMAIL="contact@thejawedhabibsalons.in"

# Set to "true" to enable real-time appending to Google Spreadsheet
GOOGLE_SHEETS_ENABLED="true"

# Google Sheet ID extracted from spreadsheet URL
GOOGLE_SHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

# Google Cloud IAM Service Account Email with Editor access
GOOGLE_SERVICE_ACCOUNT_EMAIL="salon-enquiry-sync@jawed-habib-lalganj.iam.gserviceaccount.com"

# Google Cloud Service Account Private Key (include \n for multiline)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> [!TIP]
> **Formatting Private Keys in Vercel:**  
> When pasting `GOOGLE_PRIVATE_KEY` into Vercel's Environment Variables UI, you can paste the key directly with quotes or formatted with literal `\n` characters. Our native integration unescapes both literal `\n` and escaped `\\n`.

---

### 6. Local & Production Verification

#### Development / Simulated Mode
When `GOOGLE_SHEETS_ENABLED="false"` or credentials contain placeholder strings, the system operates in **SIMULATED** mode. Inquiries are fully saved to Neon PostgreSQL, mock responses are logged, and no external API errors occur.

#### Production Test Verification
1. Open the public contact page: `https://www.thejawedhabibsalons.in/contact`
2. Submit a test inquiry:
   - **Name:** `Test Guest`
   - **Mobile Phone:** `7707000463`
   - **Service:** `Bridal Suite & Premium Hair Spa`
   - **Message:** `Live end-to-end integration verification test.`
3. **Verify Public UI:** The contact form displays the confirmation screen with the generated Reference ID (`ENQ-YYYYMMDD-XXXX`).
4. **Verify Google Sheets:** Open the Google Spreadsheet. A new row should be present at the bottom with all 9 columns filled.
5. **Verify Email:** Check `CONTACT_NOTIFICATION_EMAIL`. An email with black & champagne gold styling will arrive containing lead details and direct links.
6. **Verify Admin Portal:** Navigate to `https://www.thejawedhabibsalons.in/admin/enquiries`. The new lead will appear at the top with status `NEW`.

---

### 7. Admin Portal Management Workflow

The Admin Portal enquiry management center is located at:
`https://www.thejawedhabibsalons.in/admin/enquiries`

#### Key Capabilities:
- **Real-Time Operational Counters:**
  Displays active counters for **Total Leads**, **New (Uncontacted)**, **Contacted**, **Scheduled**, and **Resolved**.
- **Instant Search & Filtering:**
  Filter enquiries by status (`ALL`, `NEW`, `CONTACTED`, `SCHEDULED`, `RESOLVED`, `SPAM`) or search in real-time by customer name or 10-digit phone number.
- **Direct Communication Action Buttons:**
  - **Call Customer:** Click `Call Customer` to immediately trigger a phone call (`tel:+91...`).
  - **WhatsApp:** Click `WhatsApp` to open a pre-filled WhatsApp conversation addressing the client by name and service of interest.
- **Enquiry Detail Drawer & Staff Notes:**
  Click any row or click `View & Update` to view the complete inquiry, read customer remarks, update status, and save internal follow-up notes.
- **Sync Status Badges:**
  - `Email: SENT` / `Email: FAILED`
  - `Sheets: SYNCED` / `Sheets: FAILED`

---

### 8. Troubleshooting & Retry Procedures

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **`googleSheetsStatus: FAILED`** with "The caller does not have permission" | Service Account was not added to the Google Sheet | Open the spreadsheet, click **Share**, and grant **Editor** access to `GOOGLE_SERVICE_ACCOUNT_EMAIL`. |
| **`googleSheetsStatus: FAILED`** with "Requested entity was not found" | Incorrect `GOOGLE_SHEET_ID` | Check the spreadsheet URL and verify the ID in `.env` matches the URL string between `/d/` and `/edit`. |
| **`emailStatus: FAILED`** with "Domain not verified" | Resend sending domain missing DNS records | Go to Resend dashboard > Domains and ensure SPF/DKIM records have status "Verified". |
| **One-Click Retry from Admin Portal** | Network glitch or external service downtime | In `/admin/enquiries`, click the amber **Retry** button next to the failed badge, or open the enquiry details modal and click **Retry Integrations**. |

---

*End of Setup Guide.*
