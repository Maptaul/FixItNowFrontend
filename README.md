# FixItNow 🔧 — Frontend

**Your trusted home service platform.** A Next.js client for a home-services
marketplace: customers book vetted technicians into real time slots, pay
through Stripe, track the job to completion and leave a review. Technicians
manage their trade profile, services, availability and jobs. Admins moderate
users and categories.

Frontend only — it consumes the [FixItNow API](https://fixitbackend.vercel.app).

---

## 🔑 Admin credentials

```
Email    : admin@fixitnow.com
Password : admin123
```

Customer and technician accounts can be created from `/auth/register`.

---

## 🛠️ Tech stack

| Tech                       | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| Next.js 16 (App Router)    | routing, Server Components, Server Actions             |
| TypeScript (strict)        | type safety                                            |
| Tailwind CSS 4 + shadcn/ui | design system, dark mode                               |
| Zod                        | schema validation, shared by client and server actions |
| sonner                     | toast notifications                                    |
| jsonwebtoken               | decoding the session cookie in `proxy.ts`              |
| Stripe Checkout            | payments (hosted redirect)                             |

**Package manager: pnpm.**

---

## 🚀 Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Runs on `http://localhost:3000`.

### Environment

| Variable              | Required | Notes                                                                                                                                       |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | yes      | `https://fixitbackend.vercel.app`, or `http://localhost:5000` against a local API                                                           |
| `JWT_ACCESS_SECRET`   | no       | same value as the backend. When set, `proxy.ts` verifies the cookie's signature instead of merely decoding it. The API verifies regardless. |

### Scripts

| Script       | Does             |
| ------------ | ---------------- |
| `pnpm dev`   | dev server       |
| `pnpm build` | production build |
| `pnpm start` | serve the build  |
| `pnpm lint`  | eslint           |

---

## ✨ Features

### Public

- Responsive service and technician grids with `next/image`, ratings and
  starting prices
- Filter by category, location, price range, minimum rating and keyword —
  all held in the URL, so results are shareable and server-rendered
- Technician profiles with bio, services, reviews and a live availability
  picker
- Skeleton loaders while sections stream in; graceful 404 and error pages
- **How it works** — the booking lifecycle explained with the same status
  badges the dashboards use
- **Pricing** — entry prices per category, read live from the services API,
  plus what the platform does and doesn't charge for

### Customer

- Register / log in with inline validation
- Book a service into a published slot — taken slots stay visible but
  disabled — or propose your own date and time
- Pay through Stripe Checkout once the technician accepts
- Track bookings with status badges, cancel before work starts, review after
  completion
- Payment history with transaction references
- Help centre with FAQs and routing into the right screen for each problem

### Technician

- Dashboard with pending requests, jobs in flight, earnings and rating
- Trade profile: bio, experience, hourly rate, service area
- Service CRUD
- Availability scheduler — add and remove working blocks, with already-booked
  slots locked
- Accept / decline requests, then start and complete jobs
- Earnings ledger with paid / pending split and a month-by-month breakdown
- Analytics: jobs per week, revenue by service, busiest hours and status mix,
  all derived from the job history the API already returns
- Reviews inbox with a rating histogram

### Admin

- Platform overview: users, technicians, bookings, revenue, categories
- User directory with search, role filter, pagination and ban/unban
- Service category management
- Read-only view of every booking on the platform
- Every payment on the platform, filterable by status, with revenue totals

### Throughout

- Role-based UI — each role gets its own sidebar and dashboard, not one menu
  with items hidden
- **⌘K search** across everything the signed-in role may read — its own
  bookings, plus every service and technician; admins also get users
- Route protection in `proxy.ts` (Next 16's middleware)
- Dark mode
- Every failure shows something: inline field errors, toasts, empty states,
  error boundaries

---

## 📁 Structure

```
app/
  (publicGroup)/       home, /services, /technicians, /technicians/[id],
                       /how-it-works, /pricing
    _actions/          server-side reads
    _components/       group-local components
  (authGroup)/         /auth/login, /auth/register
  (dashboardGroup)/    everything behind a session
    _actions/          one module per backend domain
    _components/       shared dashboard components
    _config/           sidebar menus per role
    dashboard/{customer,technician,admin}/
    payment/{success,cancel}/
  error.tsx  not-found.tsx  loading.tsx  layout.tsx  globals.css
components/
  ui/                  shadcn primitives
  shared/              navbar, footer, form, badges, rating, empty state
  design/              handoff-specific pieces: charts, stepper, timeline,
                       data table, month grid, rating histogram
lib/                   api client, types, constants, formatters, zod schemas,
                       analytics (all derived client-side), booking timeline
service/               getMe, logout
utils/                 jwt helpers
proxy.ts               route protection
```

Route groups `(name)` don't appear in URLs. `_actions`, `_components` and
`_config` are private folders Next never routes to.

---

## 🔌 API integration

Every backend endpoint is consumed — nothing is mocked. The full
component ↔ endpoint mapping is in **[API_INTEGRATION.md](API_INTEGRATION.md)**.

Two things worth knowing up front:

1. **All API calls run on the server** and go through `apiFetch` in
   `lib/api.ts`. The JWT lives in an httpOnly cookie, so nothing touches it
   from the browser.
2. **Prisma `Decimal` fields arrive as strings.** They're typed as `string`
   and formatted through `lib/format.ts`.

---

## 💳 Payments

Stripe Checkout, hosted redirect flow:

1. Technician accepts a booking → status `ACCEPTED`
2. Customer opens `/dashboard/customer/bookings/[id]/pay`
3. `POST /api/payments/create` returns a `checkoutUrl`; the customer is
   redirected to Stripe
4. Success → `/payment/success?session_id=…`, which calls
   `POST /api/payments/confirm` and flips the booking to `PAID`
5. Cancel → `/payment/cancel`, nothing charged, booking still `ACCEPTED`

Test card `4242 4242 4242 4242`, any future expiry, any CVC.

> **Deploying?** Stripe's return URLs are built from the **backend's**
> `APP_URL`. Set it to the deployed frontend origin (it also drives the API's
> CORS allow-list), otherwise checkout returns users to the wrong host.

---

## 📊 Booking lifecycle

```
REQUESTED ──accept──> ACCEPTED ──pay──> PAID ──start──> IN_PROGRESS ──complete──> COMPLETED
    │                                                                                  │
    └──decline──> DECLINED     cancel (customer, before work starts) ──> CANCELLED      └──> review
```

| Status        | Badge    | Who acts next                  |
| ------------- | -------- | ------------------------------ |
| `REQUESTED`   | amber    | technician accepts or declines |
| `ACCEPTED`    | blue     | customer pays                  |
| `DECLINED`    | red      | —                              |
| `PAID`        | purple   | technician starts the job      |
| `IN_PROGRESS` | green    | technician completes it        |
| `COMPLETED`   | grey     | customer reviews               |
| `CANCELLED`   | dark red | —                              |

These rules are mirrored in `lib/constants.ts` so the UI only ever offers an
action the API will accept. The API re-checks every one.

---

## ✅ Verification

No test runner. The gate is:

```bash
npx tsc --noEmit && pnpm lint && pnpm build
```

plus a manual click-through as each role.

---

## 📦 Submission

```text
Frontend Repo    : https://github.com/Maptaul/FixItNowFrontend
Live Frontend    : https://fixit-now-frontend.vercel.app
Backend API      : https://fixitbackend.vercel.app
Demo Video       : https://www.loom.com/share/2b4d1586f1ea40268b5d61f872b68004
Admin Email      : admin@fixitnow.com
Admin Password   : admin123
```
