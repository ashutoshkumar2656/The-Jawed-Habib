# Live Production Admin Dashboard Error Investigation & Repair Report

> **Project Name:** The Jawed Habib Salon – Lalganj  
> **Investigation Date:** November 14, 2026  
> **Production Domain:** `https://www.thejawedhabibsalons.in`  
> **Affected URL:** `https://thejawedhabibsalons.in/admin/dashboard` / `https://www.thejawedhabibsalons.in/admin/dashboard`  
> **Status:** **ROOT CAUSE DIAGNOSED, REPRODUCED, REPAIRED & VERIFIED**

---

## 1. Executive Summary & Defect Classification

| Finding / Area | Classification | Summary |
| :--- | :---: | :--- |
| **Exact Production Error** | **VERIFIED FAILED** | Server rendered `<html id="__next_error__">` returning `HTTP 500 Internal Server Error`, triggering root `src/app/error.tsx` boundary: *"Something went wrong. An unexpected error occurred while loading this page. Our salon concierge has been notified."* |
| **Failed URL** | **VERIFIED FAILED** | `https://www.thejawedhabibsalons.in/admin/dashboard` (canonical production domain). |
| **Canonical Domain Redirect**| **VERIFIED WORKING** | `https://thejawedhabibsalons.in/admin/dashboard` issues an `HTTP 308 Permanent Redirect` to `https://www.thejawedhabibsalons.in/admin/dashboard`. |
| **Admin Authentication Guard**| **VERIFIED WORKING** | Unauthenticated visitors to `/admin/dashboard` receive an `HTTP 307 Temporary Redirect` to `/admin/login?redirect=%2Fadmin%2Fdashboard`. |
| **Admin API Login & JWT** | **VERIFIED WORKING** | `POST /api/auth/login` authenticates owner (`7707000463`, `SUPER_ADMIN`) in 89ms–272ms, setting secure HTTP-only `habib_session_token`. |
| **Submodule Admin Routes** | **VERIFIED WORKING** | All 13 other admin modules (`/admin/bookings`, `/admin/calendar`, `/admin/customers`, `/admin/services`, `/admin/packages`, `/admin/staff`, `/admin/payments`, `/admin/gallery`, `/admin/transformations`, `/admin/reviews`, `/admin/content`, `/admin/enquiries`, `/admin/settings`) respond with `200 OK`. |
| **Neon PostgreSQL Database**| **VERIFIED WORKING** | `GET /api/health/database` responds with `status: healthy`, latency 1,594ms, provider `postgresql`. Database contains 1 real customer booking (`JH-LAL-2026-000130`). |
| **Root Cause** | **FIXED AND VERIFIED** | **React Unhandled Object Child Exception:** `src/app/admin/dashboard/page.tsx` was rendering `{apt.appointmentDate}` directly into JSX inside recent bookings (line 374) and upcoming bookings (line 474). In Prisma ORM, `appointmentDate` is a native JavaScript `Date` instance. When an appointment exists in the database, React throws `Error: Objects are not valid as a React child (found: [object Date])`, crashing the Server Component. |
| **Resilience & Error Boundary**| **FIXED AND VERIFIED** | Added date normalization helper `formatDashboardDate()`, wrapped analytics retrieval in a crash-proof fallback, sanitized WhatsApp phone parsing, normalized date strings in `getAdminAnalytics()`, and created dedicated admin error boundaries (`src/app/admin/error.tsx` and `src/app/admin/dashboard/error.tsx`). |
| **Vercel Production Deployment**| **NOT VERIFIED / READY FOR APPROVAL**| Fix is compiled and verified locally (`tsc`, `lint`, 306/306 tests, Next.js build). Ready for deployment to Vercel upon developer approval. |

---

## 2. Live Production Investigation Evidence

### 2.1 Domain & Redirect Audit
- **Apex Domain:** `https://thejawedhabibsalons.in/admin/dashboard`
  ```
  HTTP/1.1 308 Permanent Redirect
  Location: https://www.thejawedhabibsalons.in/admin/dashboard
  Server: Vercel
  ```
- **Canonical Domain:** `https://www.thejawedhabibsalons.in/admin/dashboard`
- **Unauthenticated State:**
  ```
  HTTP/1.1 307 Temporary Redirect
  Location: /admin/login?redirect=%2Fadmin%2Fdashboard
  Server: Vercel
  ```

### 2.2 Authenticated Session Inspection
Using authorized administrator credentials (`phone: 7707000463`), `POST https://www.thejawedhabibsalons.in/api/auth/login` returned:
```json
{
  "success": true,
  "message": "Welcome back, Salon Manager (Lalganj)!",
  "data": {
    "user": {
      "id": "cmwfvl42r000qt9uysjx2g38z",
      "name": "Salon Manager (Lalganj)",
      "phone": "7707000463",
      "email": "admin@jawedhabib-lalganj.in",
      "role": "SUPER_ADMIN",
      "customerProfile": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
Session cookie received:
`habib_session_token=...; Path=/; Expires=Sat, 21 Nov 2026; Max-Age=604800; Secure; HttpOnly; SameSite=lax`

### 2.3 Live Route Probe Matrix on Vercel
With the authenticated `habib_session_token` cookie, every administrative route was probed directly against `https://www.thejawedhabibsalons.in`:

| Route Path | Vercel HTTP Status | Payload Size | `id="__next_error__"` |
| :--- | :---: | :---: | :---: |
| `/admin/dashboard` | **500 Internal Server Error** | 53,232 bytes | **TRUE (CRASH)** |
| `/admin/bookings` | **200 OK** | 58,733 bytes | FALSE |
| `/admin/calendar` | **200 OK** | 55,084 bytes | FALSE |
| `/admin/customers` | **200 OK** | 53,342 bytes | FALSE |
| `/admin/services` | **200 OK** | 53,762 bytes | FALSE |
| `/admin/packages` | **200 OK** | 53,882 bytes | FALSE |
| `/admin/staff` | **200 OK** | 49,404 bytes | FALSE |
| `/admin/payments` | **200 OK** | 56,539 bytes | FALSE |
| `/admin/gallery` | **200 OK** | 50,952 bytes | FALSE |
| `/admin/transformations` | **200 OK** | 49,509 bytes | FALSE |
| `/admin/reviews` | **200 OK** | 51,693 bytes | FALSE |
| `/admin/content` | **200 OK** | 56,457 bytes | FALSE |
| `/admin/enquiries` | **200 OK** | 49,537 bytes | FALSE |
| `/admin/settings` | **200 OK** | 60,206 bytes | FALSE |

This proved that database connectivity, JWT authentication, and session cookie validation were 100% functional across all 13 submodules, and the failure was strictly localized to `/admin/dashboard`.

---

## 3. Root Cause Analysis & Reproduction

### 3.1 The Database State
Inspection of the Neon PostgreSQL database revealed 1 authentic appointment record:
```json
{
  "id": "cmwgalkmz0002jlal395h27r8",
  "appointmentNumber": "JH-LAL-2026-000130",
  "customerName": "vikash kumar",
  "customerPhone": "9473263768",
  "status": "COMPLETED",
  "appointmentDate": "2026-11-15T00:00:00.000Z",
  "startTime": "10:00"
}
```
Notice that Prisma returns `appointmentDate` as a native JavaScript `Date` instance:
`typeof apt.appointmentDate === "object"` and `apt.appointmentDate instanceof Date === true`.

### 3.2 The Flaw in `src/app/admin/dashboard/page.tsx`
`AdminDashboardPage` is an asynchronous React Server Component. It queries `dbRepo.getAdminAnalytics()`, which executes:
```ts
prisma.appointment.findMany({
  take: 8,
  orderBy: [{ appointmentDate: "desc" }, { startTime: "desc" }],
  ...
})
```
In the JSX template for recent bookings (line 374):
```tsx
<td className="p-3.5 whitespace-nowrap">
  <span className="font-semibold text-white">{apt.startTime}</span>
  <span className="block text-[11px] text-zinc-500">{apt.appointmentDate}</span> {/* <-- FATAL ERROR */}
</td>
```
And in upcoming visits (line 474):
```tsx
<div className="flex items-center justify-between text-[11px] text-zinc-400">
  <span>{apt.appointmentDate}</span> {/* <-- FATAL ERROR */}
  <span className="font-mono text-zinc-300">₹{apt.totalAmount}</span>
</div>
```

### 3.3 Exact Runtime Exception
When React Server Component rendering or client hydration evaluates a native `Date` object as a child node in JSX, React throws:

```
Error: Objects are not valid as a React child (found: [object Date]). If you meant to render a collection of children, use an array instead.
    at renderNodeDestructiveImpl (react-dom-server-legacy.node.development.js:6194:11)
    at renderNodeDestructive (...)
    at renderNode (...)
    at renderHostElement (...)
```

### 3.4 Why Did It Work When the Database Was Empty?
When there were zero appointments in the database, `analytics.recentBookings` was `[]`. The `.map()` loop was never entered, rendering the empty table message (`No appointment bookings recorded yet.`). 
As soon as the first real appointment (`JH-LAL-2026-000130`) was saved in Neon, the loop executed, encountering `{apt.appointmentDate}`, which immediately crashed React. Because the administrative route lacked a dedicated error boundary, the exception bubbled up to `src/app/error.tsx`, rendering the generic customer concierge error screen.

---

## 4. Exact Repairs & Enhancements Implemented

### 4.1 Safe Date Formatting & Null-Safe KPI Rendering
In `src/app/admin/dashboard/page.tsx`:
1. Introduced `formatDashboardDate(dateVal)` supporting `Date` instances, ISO strings, and fallback string representations formatted in Indian Standard Time (`Asia/Kolkata`).
2. Replaced `{apt.appointmentDate}` with `{formatDashboardDate(apt.appointmentDate)}` in both recent bookings table and upcoming appointments cards.
3. Added null-coalescing on all KPI metrics (`analytics.totalAppointments || 0`, `analytics.confirmedAppointments ?? analytics.confirmedBookings ?? 0`) to prevent `TypeError: Cannot read properties of undefined (reading 'toString')`.
4. Sanitized WhatsApp URL generation: `String(phone).replace(/\D/g, "")`.

### 4.2 Crash-Proof Database Fallback in Server Component
In `src/app/admin/dashboard/page.tsx`:
Wrapped the `dbRepo.getAdminAnalytics()` call in a `try...catch` block. If any database network anomaly or connection pool timeout occurs, the dashboard logs the error via Pino/Winston (`logger.error`) and provides clean default statistics, ensuring that a transient database hiccup **never crashes the dashboard view**.

### 4.3 Database Repository Level Serialization
In `src/lib/db/repo.ts`:
Updated `getAdminAnalytics()` so that all `recentBookings` and `upcomingAppointments` map `appointmentDate` through `getKolkataDateString()` if it is a `Date` instance. This guarantees defense-in-depth across any consumer of the analytics payload.

### 4.4 Dedicated Admin Error Boundaries
Created two isolated, administrative error boundaries:
1. **`src/app/admin/dashboard/error.tsx`**: Catches any runtime errors specific to dashboard analytics and provides an in-theme luxury recovery screen with a "Reload Analytics" button and direct links to Bookings and Payments.
2. **`src/app/admin/error.tsx`**: Catches runtime errors across any administrative submodule, preventing errors from ever bubbling up to the customer-facing concierge error screen.

---

## 5. Verification & Test Results

### 5.1 Server-Side Render Verification
Executed `ReactDOMServer.renderToString()` against `AdminDashboardPage` with the active Neon appointment (`JH-LAL-2026-000130`):
- **Result:** `SUCCESS! Rendered HTML length: 26,858 bytes` (0 errors, 0 exceptions).

### 5.2 Local Server Production Audit Probe
Probed with Next.js production server running on `http://localhost:3000`:
- `POST /api/auth/login`: `200 OK` (89ms)
- `GET /admin/dashboard`: `200 OK` (102ms, 130,879 bytes HTML payload)
- Zero `id="__next_error__"` markers.
- Zero hydration errors.

### 5.3 Quality Gate Checklist

| Command | Objective | Result |
| :--- | :--- | :---: |
| `npm run type-check` | Strict TypeScript verification | **PASSED (0 errors)** |
| `npm run lint` | ESLint static code quality | **PASSED (0 warnings, 0 errors)** |
| `npx prisma validate` | Prisma schema validation | **PASSED (Valid)** |
| `npm test` | Automated Vitest test suite | **PASSED (30/30 files, 306/306 tests)** |
| `npm run build` | Next.js production build | **PASSED (60/60 routes compiled)** |

---

## 6. Files Modified & Added

1. `src/app/admin/dashboard/page.tsx`: Fixed unformatted `apt.appointmentDate`, added crash-proof analytics `try...catch`, added `formatDashboardDate()`, sanitized phone strings.
2. `src/lib/db/repo.ts`: Normalized `appointmentDate` in `getAdminAnalytics()` to date strings.
3. `src/app/admin/reports/page.tsx`: Safeguarded `String(row.appointmentDate)`.
4. `src/app/admin/dashboard/error.tsx`: New dedicated administrative dashboard error boundary.
5. `src/app/admin/error.tsx`: New dedicated administrative portal error boundary.

---

## 7. Production Deployment Instructions

Per the task constraints, no automated deployment has been executed without developer authorization.
To deploy these fixes to live production on Vercel:

1. Commit the repaired files:
   ```bash
   git add src/app/admin/dashboard/page.tsx src/app/admin/dashboard/error.tsx src/app/admin/error.tsx src/lib/db/repo.ts src/app/admin/reports/page.tsx
   git commit -m "fix(admin): resolve Date object child exception on dashboard, add admin error boundaries, and normalize date formatting"
   ```
2. Push to `main` (or active production branch):
   ```bash
   git push origin main
   ```
3. Vercel will automatically trigger a clean production build (`node -r ./scripts/patch-mkdir.js node_modules/next/dist/bin/next build`), deploying the repaired dashboard live to `https://www.thejawedhabibsalons.in/admin/dashboard`.
