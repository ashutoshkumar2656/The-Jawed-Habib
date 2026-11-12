# Environment Variables Reference: The Jawed Habib Salon – Lalganj

This document defines all environment variables used by the application, their security implications, required formats, and configuration guidelines for development and production deployments.

---

## 1. Environment Variables Matrix

| Variable Name | Required | Default / Example | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | `development` / `production` | Node.js execution runtime mode. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://thejawedhabib-lalganj.com` | Public canonical base URL for metadata, sitemaps, and redirects. |
| `DATABASE_URL` | **Yes** | `postgresql://...` | Connection pooling PostgreSQL connection URL (e.g., Neon Tech). |
| `DIRECT_URL` | Optional | `postgresql://...` | Direct unpooled database connection string for Prisma migrations. |
| `JWT_SECRET` | **Yes** | `[32+ character random string]` | Private key for signing customer and administrator JWT session cookies. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token expiration lifespan (default 7 days). |
| `ADMIN_DEFAULT_EMAIL`| Optional | `admin@jawedhabib-lalganj.in` | Default seed email for super admin account. |
| `ADMIN_DEFAULT_PASSWORD`| Optional | `[SecurePassword123!]` | Default seed password for super admin account. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional | `jawed-habib-lalganj` | Cloudinary public cloud name for client-side image transformations. |
| `CLOUDINARY_API_KEY` | Optional | `[Numeric API Key]` | Private Cloudinary API key for server-side image uploads. |
| `CLOUDINARY_API_SECRET`| Optional | `[Private Secret String]` | Private Cloudinary API secret. |
| `CLOUDINARY_UPLOAD_PRESET`| Optional | `jawed_habib_lalganj` | Upload preset name defined in Cloudinary dashboard. |
| `NEXT_PUBLIC_SALON_NAME` | Optional | `The Jawed Habib Salon` | Verified brand name string. |
| `NEXT_PUBLIC_SALON_PHONE_PRIMARY` | Optional | `7707000463` | Verified primary contact desk telephone. |
| `NEXT_PUBLIC_SALON_PHONE_SECONDARY` | Optional | `9831722983` | Verified secondary contact telephone. |
| `NEXT_PUBLIC_SALON_PHONE_TERTIARY` | Optional | `9580000175` | Verified tertiary contact telephone. |
| `NEXT_PUBLIC_SALON_WHATSAPP` | Optional | `917707000463` | WhatsApp concierge contact number. |
| `NEXT_PUBLIC_SALON_INSTAGRAM` | Optional | `https://www.instagram.com/the_jawedhabib_lalganj/` | Official verified Instagram profile URL. |
| `NEXT_PUBLIC_SALON_MAPS_URL` | Optional | `https://maps.app.goo.gl/TVx48xoWEu8dMvXT9` | Verified Google Maps listing URL. |
| `DEMO_MODE` | Optional | `false` | When set to `true`, enables seamless demonstration mode for local development. |

---

## 2. Security Best Practices

1. **Client vs Server Secrets**:
   - Variables prefixed with `NEXT_PUBLIC_` are bundled into the client-side JavaScript. Only non-sensitive, public values (salon phone numbers, Instagram URL, canonical site URL) should use this prefix.
   - Private keys (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_API_SECRET`) **must never** have the `NEXT_PUBLIC_` prefix.
2. **Generating a Secure `JWT_SECRET`**:
   Execute the following command in terminal to generate a cryptographically strong 256-bit key:
   ```bash
   openssl rand -base64 32
   ```
3. **Never Commit Secrets to Version Control**:
   - The `.env` and `.env.local` files are included in `.gitignore` to prevent accidental commits.
   - Use `.env.example` as a template for other developers and deployment pipelines.
