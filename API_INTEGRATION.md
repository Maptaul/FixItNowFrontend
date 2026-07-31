# API Integration

How this frontend consumes the FixItNow REST API.

- **Base URL:** `https://fixitbackend.vercel.app` (override with
  `NEXT_PUBLIC_API_URL`)
- **Backend source:** `Assignment-4/FixItNow-backend`
- **Every** endpoint below is consumed. Nothing is mocked.

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
| Unhandled render error | `app/error.tsx` boundary with a retry button |
| Missing record | `notFound()` → `app/not-found.tsx` |

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
| `GET /api/categories` | `getCategories` — [`(publicGroup)/_actions/getCategories.ts`](<app/(publicGroup)/_actions/getCategories.ts>) | `CategoryStrip` (`/`), `ServiceFilters`, `ServiceFormDialog` |
| `GET /api/services` | `getServices` — [`getServices.ts`](<app/(publicGroup)/_actions/getServices.ts>) | `FeaturedServices` (`/`), `/services` |
| `GET /api/technicians` | `getTechnicians` — [`getTechnicians.ts`](<app/(publicGroup)/_actions/getTechnicians.ts>) | `TopTechnicians` (`/`), `/technicians` |
| `GET /api/technicians/:id` | `getTechnicianById` — same file | `/technicians/[id]`, `/dashboard/technician/services` |

Filters passed straight through: services take `categoryId, location,
minPrice, maxPrice, minRating, search, page, limit`; technicians take
`location, minRating, categoryId, page, limit`. All of them live in the URL
query string, so results are shareable and server-rendered.

> `GET /api/technicians/:id` returns `services`, `reviews` **and** upcoming
> `slots` — the slots feed the available-vs-booked picker in `SlotPicker`.

### Customer — bookings

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `POST /api/bookings` | `createBooking` — [`(publicGroup)/_actions/createBooking.ts`](<app/(publicGroup)/_actions/createBooking.ts>) | `BookingPanel` + `SlotPicker` on `/technicians/[id]` |
| `GET /api/bookings` | `getMyBookings` — [`(dashboardGroup)/_actions/bookingActions.ts`](<app/(dashboardGroup)/_actions/bookingActions.ts>) | `/dashboard/customer`, `/dashboard/customer/bookings` |
| `GET /api/bookings/:id` | `getBookingById` — same file | `/dashboard/customer/bookings/[id]/pay` |
| `PATCH /api/bookings/:id/cancel` | `cancelBooking` — same file | `CustomerBookingActions` |

### Customer — payments (Stripe)

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `POST /api/payments/create` | `startCheckout` — [`paymentActions.ts`](<app/(dashboardGroup)/_actions/paymentActions.ts>) | `StripeCheckoutButton` → redirects to Stripe Checkout |
| `POST /api/payments/confirm` | `confirmPayment` — same file | `/payment/success` |
| `GET /api/payments` | `getMyPayments` — same file | `/dashboard/customer/payments`, customer overview |

### Customer — reviews

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `POST /api/reviews` | `createReview` — [`reviewActions.ts`](<app/(dashboardGroup)/_actions/reviewActions.ts>) | `ReviewDialog`, shown only on `COMPLETED` bookings without a review |

### Technician

| Endpoint | Frontend caller | Used by |
|---|---|---|
| `PUT /api/technician/profile` | `updateTechnicianProfile` — [`technicianActions.ts`](<app/(dashboardGroup)/_actions/technicianActions.ts>) | `TechnicianProfileForm` |
| `GET /api/technician/availability` | `getMyAvailability` — same file | `/dashboard/technician/availability` |
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
| `PATCH /api/admin/users/:id` | `updateUserStatus` — same file | `UsersTable` ban/unban |
| `GET /api/admin/bookings` | `getAllBookings` — same file | `/dashboard/admin`, `/dashboard/admin/bookings` |
| `GET /api/admin/categories` | `getAdminCategories` — same file | `/dashboard/admin/categories` |
| `POST /api/admin/categories` | `createCategory` — same file | `CategoryManager` |
| `PUT /api/admin/categories/:id` | `updateCategory` — same file | `CategoryManager` |
| `DELETE /api/admin/categories/:id` | `deleteCategory` — same file | `CategoryManager` |

---

## Route → endpoint summary

| Route | Endpoints |
|---|---|
| `/` | `GET /api/services`, `GET /api/technicians`, `GET /api/categories` |
| `/services` | `GET /api/services`, `GET /api/categories` |
| `/technicians` | `GET /api/technicians`, `GET /api/categories` |
| `/technicians/[id]` | `GET /api/technicians/:id`, `GET /api/auth/me`, `POST /api/bookings` |
| `/auth/register` | `POST /api/auth/register` |
| `/auth/login` | `POST /api/auth/login` |
| `/dashboard/customer` | `GET /api/bookings`, `GET /api/payments` |
| `/dashboard/customer/bookings` | `GET /api/bookings`, `PATCH /api/bookings/:id/cancel`, `POST /api/reviews` |
| `/dashboard/customer/bookings/[id]/pay` | `GET /api/bookings/:id`, `POST /api/payments/create` |
| `/dashboard/customer/payments` | `GET /api/payments` |
| `/payment/success` | `POST /api/payments/confirm` |
| `/payment/cancel` | — (static outcome page) |
| `/dashboard/technician` | `GET /api/auth/me`, `GET /api/technician/bookings` |
| `/dashboard/technician/bookings` | `GET /api/technician/bookings`, `PATCH /api/technician/bookings/:id` |
| `/dashboard/technician/services` | `GET /api/technicians/:id`, `GET /api/categories`, `POST`/`PUT`/`DELETE /api/technician/services` |
| `/dashboard/technician/availability` | `GET`/`PUT /api/technician/availability` |
| `/dashboard/technician/profile` | `GET /api/auth/me`, `PUT /api/technician/profile`, `PUT /api/auth/my-profile` |
| `/dashboard/admin` | `GET /api/admin/users`, `GET /api/admin/bookings`, `GET /api/admin/categories` |
| `/dashboard/admin/users` | `GET /api/admin/users`, `PATCH /api/admin/users/:id` |
| `/dashboard/admin/bookings` | `GET /api/admin/bookings` |
| `/dashboard/admin/categories` | `GET`/`POST`/`PUT`/`DELETE /api/admin/categories` |
| `/dashboard/*/profile` | `GET /api/auth/me`, `PUT /api/auth/my-profile` |

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

---

## Data notes

**Prisma `Decimal` columns arrive as strings** — `price: "100"`,
`avgRating: "4"`, `totalAmount: "250.00"`. `lib/types.ts` types them as
`string`; run them through `toNumber()` / `formatCurrency()` in
[`lib/format.ts`](lib/format.ts) before any arithmetic or display.

**Booking lifecycle** is mirrored in [`lib/constants.ts`](lib/constants.ts)
(`TECHNICIAN_TRANSITIONS`, `canCancelBooking`, `canPayBooking`,
`canReviewBooking`) so the UI only offers actions the API will accept. The
API remains the authority and re-checks every one.

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
