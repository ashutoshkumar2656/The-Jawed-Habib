# Production Deployment Guide: The Jawed Habib Salon – Lalganj

> **Document Location**: Full documentation available at [docs/DEPLOYMENT_GUIDE.md](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/docs/DEPLOYMENT_GUIDE.md)

---

## 1. Quick Deployment Steps (Vercel + Neon)

1. **Database Migration**:
   ```bash
   npm run prisma:deploy
   ```
2. **Configure Environment Variables in Vercel**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PAYMENT_ENCRYPTION_KEY`
   - `NEXT_PUBLIC_APP_URL="https://thejawedhabibsalons.in"`
3. **Trigger Deployment**:
   - Push to `main` branch or trigger deployment in Vercel dashboard.
4. **Post-Deployment Verification**:
   - Visit `https://thejawedhabibsalons.in/` and confirm SSL is active.
   - Test booking flow at `/booking`.
   - Log in to `/admin/login` and verify `/admin/settings/payment-gateway`.

---

## 2. Rollback Plan

- **Vercel Instant Rollback**: In Vercel Deployments dashboard, select previous deployment and click **Instant Rollback**.
- **Neon PITR Recovery**: Restore database to exact point in time via Neon copy-on-write branching:
  `neon branches create --name rollback-pre-deploy --as-of "<ISO-TIMESTAMP>"`
