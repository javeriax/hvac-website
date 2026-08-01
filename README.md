# ServiceFlow™ — HVAC Service Management System

**Client:** ArcticAir HVAC Solutions · **Agency:** BranDive Media Solutions
**Sprint:** Week 1, Project 3 — Full Stack Developer

A centralised platform that takes an HVAC company off spreadsheets, WhatsApp threads and paper
carbon copies. Customers raise requests and approve quotations online; dispatchers assign
technicians without double-booking; technicians close jobs from the field with photos, a checklist
and a captured signature; management watches revenue, contracts and technician performance from a
single analytics screen.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Demo accounts](#demo-accounts)
- [Modules delivered](#modules-delivered)
- [Design system](#design-system)
- [Project structure](#project-structure)
- [Database schema](#database-schema)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Bonus features](#bonus-features)

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3 with a custom CSS-variable theme layer |
| Charts | Hand-written SVG (no charting library) |
| Icons | Hand-drawn 24px icon set (no icon library) |
| Backend | Node.js, Express 4, TypeScript |
| Database | MongoDB Atlas via Mongoose 8 |
| Auth | JWT (stateless), bcrypt password hashing, role-based access control |
| File storage | Cloudinary (request photos, job before/after photos, signatures) |
| Hosting target | Vercel (frontend) + Hostinger VPS (API) |

Runtime dependencies are deliberately minimal — three on the client (`next`, `react`, `react-dom`)
and nine on the server. Charts, icons, the modal system, toasts and the signature pad are all
written for this project rather than pulled in.

---

## Quick start

**Prerequisites:** Node.js 18+ and a MongoDB Atlas connection string.

```bash
git clone <your-repo-url> serviceflow-hvac && cd serviceflow-hvac
```

**1. Configure the server**

```bash
cp server/.env.example server/.env
```

Fill in `MONGODB_URI`, `JWT_SECRET` and your Cloudinary keys.

**2. Install dependencies**

```bash
npm --prefix server install && npm --prefix client install
```

**3. Seed the database**

```bash
npm --prefix server run seed:reset
```

This drops the database and rebuilds ~13 months of realistic operating history: 34 users, 126
service requests, 116 quotations, 100 jobs, 91 invoices, 90 payments, 14 maintenance contracts and
a full equipment catalogue. Use `npm run seed` (without `:reset`) to clear the ServiceFlow
collections only, leaving anything else in the database untouched.

**4. Run both services**

```bash
npm --prefix server run dev
```

```bash
npm --prefix client run dev
```

- Website → <http://localhost:3000>
- API → <http://localhost:5050/api/health>

> The API defaults to port **5050**. If you change it, update `NEXT_PUBLIC_API_URL` in
> `client/.env.local` to match.

### A note on `MONGODB_URI_FALLBACK`

`mongodb+srv://` requires a DNS **SRV** lookup, which Node performs through c-ares rather than the
OS resolver. On machines whose only configured nameservers are IPv6, that lookup fails even though
ordinary hostname resolution works fine. `server/src/config/db.ts` catches that specific failure and
retries with the plain replica-set seed list in `MONGODB_URI_FALLBACK`. Leave the variable empty if
your machine resolves SRV records normally — it is only a safety net.

---

## Demo accounts

Every seeded account shares the password **`ArcticAir#2026`**. The sign-in screen lists these and
fills them in on click.

| Role | Email | What to look at |
| --- | --- | --- |
| Administrator | `admin@arcticair.com` | Analytics, invoices, contracts, customers, equipment, plans |
| Dispatcher | `dispatch@arcticair.com` | Dispatch board, technician lanes, quotation builder |
| Technician | `marcus@arcticair.com` | Today's route, job checklist, photos, signature capture |
| Customer | `customer@arcticair.com` | Requests, quotation approval, invoices, maintenance plan |

Other seeded technicians: `priya@`, `dmitri@`, `aaliyah@`, `tomas@`, `grace@arcticair.com`.
Second dispatcher: `dispatch2@arcticair.com`.

**Suggested walkthrough**

1. Sign in as the **customer** → approve a pending quotation.
2. Sign in as the **dispatcher** → the approved job appears; assign a technician from the board.
3. Sign in as that **technician** → mark en route, tick the checklist, upload photos, submit the
   report, capture a signature, complete the job.
4. Sign in as the **admin** → generate an invoice from the completed job, issue it, record payment,
   then watch the analytics move.

---

## Modules delivered

| # | Module | Where it lives |
| --- | --- | --- |
| 1 | Corporate website | `/`, `/services`, `/maintenance-plans`, `/service-areas`, `/about`, `/testimonials`, `/emergency`, `/faq`, `/contact` |
| 2 | Service request management | `/request-quote` (4-step wizard with photo upload), `/track` (public tracking by code) |
| 3 | Quotation management | Builder at `/dashboard/dispatcher/requests/[id]`; customer approval at `/dashboard/customer/quotations/[id]` |
| 4 | Technician dashboard | `/dashboard/technician`, `/dashboard/technician/jobs/[id]`, `/schedule`, `/history` |
| 5 | Dispatcher dashboard | `/dashboard/dispatcher` (lane timeline), `/schedule` (week calendar), `/requests`, `/technicians` |
| 6 | Maintenance contracts | `/dashboard/admin/contracts` (renewal queue + reminders), `/dashboard/customer/contracts` (enrol, renew, auto-renew) |
| 7 | Invoice & payment | `/dashboard/admin/invoices`, `/dashboard/customer/invoices` — printable documents, partial payments, balance tracking |
| 8 | Analytics dashboard | `/dashboard/admin` — revenue trend, job donut, service mix, technician leaderboard, request funnel |
| 9 | Notification system | Bell in every dashboard header; triggers fire from `server/src/services/notify.ts` |

### Role capabilities

| | Guest | Customer | Technician | Dispatcher | Admin |
| --- | :-: | :-: | :-: | :-: | :-: |
| Browse services, request a quote, track by code | ✓ | ✓ | | | |
| Approve/decline quotations, pay invoices, manage plan | | ✓ | | | |
| View assigned jobs, update status, upload photos, capture signature, submit reports | | | ✓ | | |
| Assign technicians, schedule, manage the emergency queue | | | | ✓ | ✓ |
| Build & send quotations | | | | ✓ | ✓ |
| Generate invoices, record payments, configure plans & equipment, manage staff | | | | | ✓ |

---

## Design system

The brief asked for a professionally designed, modern service business interface. The direction here
is a **precision instrument** aesthetic built on HVAC's own duality:

- **Frost (cyan) ↔ Ember (orange)** — cooling and heating. These two colours carry all the meaning;
  everything else is a neutral instrument surface.
- **Tabular monospace numerics** everywhere data appears, so figures align and read as measurements.
- **Hairline borders and a 56px lattice** behind the page, with a film-grain overlay.
- **Status as a leading bar**, not a filled bubble — denser, and legible in both themes.
- **A live thermostat dial** as the hero: draggable, keyboard-accessible, and it animates a
  cool-down cycle on its own.
- **Editorial section indices** (`01`, `02`, …) rather than centred marketing headings.

Both themes are first-class. `data-theme` on `<html>` swaps a single block of CSS variables, and an
inline script in `<head>` paints the stored theme before first render so there is no flash.

Accessibility: focus-visible rings, `prefers-reduced-motion` honoured, ARIA roles on the dial and
modals, semantic landmarks, and colour never used as the only signal.

---

## Project structure

```
serviceflow-hvac/
├── client/                            # Next.js 14 frontend
│   └── src/
│       ├── app/
│       │   ├── (site)/                # Public website — inherits Navbar/Footer
│       │   ├── dashboard/
│       │   │   ├── customer/          # Requests, quotations, invoices, contracts, profile
│       │   │   ├── technician/        # Today, job detail, schedule, history, profile
│       │   │   ├── dispatcher/        # Board, calendar, requests, technicians, quotations
│       │   │   └── admin/             # Analytics, invoices, contracts, customers, equipment…
│       │   ├── globals.css            # Theme tokens + component layer
│       │   └── layout.tsx             # Fonts, theme script, providers
│       ├── components/
│       │   ├── brand.tsx              # Logo, Grain, ThermostatDial, SectionHeading, Reveal
│       │   ├── charts.tsx             # AreaChart, BarChart, DonutChart, Sparkline, StatTile
│       │   ├── icons.tsx              # Hand-drawn icon set
│       │   ├── ui.tsx                 # Button, Card, fields, Modal, Pill, toasts, Tabs, Meter
│       │   ├── site/                  # Navbar, Footer, forms, service cards, plan grid
│       │   └── dashboard/             # Shell, DataTable, workspaces, builders, SignaturePad
│       └── lib/                       # api, auth, theme, format, types, site content, useApi
├── server/                            # Express + TypeScript API
│   └── src/
│       ├── config/                    # env, db (with SRV fallback), cloudinary
│       ├── models/                    # 12 Mongoose models
│       ├── controllers/               # auth, requests, quotations, jobs, invoices, contracts…
│       ├── routes/                    # One router per resource, mounted in routes/index.ts
│       ├── middleware/                # protect / requireRole, error handler, Cloudinary upload
│       ├── services/notify.ts         # Central notification trigger (Module 9)
│       ├── utils/                     # ApiError, asyncHandler, jwt, document numbering
│       └── seed/                      # Deterministic demo dataset
└── docs/                              # ER diagram, system flow, database schema, API reference
```

---

## Database schema

Twelve collections. Full field-by-field detail in [`docs/DATABASE.md`](docs/DATABASE.md); the entity
relationship diagram is in [`docs/ER-DIAGRAM.md`](docs/ER-DIAGRAM.md).

| Collection | Purpose |
| --- | --- |
| `users` | All five roles in one collection with `customer` / `technician` sub-documents |
| `servicerequests` | Intake — tracking code, photos, priority, status timeline |
| `quotations` | Line items, discount, tax, totals, approval state |
| `jobs` | Scheduled work — checklist, photos, report, signature, timeline |
| `invoices` | Billing — line items, balance, status |
| `payments` | Payment ledger against invoices |
| `maintenanceplans` | Plan catalogue (Essential, Comfort, Elite, Commercial) |
| `maintenancecontracts` | Customer enrolments, visit schedule, renewal state |
| `equipment` | Parts and equipment catalogue with stock levels |
| `notifications` | Per-user notification feed |
| `contactmessages` | Website enquiry inbox |
| `testimonials` | Published customer stories |

**Design notes**

- Money is recalculated server-side in a `pre('validate')` hook on `Quotation` and `Invoice`, so
  totals can never drift from their line items regardless of what a client sends.
- Documents are numbered per year — `QT-2026-0042`, `INV-2026-0087`, `JOB-2026-0007`.
- Public tracking uses a short, non-ambiguous code (`SR-7K4M2Q`) with `I`, `O`, `0` and `1` removed.
- Deleting a user deactivates rather than removes, so history stays intact.

---

## API reference

Base URL `/api`. Full endpoint list in [`docs/API.md`](docs/API.md).

```
POST   /auth/register                     Create a customer account
POST   /auth/login                        Sign in
GET    /auth/me                           Current user

POST   /service-requests                  Raise a request (guest or customer, multipart)
GET    /service-requests/track/:code      Public status lookup — no auth
GET    /service-requests                  Scoped list (customers see only their own)

POST   /quotations                        Build a quotation            [staff]
POST   /quotations/:id/send               Issue it to the customer     [staff]
POST   /quotations/:id/respond            Accept or reject             [customer]

POST   /jobs                              Schedule a job               [staff]
POST   /jobs/:id/assign                   Assign, with conflict check  [staff]
PATCH  /jobs/:id/status                   en_route → in_progress → completed
POST   /jobs/:id/photos                   Before/after upload (multipart)
POST   /jobs/:id/signature                Capture signature (base64 → Cloudinary)
POST   /jobs/:id/report                   Submit the service report

POST   /invoices                          Generate from a completed job [staff]
POST   /invoices/:id/payments             Record a payment

GET    /contracts/plans                   Public plan catalogue
POST   /contracts/:id/renew               Renew for another term
POST   /contracts/reminders               Sweep and send renewal reminders [staff]

GET    /analytics/overview                Admin analytics aggregate     [admin]
GET    /analytics/dispatch                Dispatch day summary          [staff]
```

Every response follows `{ success, data }` or `{ success: false, message, details? }`.

**Business rules enforced server-side**

- A technician cannot be double-booked — overlapping assignments return `409`.
- A job cannot be completed without a submitted service report.
- Quotations become immutable once the customer responds.
- Payments cannot exceed the outstanding balance.
- Invoices with recorded payments cannot be voided.
- Expired quotations are rejected and flipped to `expired` on the attempt.
- Customers can only ever read and act on their own records, enforced in each controller.

---

## Deployment

**Frontend (Vercel)** — set root directory to `client`, add `NEXT_PUBLIC_API_URL` pointing at your
deployed API, and deploy. The App Router build is fully static where possible.

**Backend (Hostinger VPS or any Node host)**

```bash
npm --prefix server run build
npm --prefix server start
```

Set `NODE_ENV=production`, `CLIENT_URL` to your deployed frontend origin (CORS reads it), and a
strong `JWT_SECRET`. Put nginx in front for TLS.

**Before going live:** rotate `JWT_SECRET`, rotate the Cloudinary and MongoDB credentials that were
used in development, and restrict the Atlas IP allow-list to your server.

---

## Bonus features

Implemented from the bonus list:

- **Customer signature capture** — canvas pad, flattened to PNG, uploaded to Cloudinary, rendered on
  the job record and in the customer's service report.
- **Dark mode** — full light/dark theming with no flash on load and a persisted preference.
- **Email automation hooks** — every state change funnels through `services/notify.ts`, which is the
  single place an email or SMS provider would be attached. UI delivery is live now.
- **Online payment interface** — full payment flow with partial payments and a ledger. No real
  gateway is connected, as the brief permits.
- **Navigation integration** — job addresses deep-link into Google Maps from the technician view.

Not implemented: live technician GPS tracking, SMS delivery, AI recommendation assistant, AI
quotation generator.

---

## Deliverables checklist

- [x] Complete source code
- [x] README documentation (this file)
- [x] Database schema — [`docs/DATABASE.md`](docs/DATABASE.md)
- [x] ER diagram — [`docs/ER-DIAGRAM.md`](docs/ER-DIAGRAM.md)
- [x] System flow diagram — [`docs/SYSTEM-FLOW.md`](docs/SYSTEM-FLOW.md)
- [x] API reference — [`docs/API.md`](docs/API.md)
- [ ] Screenshots — capture from the running app into `docs/screenshots/`
- [ ] Live deployment (bonus)
- [ ] Presentation (max 10 slides)
