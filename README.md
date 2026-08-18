# ACIDA Sesiones

A personal scheduling tool in the style of Calendly: define session types, set your
weekly availability, connect Google Calendar, and share a booking link so clients can
pick an open time slot. Built with Next.js (App Router), Supabase (Postgres + Auth),
and the Google Calendar API. Single-admin by design — there's one account (you)
managing event types and availability; clients book through a public page with no
login required.

## Feature scope (v1)

- Event types with custom name, duration, location (Google Meet / in person / phone / custom), buffers, minimum notice, and booking horizon.
- Weekly working-hours schedule with per-day time ranges and timezone.
- Google Calendar connect (OAuth): busy time on your primary calendar blocks slots, and confirmed bookings are created as calendar events with the client invited (Google emails them the invite + reminders automatically).
- Public booking page per event type (`/{username}/{slug}`) with a calendar + time-slot picker.
- Admin dashboard: event type list (scheduling/page.tsx), availability editor, upcoming bookings with cancel.
- Invitee-facing cancel link.

Not included in v1 (Calendly features intentionally left out — ask if you want any of these next): team/round-robin scheduling, routing forms, meeting polls, payments, workflows/automations, embeds, SSO, a Contacts CRM view.

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` from this repo — it creates all tables with RLS enabled (no policies; all access goes through the service-role key from server-side code only).
3. Under Authentication → Users, create your one admin user (email + password, or invite yourself). This is the account you'll log in with.
4. Copy your Project URL, `anon` public key, and `service_role` secret key from Project Settings → API into your `.env.local` (see `.env.example`).

The first time you log in, the app auto-creates your `profiles` row and a default weekly schedule — no manual insert needed.

## 2. Google Calendar OAuth setup

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project (or reuse one) and enable the **Google Calendar API**.
2. Configure the OAuth consent screen (External is fine for personal use — add yourself as a test user, or publish it).
3. Create an OAuth Client ID (Web application). Add an authorized redirect URI matching `GOOGLE_REDIRECT_URI` exactly, e.g.:
   - `http://localhost:3000/api/google/callback` for local dev
   - `https://your-domain.com/api/google/callback` in production
4. Copy the Client ID and Client Secret into `.env.local`.
5. Once the app is running, log in and go to **Manage availability** → **Connect Google Calendar**.

## 3. Local development

```bash
cp .env.example .env.local   # fill in the values from steps 1-2
npm install
npm run dev
```

Visit `http://localhost:3000`, log in with your Supabase admin user, create an event type, turn it on, set your weekly hours, and connect Google Calendar. Then open `/{your-username}/{event-slug}` to test the booking flow end to end.

## 4. Deploying (Netlify)

1. Push this repo to GitHub and create a new Netlify site from it (Next.js is auto-detected via `@netlify/plugin-nextjs`).
2. Add all variables from `.env.example` in Site settings → Environment variables, with `NEXT_PUBLIC_APP_URL` and `GOOGLE_REDIRECT_URI` set to your live domain.
3. Update the authorized redirect URI on the Google OAuth client to match the live `GOOGLE_REDIRECT_URI`.
4. Deploy.

## Architecture notes

- **Auth model**: Supabase Auth session cookie gates `/scheduling`, `/availability`, `/calendar` (see `src/middleware.ts` and `src/app/(admin)/layout.tsx`). All database reads/writes go through the `service_role` key server-side (`src/lib/supabase/admin.ts`) — RLS is enabled with zero policies as a fail-closed default, so the anon key alone can never read/write table data.
- **Availability engine** (`src/lib/availability.ts`): given weekly rules, date overrides, buffers, minimum notice, and busy intervals (existing bookings + Google freebusy), computes open slots in 15-minute steps.
- **Booking flow**: `POST /api/bookings` re-validates the requested slot is still open server-side before creating the Google Calendar event and the `bookings` row, to guard against race conditions or a stale client.
