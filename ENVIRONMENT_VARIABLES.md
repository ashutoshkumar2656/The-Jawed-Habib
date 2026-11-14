# Environment Variables Reference: The Jawed Habib Salon – Lalganj

> **Document Location**: Full documentation available at [docs/ENVIRONMENT_VARIABLES.md](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/docs/ENVIRONMENT_VARIABLES.md)

---

## Required Server-Side Environment Variables (Vercel)

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` in deployment |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://thejawedhabibsalons.in` |
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection pooling URL (`?sslmode=require`) |
| `DIRECT_URL` | Optional | Direct unpooled database connection string for Prisma migrations |
| `JWT_SECRET` | **Yes** | 32+ character random string for signing JWT tokens |
| `PAYMENT_ENCRYPTION_KEY` | **Yes** | 32+ character random string for AES-256-GCM encryption of payment credentials |
| `RAZORPAY_KEY_ID` | Optional | Fallback Test Key ID (managed via Admin Panel) |
| `RAZORPAY_KEY_SECRET` | Optional | Fallback Test Key Secret (managed via Admin Panel) |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Fallback Webhook Secret (managed via Admin Panel) |

> [!WARNING]
> Never prefix database connection strings, JWT secrets, or payment encryption keys with `NEXT_PUBLIC_`.
