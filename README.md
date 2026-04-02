# Floral Sports

Floral Sports is a mobile-first private sports club PWA for the Floral Gang.

## Recommended architecture

- **Frontend:** React + Vite
- **Routing:** `HashRouter` so GitHub Pages does not need server-side rewrites
- **Hosting:** GitHub Pages
- **Backend/Auth/DB:** Supabase
- **Offline:** custom service worker that caches the app shell and previously loaded requests
- **Installability:** `manifest.json` + service worker + home-screen friendly shell

## Why this setup

- Vite is fast and lightweight for a static GitHub Pages deployment.
- `HashRouter` avoids broken refreshes on nested routes in GitHub Pages.
- Supabase gives you email/password auth, Postgres, row-level security, and storage without needing your own server.
- React makes the avatar-rich, stateful event and RSVP UI much easier to manage than plain JS.

## Folder structure

```text
floral-sports/
├─ public/
│  ├─ icons/
│  ├─ manifest.json
│  └─ sw.js
├─ src/
│  ├─ components/
│  ├─ contexts/
│  ├─ hooks/
│  ├─ lib/
│  ├─ pages/
│  ├─ styles/
│  ├─ utils/
│  ├─ App.jsx
│  └─ main.jsx
├─ supabase/
│  └─ schema.sql
├─ .env.example
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md
```

## Setup steps

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. In Supabase Auth, enable email/password.
4. Copy `.env.example` to `.env` and fill in your Supabase URL and anon key.
5. Install dependencies:

```bash
npm install
```

6. Run locally:

```bash
npm run dev
```

## GitHub Pages deployment steps

1. Create a GitHub repo named `floral-sports`.
2. Push this project to the repo.
3. Run:

```bash
npm run build
```

4. Deploy the `dist` folder to GitHub Pages. Easiest options:
   - use a GitHub Action that builds and publishes `dist`
   - or use a `gh-pages` branch workflow
5. In GitHub repo settings, set Pages to deploy from the GitHub Actions workflow or the published branch.

## Important GitHub Pages note

This app uses `HashRouter`, so routes look like:

```text
/#/
/#/schedule
/#/create
```

That is intentional and avoids 404 issues on refresh in GitHub Pages.

## Environment variables

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

These are safe for client-side use because they are the **public anon credentials**. Security comes from Supabase Row Level Security, not from hiding the anon key.

## Database design

### profiles
Stores member identity and avatar-first UI data.

### events
Stores one-time events and concrete generated instances for recurring series.

### event_series
Stores the recurrence rule source-of-truth for a recurring run.

### event_rsvps
Stores each member's response per event.

### event_comments
Stores lightweight event chat/thread notes.

## Recurrence approach used here

Version 1 uses a **rolling concrete event model**:

- save the recurrence rule in `event_series`
- immediately generate concrete future rows in `events`
- attach RSVPs/comments to actual event rows

Why this is practical:
- simple querying
- simple counts
- simple RSVP logic
- easy UI rendering
- works with a static frontend and no cron backend

Recommended v2 upgrade:
- create a Supabase Edge Function or scheduled job that keeps each recurring series expanded 60–120 days into the future
- support “edit this event only” vs “edit this and future events”

## Core feature coverage in this starter

Included now:
- auth
- profile creation
- dashboard
- schedule filters
- create event
- one-time events
- recurring events expanded into concrete rows
- quick RSVP from cards
- fullscreen event modal
- Quiplash-style grouped avatar attendance board
- members page
- stats page
- comments/thread
- PWA shell
- offline caching for visited content/assets

Planned later:
- push notifications
- SMS reminders
- invite codes / approval flow
- admin role UI
- weather API integration
- best-time poll
- richer calendar week view
- storage uploads for custom avatars

## Notes for future upgrades

### Notifications
- use Supabase Edge Functions + cron to send reminder emails
- for browser push, add a push provider and store push subscriptions per user

### SMS reminders
- Twilio or MessageBird via Supabase Edge Functions
- add `phone_number` verification before sending messages

### Admin controls
- add a `role` column to `profiles`
- allow only admins to edit sports list, delete events, regenerate recurring series, and approve signups

### Invite-only mode
- add `invite_codes` table
- require a valid code on signup
- or add an `approved` boolean on `profiles`

### Custom avatar uploads
- store files in Supabase Storage
- keep `avatar_icon` as the default fallback when no uploaded image exists
