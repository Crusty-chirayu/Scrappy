# GO-LIVE & ENVIRONMENT CHECKLIST

> Living checklist of environment requirements, production credentials, and deployment procedures.

## Local Development Prerequisites
- **Node.js**: >= 20.0.0 (currently running v24.16.0)
- **pnpm**: >= 9.0.0 (currently running v11.21.0)
- **Docker Desktop**: Required to execute `supabase start` for local Postgres, Auth, Storage, and Inbucket.
  > **Note**: If Docker Desktop is not actively running on the host machine, the codebase runs against configured local/remote database endpoints via `DATABASE_URL` in `.env`.

## Local Emulators & Adapters (Built & Active)
- **Auth**: Supabase Auth (local / mock mode)
- **Storage**: Supabase Storage / local bucket simulation
- **Email**: Mailpit / Supabase Inbucket emulator
- **AI**: Deterministic fallback client in `@scrappy/ai` (runs with 0 credentials)
- **Scraping**: Recorded offline fixtures in `/fixtures` (Amazon, Flipkart, Croma, Reliance)
- **Billing**: Razorpay test-mode adapter interface

## Go-Live Credentials Needed at Launch (Stage C)
| Service | Environment Variable | Where to Obtain |
|---|---|---|
| Supabase Production | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard -> Project Settings -> API |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard -> Settings -> API Keys |
| Gemini AI | `GEMINI_API_KEY` | Google AI Studio |
| Resend / Email | `RESEND_API_KEY` | Resend Dashboard -> API Keys |
| Production App URLs | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL` | Vercel / Railway production deployment domains |
