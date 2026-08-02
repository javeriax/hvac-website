# ServiceFlow — HVAC Service Management System

Built for the ArcticAir HVAC brief (BranDive Media Solutions, Week 1 Project 3).

A web platform that replaces the spreadsheets, WhatsApp threads and paper job sheets a growing HVAC
company runs on. Customers raise requests and approve quotes online, dispatchers assign technicians
without double-booking, technicians close jobs from their phone with photos and a signature, and
management sees revenue and performance on one screen.

---

## Table of contents

- [Project docs](#project-docs)
- [Tech stack](#tech-stack)
- [How to run it](#how-to-run-it)
- [Demo logins](#demo-logins)
- [What is built](#what-is-built)
- [Bonus tasks](#bonus-tasks)
- [Decisions I made and why](#decisions-i-made-and-why)

=======
- [Folder layout](#folder-layout)
>>>>>>> 9c75e43 (Update README with env setup instructions and project navigation)

---

## Project docs

https://docs.google.com/document/d/1MdKPvUGpyaZpOxRmYunBkmN80uygnynva80PTDuYpJE/edit?usp=sharing

## Tech stack

This is the stack the brief asked for.

| Part | Used |
| --- | --- |
| Frontend | React 18 + Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (Atlas) with Mongoose |
| Auth | JWT with role-based access control |
| File storage | Cloudinary |
| Version control | Git + GitHub |
| Hosting | Vercel (frontend), any Node host for the API |

Charts and icons are written by hand as SVG rather than installed. The client has three runtime
dependencies: `next`, `react`, `react-dom`.

---

## How to run it

You need Node 18+ and a MongoDB connection string.

**1. Set up the server env**

Create `server/.env` from the template and fill in the required values.

```bash
cp server/.env.example server/.env
```

Required values:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

If you do not want to keep a separate `.env.example` file, you can instead add these keys directly to `README.md` as the documented template reference.

**2. Install**

```bash
npm --prefix server install
```

```bash
npm --prefix client install
```

**3. Load the demo data**

```bash
npm --prefix server run seed:reset
```

This wipes the database and rebuilds 13 months of history: 34 users, ~126 requests, ~110 quotes,
100 jobs, ~91 invoices, ~90 payments, 14 contracts and the equipment catalogue.

**4. Start both, in two terminals**

```bash
npm --prefix server run dev
```

```bash
npm --prefix client run dev
```

Site: http://localhost:3000 · API health check: http://localhost:5050/api/health

**Note on ports.** The API runs on 5050, not 5000, because 5000 was already taken on the machine
this was built on. If you change it, update `NEXT_PUBLIC_API_URL` in the client environment and add
the new frontend origin to the CORS list in `server/src/app.ts`.

---

## Demo logins

Every seeded account uses the password **`ArcticAir#2026`**. The login page lists them and fills
them in when you click one.

| Role | Email |
| --- | --- |
| Admin | admin@arcticair.com |
| Dispatcher | dispatch@arcticair.com |
| Technician | marcus@arcticair.com |
| Customer | customer@arcticair.com |

Other technicians: priya@, dmitri@, aaliyah@, tomas@, grace@arcticair.com.

**A example walkthrough**

1. Customer: approve a pending quotation.
2. Dispatcher: the approved job appears, assign a technician from the board.
3. Technician: mark en route, tick the checklist, upload a photo, write the report, take a
   signature, complete the job.
4. Admin: create an invoice from that job, issue it, record payment, then watch the analytics move.

---

## What is built

All nine modules from the brief are done.

| Module | Status | Where |
| --- | --- | --- |
| 1. Corporate website | Done | `/`, `/services`, `/maintenance-plans`, `/emergency`, `/testimonials`, `/service-areas`, `/request-quote`, `/contact`, `/about`, `/faq` |
| 2. Service requests | Done | `/request-quote` (4-step form with photo upload), `/track` (public tracking, no login) |
| 3. Quotations | Done | Builder on the dispatcher request page, approve/reject in the customer portal |
| 4. Technician dashboard | Done | `/dashboard/technician` and the job detail page |
| 5. Dispatcher dashboard | Done | `/dashboard/dispatcher`, plus a week calendar |
| 6. Maintenance contracts | Done | `/dashboard/admin/contracts`, `/dashboard/customer/contracts` |
| 7. Invoices and payments | Done | Admin and customer invoice screens |
| 8. Analytics | Done | `/dashboard/admin` |
| 9. Notifications | Done | Bell in every dashboard header |

**Pages.** All 14 pages listed in the brief exist, plus a few extras (About, Testimonials,
Emergency, per-role sub-pages).

**Database.** All 12 tables the brief suggested exist as collections: users, service requests,
quotations, jobs, maintenance contracts, invoices, payments, equipment, notifications, plus
maintenance plans, contact messages and testimonials. Customers, technicians and dispatchers live in
the `users` collection separated by a `role` field rather than three separate tables (see
[Decisions](#decisions-i-made-and-why)).

**Non-functional requirements.** Mobile responsive (tested at 375px), no page scrolls sideways.
Passwords are bcrypt hashed and never returned by the API. Production build is roughly 98–119 kB
first load per page.

**Business rules enforced on the server**, not just hidden in the UI:

- A technician cannot be double-booked. Overlapping assignments return 409.
- A job cannot be completed until the service report is submitted.
- A quotation becomes read-only once the customer accepts or rejects it.
- You cannot pay more than an invoice's outstanding balance.
- An invoice with payments on it cannot be voided.
- A job can only be invoiced once.
- Customers can only ever read their own records. Technicians only their own jobs.

---

## Bonus tasks

### Done

**Dark mode.** Full light and dark themes. The theme is applied by an inline script in `<head>` so
there is no flash of the wrong colour on load, and the choice is remembered.

**Customer signature capture.** A real canvas signature pad on the technician's job screen. The
drawing is flattened to a PNG, uploaded to Cloudinary, and shown on the job record and in the
customer's copy of the service report.

**Online payment integration (interface only).** Full payment flow with partial payments, running
balance, status changes and a payment ledger.
*Limitation:* no real payment gateway is connected. No card details are collected anywhere. The
brief allows this ("UI implementation is sufficient if payment gateway integration is not
completed").

**Email automation (groundwork only).** Every event in the system creates its notification through
one file, `server/src/services/notify.ts`.
*Limitation:* delivery is in-app only. Nothing is actually emailed. That file is the single place a
provider like SendGrid would be plugged in, and no controller would need to change.

**Google Maps integration (partial).** Job addresses on the technician screen open directly in
Google Maps for navigation.
*Limitation:* this is a deep link, not an embedded map with pins. No Maps API key is used.

---

## Decisions I made and why

**One `users` collection instead of separate customer/technician/dispatcher tables.**
The brief lists them as separate tables. I used one collection with a `role` field and optional
sub-documents for customer and technician details. Authentication, permissions and the "who did
this" reference on every other record all work the same way for every role, which would mean
duplicating logic three times otherwise. The ER diagram documents it either way.

**Money is always recalculated on the server.**
Quote and invoice totals are recomputed from the line items in a Mongoose hook before every save. If
someone posts a quotation with `total: 99999`, it saves at the real value. There is a test for this.

**Numbers are readable, not UUIDs.**
Documents get numbers like `QT-2026-0042`, `INV-2026-0087`, `JOB-2026-0007`. Tracking codes are
short (`SR-7K4M2Q`) and drop the characters I, O, 0 and 1 so nobody misreads one over the phone.

**Guests can raise a request without an account.**
The brief says guests can request quotations. Forcing a signup before someone can report a broken
air conditioner in 45 degree heat would lose the job. They get a tracking code instead, and if they
later register with the same email, their earlier requests attach to the new account automatically.

**Deleting a user deactivates them.**
Old jobs and invoices reference the user. Hard deleting would break that history, so `isActive` is
flipped instead.

**Charts and icons are hand-written SVG.**
No Recharts, no icon library. It keeps the bundle small, and more usefully the chart colours come
from the same CSS variables as everything else, so dark mode needs no separate chart theme.

**Service types are shown as two-letter tags, not icons.**
Started with a drawn icon per service type. Replaced them with monograms (IN, RP, MT…) because in a
dense table a monogram scans just as fast, and it frees colour to mean one single thing: orange is
an emergency, blue is everything else.

**A DNS fallback for MongoDB.**
`mongodb+srv://` needs a DNS SRV lookup, which Node does through c-ares rather than the OS resolver.
On a machine whose only DNS servers are IPv6 that lookup fails even though everything else resolves
fine. `server/src/config/db.ts` catches that specific error and retries with a plain host list from
`MONGODB_URI_FALLBACK`. Leave that variable empty if your machine is normal.

**The seed data is deterministic and forces recent activity.**
The seeder uses a fixed random seed so numbers stay stable between runs, and it deliberately places
a few payments on today's date. Without that the "revenue today" tile reads $0 whenever the seed
runs on the 1st of a month, which makes a working dashboard look broken during a demo.


## Folder layout

```
hvac-website/
├── client/                  Next.js frontend
│   ├── public/              Static assets
│   ├── src/
│   │   ├── app/             Next.js App Router pages
│   │   │   ├── (site)/      Public marketing pages
│   │   │   └── dashboard/   Role-based logged-in dashboards
│   │   ├── components/      Shared UI, charts, icons, dashboard pieces
│   │   └── lib/             API client, auth, theme, formatting, types
│   ├── package.json
│   └── tsconfig.json
├── server/                  Express API
│   ├── src/
│   │   ├── config/          Environment, database, Cloudinary
│   │   ├── controllers/     Business logic
│   │   ├── middleware/      Auth, errors, file upload
│   │   ├── models/          Mongoose schemas
│   │   ├── routes/          One router per resource
│   │   ├── seed/            Demo data generator
│   │   └── server.ts        API bootstrap
│   ├── package.json
│   └── tsconfig.json
└── docs/                    Diagrams, schema, API, test plan
```
