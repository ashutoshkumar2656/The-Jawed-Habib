# Deployment Guide: The Jawed Habib Salon – Lalganj

This guide details the step-by-step process for deploying the full-stack digital platform for **The Jawed Habib Salon – Lalganj** to production on **Vercel** with a **Neon PostgreSQL** database and **Cloudinary** media storage.

---

## 1. Prerequisites & Account Setup

Before initiating deployment, ensure you have active accounts with:
1. **GitHub / GitLab**: Hosting the repository.
2. **Vercel**: For hosting Next.js App Router full-stack web application.
3. **Neon Tech (or Supabase / AWS RDS)**: Serverless PostgreSQL database.
4. **Cloudinary**: Cloud media asset storage for gallery images and transformation photos.

---

## 2. Step 1: Provision the PostgreSQL Database (Neon)

1. Sign in to your [Neon Console](https://console.neon.tech/).
2. Create a new project:
   - **Project Name**: `jawed-habib-lalganj`
   - **Postgres Version**: 15 or 16
   - **Region**: Choose `AWS / ap-south-1 (Mumbai)` for minimal latency in Bihar/India.
3. Once the database is provisioned, copy the connection string:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/neondb?sslmode=require"
   ```
4. Run migrations from your local workspace or CI pipeline:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
5. Seed initial data (categories, initial services, admin account, settings):
   ```bash
   npm run prisma:seed
   ```

---

## 3. Step 2: Configure Cloudinary Media Storage

1. Log in to [Cloudinary Dashboard](https://cloudinary.com/console).
2. Note your credentials from the Dashboard:
   - **Cloud Name**: (e.g. `jawed-habib-lalganj`)
   - **API Key**: `...`
   - **API Secret**: `...`
3. Navigate to **Settings > Upload > Upload Presets**:
   - Add new preset: `jawed_habib_lalganj`
   - Signing Mode: `Signed` (or `Unsigned` for direct browser uploads if configured)
   - Folder: `jawed_habib/lalganj`

---

## 4. Step 3: Deploy to Vercel

### Method A: Via Vercel Web Dashboard (Recommended)

1. Connect your GitHub repository to Vercel.
2. Select **Framework Preset**: `Next.js`.
3. Root Directory: `./` (or leave default).
4. Configure Environment Variables in the Vercel Project Settings:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment flag |
| `NEXT_PUBLIC_APP_URL` | `https://thejawedhabib-lalganj.com` | Canonical public domain |
| `DATABASE_URL` | `postgresql://...` | Neon PostgreSQL pooled URL |
| `JWT_SECRET` | `32+_random_character_string` | Secret for customer and admin session tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `PAYMENT_ENCRYPTION_KEY` | `32+_random_character_string` | Master key for AES-256-GCM encryption of payment secrets |
| `ADMIN_DEFAULT_EMAIL` | `admin@jawedhabib-lalganj.com` | Default admin user |
| `ADMIN_DEFAULT_PASSWORD` | `YourSecureAdminPass2026!` | Initial admin seed password |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `jawed-habib-lalganj` | Cloudinary public cloud name |
| `CLOUDINARY_API_KEY` | `your_key` | Cloudinary private key |
| `CLOUDINARY_API_SECRET` | `your_secret` | Cloudinary private secret |
| `CLOUDINARY_UPLOAD_PRESET` | `jawed_habib_lalganj` | Upload preset name |
| `NEXT_PUBLIC_SALON_PHONE_PRIMARY` | `7707000463` | Verified primary phone |
| `NEXT_PUBLIC_SALON_PHONE_SECONDARY` | `9831722983` | Verified secondary phone |
| `NEXT_PUBLIC_SALON_PHONE_TERTIARY` | `9580000175` | Verified tertiary phone |

5. Click **Deploy**. Vercel will run `npm run build` and provision edge CDN endpoints worldwide.

---

## 5. Step 4: Custom Domain Configuration

1. In Vercel Project Settings, navigate to **Domains**.
2. Add your custom domain: `thejawedhabib-lalganj.com` and `www.thejawedhabib-lalganj.com`.
3. In your DNS registrar (GoDaddy, Namecheap, Cloudflare):
   - Set **A Record**: `@` pointing to `76.76.21.21`
   - Set **CNAME Record**: `www` pointing to `cname.vercel-dns.com`
4. Vercel automatically provisions and renews free SSL certificates (Let's Encrypt).

---

## 6. Step 5: Post-Deployment Smoke Test Checklist

Once the production URL is live, perform these smoke tests:
- [ ] Visit `https://thejawedhabib-lalganj.com/` and confirm SSL is active.
- [ ] Confirm hero banner loads and telephone buttons trigger calls to `7707000463`.
- [ ] Test the online booking flow at `/booking` and confirm unique reference is returned.
- [ ] Test customer registration at `/register` and verify 100 loyalty points are credited.
- [ ] Visit `/admin/login`, log in with initial admin credentials, and verify `/admin/dashboard` loads live statistics.
- [ ] Download the CSV reports file from `/admin/analytics` and verify structure.
- [ ] Confirm `/sitemap.xml` and `/robots.txt` resolve with 200 OK.
- [ ] In Admin Panel (`/admin/settings/payment-gateway`), verify Razorpay credentials and test connection.

---

## 7. Step 6: Rollback & Disaster Recovery Strategy

In the event of an unexpected regression or deployment emergency:

### 1. Application Layer Rollback (Vercel Instant Rollback)
1. Open the **Vercel Dashboard → Deployments**.
2. Locate the previous stable production deployment.
3. Click the three dots `...` and select **Promote to Production** (or **Instant Rollback**).
4. Edge CDN redirects 100% of global traffic to the previous deployment within seconds.

### 2. Database Rollback (Neon Point-in-Time Restore)
1. If data corruption or schema mismatch occurs, sign in to the **Neon Console**.
2. Go to **Branches** and create a point-in-time branch timestamped immediately prior to deployment:
   ```bash
   neon branches create --name rollback-pre-deploy --as-of "2026-11-13T12:00:00Z"
   ```
3. Update `DATABASE_URL` in Vercel to point to the restored branch.
4. **Never** execute `prisma migrate reset` on production databases. All production migrations are version-controlled and applied via `npm run prisma:deploy`.
