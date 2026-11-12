# Codebase Archive Registry
## The Jawed Habib Salon – Lalganj

This directory contains preserved, historical, or deprecated code assets moved out of the active compilation path to prevent confusion, unwanted bundles, or conflicting implementations, while preserving full historical reference.

### Archived Assets

1. **`components/appointment-booking-section.tsx`**
   - **Reason for Archival:** Replaced by `BridalBookingExperience` (`src/components/public/bridal-booking-experience.tsx`).
   - **Context:** Contained the legacy squashed two-column booking layout with mixed-in general salon services (standard haircuts, beard grooming, etc.) hardcoded in `BOOKING_SERVICES`.
   - **Superseded By:** The spacious, sequential bridal reservation experience benchmarked against `jawedhabibkurji.com`.

2. **`lib/rate-limiter.ts`**
   - **Reason for Archival:** Duplicate implementation of `src/lib/security/rate-limit.ts`.
   - **Context:** Contained an unimported alternative sliding window rate limiter. The active, test-covered rate limiter is located at `src/lib/security/rate-limit.ts`.
