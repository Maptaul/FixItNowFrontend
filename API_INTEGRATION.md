# API Integration

How this frontend consumes the FixItNow REST API.

- **Base URL:** `https://fixitbackend.vercel.app` (override with
  `NEXT_PUBLIC_API_URL`)
- **Backend source:** `Assignment-4/FixItNow-backend`
- **Every** endpoint the API exposes is consumed. Nothing is mocked.

---

## How requests are made

All API traffic goes through one function — `apiFetch<T>()` in
[`lib/api.ts`](lib/api.ts):

```
Server Component / Server Action
        │
        ▼
   apiFetch(path, { method, body, auth, next })
        │   attaches Authorization: Bearer <token> from the httpOnly cookie
        ▼
   { success, statusCode, message, data, meta? }   ← always this shape
```

Two deliberate consequences:

1. **Nothing calls the API from the browser.** The JWT lives in an httpOnly
   cookie the client can't read, and the backend's CORS allow-list is a
   single origin — server-to-server requests avoid both problems.
2. **`apiFetch` never throws on an HTTP error.** It resolves to the backend's
   envelope with `success: false`, so every caller handles failure the same
   way. Network-level failures are synthesised into the same shape.

### Error handling

| Backend response | What the user sees |
|---|---|
| `{ success: false, errorDetails: { issues: [...] } }` | inline message under the offending input, via `toFieldErrors()` → `<Field error>` |
| `{ success: false, message }` (no issues) | `<FormAlert>` banner **and** a `sonner` toast |
| Network failure / API unreachable | toast: *"Could not reach the FixItNow server…"* |
| Unhandled render error | `app/error.tsx` — 500 page with the mono error reference |
| Missing record | `notFound()` → `app/not-found.tsx` |
| Partial failure across a bulk action | toast naming the split: *"3 of 5 could not be updated"* |

### Caching

- **Public reads** (`auth: false`) opt into the data cache with
  `next: { revalidate, tags }`.
- **Authenticated reads** default to `no-store`. Per-user data must never
  enter a shared cache.
- After a mutation, only *public* tags are refreshed with `updateTag()`; a
  Server Action already re-renders the current route for everything else.

---

## Endpoint map

### Auth

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `POST /api/auth/register` | `registerAction` — [`(authGroup)/_actions/authActions.ts`](<app/(authGroup)/_actions/authActions.ts>) | `RegisterForm` → `/auth/register` |
| `POST /api/auth/login` | `loginAction` — same file | `LoginForm` → `/auth/login` |
| `GET /api/auth/me` | `getMe` — [`service/getMe.ts`](service/getMe.ts) | `Navbar`, dashboard layout, every role-aware page |
| `PUT /api/auth/my-profile` | `updateAccount` — [`(dashboardGroup)/_actions/accountActions.ts`](<app/(dashboardGroup)/_actions/accountActions.ts>) | `AccountForm` → all three `/profile` pages |

Login stores `accessToken` in an httpOnly cookie; `logout` deletes it.
Route protection reads it in [`proxy.ts`](proxy.ts).

### Public browsing

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `GET /api/categories` | `getCategories` — [`getCategories.ts`](<app/(publicGroup)/_actions/getCategories.ts>) | filter panel on `/services` + `/technicians`, `ServiceFormDialog` |
| `GET /api/categories` + `GET /api/services` | `getCategoryStats` — [`getCategoryStats.ts`](<app/(publicGroup)/_actions/getCategoryStats.ts>) | `CategoryGrid` on the home page |
| `GET /api/services` | `getServices` — [`getServices.ts`](<app/(publicGroup)/_actions/getServices.ts>) | `FeaturedServices` (`/`), `/services` |
| `GET /api/technicians` | `getTechnicians` — [`getTechnicians.ts`](<app/(publicGroup)/_actions/getTechnicians.ts>) | `HeroSpotlight` + `TopTechnicians` (`/`), `/technicians` |
| `GET /api/technicians/:id` | `getTechnicianById` — same file | `/technicians/[id]`, `/book/[technicianId]`, `/dashboard/technician/services`, `/dashboard/technician/profile` |

Filters passed straight through: services take `categoryId, location,
minPrice, maxPrice, minRating, search, page, limit`; technicians take
`location, minRating, categoryId, page, limit`. All of them live in the URL
query string, so results are shareable and server-rendered.

> `GET /api/technicians/:id` returns `services`, `reviews` **and** upcoming
> `slots`. The slots feed the month grid and slot grid in the booking wizard,
> and the "earliest slots" preview on the technician rail.

### Customer — bookings

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `POST /api/bookings` | `createBooking` — [`createBooking.ts`](<app/(publicGroup)/_actions/createBooking.ts>) | `BookingWizard` on `/book/[technicianId]` |
| `GET /api/bookings` | `getMyBookings` — [`bookingActions.ts`](<app/(dashboardGroup)/_actions/bookingActions.ts>) | `/dashboard/customer`, `/dashboard/customer/bookings`, `/dashboard/customer/reviews` |
| `GET /api/bookings/:id` | `getBookingById` — same file | `/dashboard/customer/bookings/[id]`, `…/[id]/pay` |
| `PATCH /api/bookings/:id/cancel` | `cancelBooking` — same file | `CustomerBookingActions` |

### Customer — payments (Stripe)

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `POST /api/payments/create` | `startCheckout` — [`paymentActions.ts`](<app/(dashboardGroup)/_actions/paymentActions.ts>) | `StripeCheckoutButton` → redirects to Stripe Checkout |
| `POST /api/payments/confirm` | `confirmPayment` — same file | `/payment/success` |
| `GET /api/payments` | `getMyPayments` — same file | `/dashboard/customer/payments`, customer overview, and `/dashboard/admin/payments` — the same endpoint returns **every** payment when the caller is an admin |

### Customer — reviews

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `POST /api/reviews` | `createReview` — [`reviewActions.ts`](<app/(dashboardGroup)/_actions/reviewActions.ts>) | `ReviewComposer` on `/dashboard/customer/reviews`, `ReviewDialog` in the bookings table |

Posted reviews are read back off `booking.review` on `GET /api/bookings` —
there is no "my reviews" endpoint.

### Technician

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `PUT /api/technician/profile` | `updateTechnicianProfile` — [`technicianActions.ts`](<app/(dashboardGroup)/_actions/technicianActions.ts>) | `TechnicianProfileForm` |
| `GET /api/technician/availability` | `getMyAvailability` — same file | `/dashboard/technician/availability`, `/dashboard/technician/profile` |
| `PUT /api/technician/availability` | `setAvailability` — same file | `AvailabilityScheduler` |
| `POST /api/technician/services` | `createService` — [`serviceActions.ts`](<app/(dashboardGroup)/_actions/serviceActions.ts>) | `ServiceFormDialog` |
| `PUT /api/technician/services/:id` | `updateService` — same file | `ServiceFormDialog` (edit mode) |
| `DELETE /api/technician/services/:id` | `deleteService` — same file | `DeleteServiceDialog` |
| `GET /api/technician/bookings` | `getTechnicianBookings` — [`bookingActions.ts`](<app/(dashboardGroup)/_actions/bookingActions.ts>) | `/dashboard/technician`, `/dashboard/technician/bookings` |
| `PATCH /api/technician/bookings/:id` | `updateBookingStatus` — same file | `TechnicianBookingActions` |

> There is no "list my services" endpoint. A technician's own services are
> read from `GET /api/technicians/:id` using `user.technicianProfile.id`.

### Admin

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `GET /api/admin/users` | `getAllUsers` — [`adminActions.ts`](<app/(dashboardGroup)/_actions/adminActions.ts>) | `/dashboard/admin`, `/dashboard/admin/users` |
| `PATCH /api/admin/users/:id` | `updateUserStatus` — same file | `UsersTable` — single row **and** the bulk-action bar |
| `GET /api/admin/bookings` | `getAllBookings` — same file | `/dashboard/admin`, `/dashboard/admin/bookings`, `getAdminCategoryStats` |
| `GET /api/admin/categories` | `getAdminCategories` — same file | `/dashboard/admin` (count), `getAdminCategoryStats` |
| `POST /api/admin/categories` | `createCategory` — same file | `CategoryManager` |
| `PUT /api/admin/categories/:id` | `updateCategory` — same file | `CategoryManager` |
| `DELETE /api/admin/categories/:id` | `deleteCategory` — same file | `CategoryManager` |

The bulk bar has no bulk endpoint behind it: it fans `PATCH
/api/admin/users/:id` across the selection and reports the split if some
fail, rather than pretending the whole batch succeeded.

### Dashboard search (⌘K)

There is no global search endpoint. `dashboardSearch` —
[`searchActions.ts`](<app/(dashboardGroup)/_actions/searchActions.ts>) — fans
out across the resources the signed-in role may already read and merges the
results, so the palette can never surface data the role couldn't reach on its
own dashboard.

| Role | Searches |
|---|---|
| everyone | `GET /api/services?search=` (the API filters server-side), `GET /api/technicians` |
| customer | `GET /api/bookings` |
| technician | `GET /api/technician/bookings` |
| admin | `GET /api/admin/bookings`, `GET /api/admin/users` |

Results are ordered Bookings → Services → Technicians → Users. Each query
carries a sequence number and only the newest one may write results — without
it a slow earlier query lands after a faster later one and overwrites it.

---

## Route → endpoint summary

All 33 routes, checked against `app/**/page.tsx`.

| Route | Endpoints |
|---|---|
| `/` | `GET /api/services`, `GET /api/technicians`, `GET /api/categories` |
| `/services` | `GET /api/services`, `GET /api/categories` |
| `/technicians` | `GET /api/technicians`, `GET /api/categories` |
| `/how-it-works` | — (static: the lifecycle explained with the real status badges) |
| `/pricing` | `GET /api/services`, `GET /api/categories` (live entry prices per category) |
| `/technicians/[id]` | `GET /api/technicians/:id`, `GET /api/auth/me` |
| `/book/[technicianId]` | `GET /api/technicians/:id`, `GET /api/auth/me`, `POST /api/bookings` |
| `/auth/register` | `POST /api/auth/register` |
| `/auth/login` | `POST /api/auth/login` |
| `/dashboard/customer` | `GET /api/bookings`, `GET /api/payments` |
| `/dashboard/customer/bookings` | `GET /api/bookings`, `PATCH /api/bookings/:id/cancel`, `POST /api/reviews` |
| `/dashboard/customer/bookings/[id]` | `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel`, `POST /api/reviews` |
| `/dashboard/customer/bookings/[id]/pay` | `GET /api/bookings/:id`, `POST /api/payments/create` |
| `/dashboard/customer/payments` | `GET /api/payments` |
| `/dashboard/customer/reviews` | `GET /api/bookings`, `POST /api/reviews` |
| `/dashboard/customer/profile` | `GET /api/auth/me`, `PUT /api/auth/my-profile` |
| `/dashboard/customer/support` | — (static help centre: routing cards + FAQ) |
| `/payment/success` | `POST /api/payments/confirm` |
| `/payment/cancel` | — (static outcome page) |
| `/dashboard/technician` | `GET /api/auth/me`, `GET /api/technician/bookings` |
| `/dashboard/technician/bookings` | `GET /api/technician/bookings`, `PATCH /api/technician/bookings/:id` |
| `/dashboard/technician/services` | `GET /api/technicians/:id`, `GET /api/categories`, `POST`/`PUT`/`DELETE /api/technician/services` |
| `/dashboard/technician/availability` | `GET`/`PUT /api/technician/availability` |
| `/dashboard/technician/earnings` | `GET /api/technician/bookings` |
| `/dashboard/technician/analytics` | `GET /api/technician/bookings` |
| `/dashboard/technician/reviews` | `GET /api/auth/me`, `GET /api/technicians/:id` |
| `/dashboard/technician/profile` | `GET /api/auth/me`, `GET /api/technicians/:id`, `GET /api/technician/availability`, `PUT /api/technician/profile`, `PUT /api/auth/my-profile` |
| `/dashboard/admin` | `GET /api/admin/users`, `GET /api/admin/bookings`, `GET /api/admin/categories` |
| `/dashboard/admin/users` | `GET /api/admin/users`, `PATCH /api/admin/users/:id` |
| `/dashboard/admin/bookings` | `GET /api/admin/bookings` |
| `/dashboard/admin/categories` | `GET /api/admin/categories`, `GET /api/services`, `GET /api/admin/bookings`, `POST`/`PUT`/`DELETE /api/admin/categories` |
| `/dashboard/admin/payments` | `GET /api/payments` (returns every payment for an admin) |
| `/dashboard/admin/profile` | `GET /api/auth/me`, `PUT /api/auth/my-profile` |

---

## Derived data

The design handoff asks for numbers the API doesn't store. Rather than fake
them, each is computed from data the API *does* return. Anything on this list
is derived — treat it as a view, not a source of truth.

| Shown as | Derived from | Where |
|---|---|---|
| Category technician count, service count, "from" price | `GET /api/services` grouped by `categoryId` | [`getCategoryStats.ts`](<app/(publicGroup)/_actions/getCategoryStats.ts>) |
| Category booking volume | `GET /api/admin/bookings` joined to categories via a `serviceId → categoryId` map (admin bookings only return `service: { id, title }`) | [`adminActions.ts`](<app/(dashboardGroup)/_actions/adminActions.ts>) |
| Category supply chip (Live / Low supply / No technicians) | technician count per category | same |
| Technician 7-day earnings, admin 7-day revenue | booking `totalAmount` bucketed by `updatedAt` — there is no `completedAt` column | [`lib/analytics.ts`](lib/analytics.ts) |
| Technician monthly earnings + jobs (7-month chart) | same bucketing, by calendar month | same |
| Earnings ledger, "in progress" money, average job | technician bookings past payment (`PAID`, `IN_PROGRESS`, `COMPLETED`) | `EarningsTable.tsx`, `/dashboard/technician/earnings` |
| Admin gross booking value, cancellation share | admin bookings by status | `/dashboard/admin/bookings` |
| Acceptance / completion / cancellation rates | booking status distribution; returns `null` on an empty history rather than claiming 0% | same |
| Bookings-by-status chart | `GET /api/admin/bookings` | same |
| Booking lifecycle timeline | booking `status`, `createdAt`, `updatedAt`, `payment` | [`lib/booking-timeline.ts`](lib/booking-timeline.ts) |
| Technician profile completion % + blocker | profile fields, service count, published slots | `ProfileCompletion.tsx` |
| Rating histogram | `technician.reviews[]` bucketed 5→1 | `RatingHistogram.tsx` |

Search, filtering and pagination in the dashboard tables are **client-side**:
the API returns a role's full list in one call, so a round-trip per keystroke
would be waste. Public listings page server-side through `page` / `limit`.

---

## Payment flow

```
Booking is ACCEPTED
   │
   ├─ /dashboard/customer/bookings/[id]/pay
   │     POST /api/payments/create  →  { checkoutUrl, sessionId }
   │                                        │
   │                              redirect to Stripe Checkout
   │                                        │
   ├──────────── paid ─────────────┐        └──── cancelled ────┐
   ▼                               ▼                            ▼
/payment/success?session_id=…   Stripe webhook            /payment/cancel
   POST /api/payments/confirm    (backend, marks PAID)     nothing charged,
   → booking becomes PAID                                  booking stays ACCEPTED
```

Confirming on return means the customer sees `PAID` immediately rather than
waiting for the webhook. Both paths converge on the same result.

**Stripe's return URLs are built from the backend's `APP_URL`.** For a
deployed frontend, `APP_URL` on the API must be set to the frontend's origin,
or checkout will return the user to the wrong host.

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

Payment is **never** collected inside the booking wizard: the API rejects
`POST /api/payments/create` for any booking that isn't `ACCEPTED`, so the
wizard ends at the request and payment opens afterwards.

---

## Data notes

**Prisma `Decimal` columns arrive as strings** — `price: "100"`,
`avgRating: "4"`, `totalAmount: "250.00"`. `lib/types.ts` types them as
`string`; run them through `toNumber()` / `formatCurrency()` in
[`lib/format.ts`](lib/format.ts) before any arithmetic or display.

**Currency is USD, not BDT.** The design handoff is drawn for Bangladesh (৳),
but the API creates Stripe sessions with `currency: "usd"`. Rendering ৳ over
a USD charge would misstate what the customer is billed, so the symbol stays
USD until the backend's Stripe currency changes. `formatCurrency` is the one
place to flip.

**Booking lifecycle** is mirrored in [`lib/constants.ts`](lib/constants.ts)
(`TECHNICIAN_TRANSITIONS`, `canCancelBooking`, `canPayBooking`,
`canReviewBooking`) so the UI only offers actions the API will accept. The
API remains the authority and re-checks every one.

**Availability is dated, not recurring.** `PUT /api/technician/availability`
replaces every *unbooked* slot in one shot. The weekly scheduler therefore
posts the complete set across all weeks, not just the week on screen —
sending only the visible week would delete the others. Booked slots are
rendered locked and never sent.

**No refresh token.** The access token lasts one day; when it expires the
proxy clears the cookie and redirects to `/auth/login?redirectTo=…`.

---

## Backend addition

Two read-only endpoints were added to the API so the availability UI could
work — the original build could write availability but never read it back:

- `GET /api/technician/availability` — a technician's own slots
- `GET /api/technicians/:id` now also returns upcoming `slots`

Without these, the booking slot picker has nothing to show and the scheduler
can't load what was previously saved.

---

## Handoff screens not built, and why

The design handoff describes a larger product than this API supports. Each
omission below is a missing endpoint or model, not a shortcut — building the
screen would have meant showing data the platform never recorded.

| Handoff feature | Missing on the API |
|---|---|
| Booking wizard: Address step | no address field on `Booking` |
| Booking wizard: Payment step | payment is gated behind `ACCEPTED`; it can't happen mid-wizard |
| Saved payment methods panel | checkout is Stripe-hosted; the app never sees or stores a card |
| "Saved with promos", "pending refund" stats | no promo or refund model |
| Technician documents (NID, trade licence…) | no document model, no upload endpoint |
| Editable skill chips | no skills field — trades are derived from service categories |
| Review attribute chips (Punctual / Thorough) | review is `{ bookingId, rating, comment }` |
| Edit / delete a review | no update or delete endpoint |
| Blocked dates with reasons | no blocked-date model |
| Messages / chat | no messaging endpoints |
| "Available to withdraw", the Withdraw screen, commission and payout rows | no payout, commission or withdrawal model — money moves customer → Stripe and nothing records a transfer to the technician. `/dashboard/technician/earnings` shows what *was* earned instead |
| Notification drawer, ⌘K search | no notification or search endpoints |
| Audit log, review moderation, technician approvals | no such resources |
| Category slug, stored base price, Live/Draft status | category is `{ id, name, icon }` — the table derives what it can and says so |
| 403 page | the proxy redirects wrong-role users to their own dashboard, so a 403 is unreachable |
