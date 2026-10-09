# Progress Recorder

A mobile-first work tracker. Check in and out, see how long you have worked, and see how much you must work each day to reach your target on time.

Built with Next.js (App Router), Tailwind CSS, and PostgreSQL on NeonDB. Next.js runs both the frontend and the backend (API routes), so there is only one project to deploy.

The interface uses **only Tailwind CSS**. There is no component or icon library: buttons and inputs are plain Tailwind classes, icons are inline SVG, and popups use the browser's built-in `<dialog>` element. The only extra packages for the UI are two font files (`@fontsource-variable/...`), which are plain CSS.

## Features

- Login with a JWT that expires after 7 days (stored in an httpOnly cookie)
- Today page: live time since check-in, average time to work per day, time to the target day in many units, hours worked, time left, and the Check in / Check out button
- Records page: every day since the start day with check-in time, check-out time and working time. Tap a record to edit or delete it, tap + to add a missing one
- 6 themes (Ink, Paper, Ocean, Forest, Sunset, Rose), saved in the browser
- Target settings (start day, target day, target hours) editable in the app

## Project structure

```
progress-recorder/
├── app/
│   ├── layout.tsx                 Root layout, fonts, theme script
│   ├── globals.css                Theme colors (CSS variables) and animations
│   ├── icon.svg                   Favicon
│   ├── login/page.tsx             Login page
│   ├── (app)/
│   │   ├── layout.tsx             Loads data once, shows bottom navigation
│   │   ├── page.tsx               Today page (timers and check in/out)
│   │   └── records/page.tsx       Records page (list, add, edit, delete)
│   └── api/
│       ├── auth/login/route.ts    POST  check username and password, set cookie
│       ├── auth/logout/route.ts   POST  clear cookie
│       ├── auth/register/route.ts Create account handler (commented out)
│       ├── toggle/route.ts        POST  check in, or check out if already in
│       ├── records/route.ts       GET all records, POST add a record
│       ├── records/[id]/route.ts  PATCH edit, DELETE remove
│       └── settings/route.ts      GET and PUT start day, target day, target hours
├── components/
│   ├── ui/                        button, input, label, dialog (plain Tailwind, native <dialog>)
│   ├── icons.tsx                  Inline SVG icons
│   ├── data-provider.tsx          Fetches records and settings, shares them
│   ├── hms.tsx                    Hour / minute / second display
│   ├── unit-row.tsx               Row of small unit boxes
│   ├── record-dialog.tsx          Add and edit record form
│   ├── settings-dialog.tsx        Target settings form
│   ├── theme-switcher.tsx         Theme picker
│   ├── bottom-nav.tsx             Today / Records tabs
│   └── use-now.ts                 Clock that updates every second
├── lib/
│   ├── auth.ts                    Create and read the JWT
│   ├── db.ts                      Neon connection
│   ├── time.ts                    Time formatting and date maths
│   ├── themes.ts                  Theme list
│   ├── types.ts                   Shared types
│   └── utils.ts                   Small helpers
├── db/schema.sql                  Database tables
├── scripts/setup-db.mjs           Creates tables and the first account
├── middleware.ts                  Blocks every page and API route when not logged in
└── .env.example                   Environment variables to copy
```

## Setup

You need Node.js 20.6 or newer and a free Neon account.

1. **Create the database.** In Neon, create a project and copy the connection string (the pooled one works well).
2. **Install packages.**
   ```bash
   npm install
   ```
3. **Create `.env.local`** from the example and fill it in.
   ```bash
   cp .env.example .env.local
   ```
   | Variable | Meaning |
   | --- | --- |
   | `DATABASE_URL` | Neon connection string |
   | `JWT_SECRET` | Long random text used to sign the login token |
   | `SEED_USERNAME` | Username of the first account (default `me`) |
   | `SEED_PASSWORD` | Password of the first account |

   A quick way to make a secret: `openssl rand -base64 32`
4. **Create the tables and your account.**
   ```bash
   npm run db:setup
   ```
   Running it again is safe. It keeps your data and resets the password of `SEED_USERNAME` to `SEED_PASSWORD`, which is also how you change a password.
5. **Start the app.**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 on your computer, or use your computer's local IP on your phone.
6. **Set your target.** On the Today page tap the settings icon and set the start day, target day and target hours. The first values are placeholders (today, 90 days from today, 100 hours).

## Deploy to Vercel

1. Push the project to GitHub.
2. In Vercel choose **Add New Project** and import the repository. Framework is detected as Next.js.
3. Add the environment variables `DATABASE_URL` and `JWT_SECRET`.
4. Deploy. Run `npm run db:setup` once from your computer first so the tables and account exist in Neon.

On your phone, open the site and use **Add to Home Screen** to open it like an app.

## How the numbers are calculated

- **Time since check-in:** now minus the check-in time of the running record. It shows 00:00:00 when you are not checked in.
- **Worked so far:** sum of all records. A running record counts until now.
- **Left to reach the target:** target hours minus worked time (never below 0).
- **Time to target day:** from now until the end of the target day (midnight after it). The calendar boxes give years, months, weeks and days. The total boxes give days, hours, minutes and seconds.
- **Average to work per day:** time left divided by the number of days left (rounded up, at least 1). Today counts as a day.
- All times use the time zone of the device you are looking at. Records are stored in UTC.

## API

All routes need the login cookie, except login and logout. Without it they answer `401`.

| Route | Method | Body | What it does |
| --- | --- | --- | --- |
| `/api/auth/login` | POST | `username`, `password` | Logs in, sets the cookie |
| `/api/auth/logout` | POST | none | Clears the cookie |
| `/api/toggle` | POST | none | Check in, or check out when a record is running |
| `/api/records` | GET | none | All records, newest first |
| `/api/records` | POST | `check_in`, `check_out` (ISO) | Adds a finished record |
| `/api/records/:id` | PATCH | `check_in`, `check_out` (empty = running) | Edits a record |
| `/api/records/:id` | DELETE | none | Deletes a record |
| `/api/settings` | GET / PUT | `start_date`, `target_date`, `target_hours` | Reads or saves the target |

## Turn on create account

The handler lives in `app/api/auth/register/route.ts` and is commented out. To use it, uncomment the code, redeploy, then send (while logged in):

```bash
curl -X POST https://your-site/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{"username":"new","password":"secret"}'
```

To allow sign-up without login, add `"/api/auth/register"` to `publicPaths` in `middleware.ts`. There is no sign-up page in the UI.

## Add a theme

1. Add a block in `app/globals.css`, copying one of the existing `[data-theme="..."]` blocks and changing the colors (values are HSL numbers).
2. Add `{ id: "yourtheme", name: "Your theme" }` to `lib/themes.ts`.

## Important notes

- **Passwords are stored as plain text**, as requested. Anyone who can read the database can read the passwords, so do not reuse a real password.
- Auth uses a 7 day JWT. After it expires you are sent back to the login page.
- Change `JWT_SECRET` to log everyone out.
- `npm run build` prints a warning from `jose` about `CompressionStream` in the Edge Runtime. It is harmless, that code is not used for login tokens.
- To drop the two font packages too, remove the two `@fontsource-variable` imports in `app/layout.tsx` and the `fontFamily` entries in `tailwind.config.ts`, then uninstall them. The app falls back to system fonts.
