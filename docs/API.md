# API Reference

ServiceFlow — Express + TypeScript. Base URL `http://localhost:5050/api`.

**Auth:** send `Authorization: Bearer <jwt>` on protected routes. Tokens last 7 days by default.

**Response envelope**

```jsonc
// success
{ "success": true, "data": { /* … */ }, "count": 12 }

// failure
{ "success": false, "message": "That technician is already booked on JOB-2026-0007", "details": {} }
```

**Access legend:** 🌐 public · 👤 any signed-in user · 🧰 dispatcher or admin · 🛠 technician · 🛡 admin only

---

## Authentication — `/auth`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | 🌐 | Create a **customer** account. Staff accounts are provisioned by an admin. |
| POST | `/auth/login` | 🌐 | Returns `{ token, user }`. |
| GET | `/auth/me` | 👤 | Current user. |
| PATCH | `/auth/me` | 👤 | Update name, phone, avatar, and (customers) address and preferences. |
| POST | `/auth/change-password` | 👤 | Requires the current password. |

<details>
<summary><code>POST /auth/register</code></summary>

```jsonc
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "password": "at-least-8-chars",
  "phone": "(602) 555-0142",
  "propertyType": "residential",
  "address": { "line1": "4820 N Camelback Ridge Rd", "city": "Scottsdale", "state": "AZ", "zip": "85251" }
}
```
</details>

---

## Service requests — `/service-requests`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/service-requests` | 🌐 | Raise a request. `multipart/form-data`, up to 6 photos under `photos`. Signed-in customers are linked automatically. |
| GET | `/service-requests/track/:code` | 🌐 | Public status lookup by tracking code. Returns a trimmed payload — no invoice or contact detail. |
| GET | `/service-requests` | 👤 | List. Customers see only their own. Filters: `status`, `priority`, `serviceType`, `search`, `limit`. |
| GET | `/service-requests/:id` | 👤 | Full record with quotation and job populated. Ownership enforced. |
| PATCH | `/service-requests/:id/status` | 🧰 | Move status and append a timeline note. Notifies the customer. |
| POST | `/service-requests/:id/cancel` | 👤 | Customer or staff. Blocked once work has started. |
| POST | `/service-requests/claim` | 👤 | Link a guest request to the signed-in account. Requires a matching email. |

<details>
<summary><code>POST /service-requests</code> — form fields</summary>

| Field | Required | Notes |
| --- | --- | --- |
| `serviceType` | ✓ | One of the seven service types |
| `description` | ✓ | |
| `address` | ✓ | JSON string — `{ line1, line2?, city, state, zip }` |
| `contactName` / `contactEmail` / `contactPhone` | ✓ for guests | Inherited from the profile when signed in |
| `title`, `priority`, `propertyType`, `preferredDate`, `preferredWindow`, `systemBrand`, `systemAge` | | |
| `photos` | | Up to 6 image files, 8 MB each |

`serviceType: "emergency"` forces `priority: "emergency"` server-side.
</details>

---

## Quotations — `/quotations`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/quotations` | 👤 | Customers never see drafts. Filters: `status`, `customer`, `limit`. |
| POST | `/quotations` | 🧰 | Build a quotation against a request. Totals are computed server-side. |
| GET | `/quotations/:id` | 👤 | Ownership enforced; drafts 404 for customers. |
| PATCH | `/quotations/:id` | 🧰 | Edit line items, tax, discount, notes, validity. Rejected once the customer has responded. |
| POST | `/quotations/:id/send` | 🧰 | Draft → sent. Notifies the customer, moves the request to `quoted`. |
| POST | `/quotations/:id/respond` | 👤 | `{ decision: "accept" \| "reject", reason? }`. |
| DELETE | `/quotations/:id` | 🧰 | Drafts only. |

<details>
<summary><code>POST /quotations</code></summary>

```jsonc
{
  "serviceRequest": "6a6e0d39…",
  "lineItems": [
    { "kind": "labor",     "description": "Diagnostic and refrigerant service — 2.5h", "quantity": 2.5, "unitPrice": 95 },
    { "kind": "part",      "description": "Dual Run Capacitor 45/5 MFD 440V",          "quantity": 1,   "unitPrice": 42 },
    { "kind": "equipment", "description": "Carrier Infinity 16 SEER Condenser (3 Ton)","quantity": 1,   "unitPrice": 3450 }
  ],
  "taxRate": 8.25,
  "discountType": "percent",
  "discountValue": 10,
  "notes": "Price assumes the existing line set is reusable."
}
```

`laborTotal`, `equipmentTotal`, `subtotal`, `discountAmount`, `taxAmount` and `total` are all
recalculated from `lineItems` — values sent for them are ignored.
</details>

---

## Jobs — `/jobs`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/jobs` | 👤 | Scoped by role. Filters: `technician`, `status`, `priority`, `date`, `from`, `to`, `limit`. |
| POST | `/jobs` | 🧰 | Schedule a job. Seeds a service-type checklist. Rejects double-bookings. |
| GET | `/jobs/:id` | 👤 | Ownership enforced for customers and technicians. |
| POST | `/jobs/:id/assign` | 🧰 | Assign or reassign, optionally rescheduling. **409** on overlap. |
| POST | `/jobs/:id/reschedule` | 🧰 | Move the appointment; notifies the customer. |
| PATCH | `/jobs/:id/status` | 🛠🧰 | `en_route` → `in_progress` → `completed`. Completion requires a report. |
| PATCH | `/jobs/:id/checklist` | 🛠🧰 | `{ index, done }`. |
| POST | `/jobs/:id/notes` | 🛠🧰 | Append a service note. |
| POST | `/jobs/:id/photos` | 🛠🧰 | `multipart`, up to 8 files, `phase` = `before` \| `after`. |
| POST | `/jobs/:id/signature` | 🛠🧰 | `{ dataUrl, signedBy }` — base64 PNG uploaded to Cloudinary. |
| POST | `/jobs/:id/report` | 🛠🧰 | Submit or revise the service report. |

<details>
<summary><code>POST /jobs/:id/report</code></summary>

```jsonc
{
  "summary": "Failed run capacitor replaced, system operating within spec.",
  "workPerformed": "Isolated power, confirmed capacitor reading 28 µF against a 45 µF rating…",
  "partsUsed": [{ "name": "Dual Run Capacitor 45/5 MFD 440V", "quantity": 1 }],
  "recommendations": "Contactor pitting is advanced — worth quoting before next summer.",
  "laborHours": 2.5
}
```
</details>

---

## Invoices & payments — `/invoices`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/invoices` | 👤 | Customers never see drafts. Filters: `status`, `customer`, `limit`. |
| POST | `/invoices` | 🧰 | Generate from a job — line items pull from the accepted quotation, falling back to the technician's report. |
| GET | `/invoices/:id` | 👤 | Returns `{ invoice, payments }`. |
| PATCH | `/invoices/:id` | 🧰 | Edit before payment. Blocked once paid. |
| POST | `/invoices/:id/send` | 🧰 | Draft → sent. Notifies the customer. |
| POST | `/invoices/:id/void` | 🛡 | Only when no payments are recorded. |
| POST | `/invoices/:id/payments` | 👤 | Record a payment. Customers may settle their own invoice from the portal. |
| GET | `/invoices/payments` | 👤 | Payment ledger, scoped by role. |

Payments exceeding the outstanding balance are rejected with `400` naming the balance.

---

## Maintenance contracts — `/contracts`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/contracts/plans` | 🌐 | Public plan catalogue — powers the pricing page. |
| POST | `/contracts/plans` | 🛡 | Create a plan. |
| PATCH | `/contracts/plans/:id` | 🛡 | Update a plan. |
| GET | `/contracts` | 👤 | Filters: `status`, `expiringWithin` (days), `limit`. |
| POST | `/contracts` | 👤 | Enrol. Customers may only create their own; one live contract each. |
| GET | `/contracts/:id` | 👤 | With the visit schedule populated. |
| POST | `/contracts/:id/renew` | 👤 | New term starts where the old one ends — no coverage gap. |
| POST | `/contracts/:id/cancel` | 👤 | Cancels and disables auto-renew. |
| PATCH | `/contracts/:id/auto-renew` | 👤 | `{ autoRenew: boolean }`. |
| POST | `/contracts/reminders` | 🧰 | Sweep the 60-day window and notify anyone not chased in the last 30 days. |

---

## Users — `/users`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/users` | 🧰 | Filters: `role`, `status`, `search`, `limit`. |
| GET | `/users/technicians` | 🧰 | Roster with each technician's job count for today. |
| POST | `/users` | 🛡 | Provision any role, including staff. |
| GET | `/users/:id` | 🧰 | For customers, returns the full account history (requests, jobs, invoices, contract, lifetime value). |
| PATCH | `/users/:id` | 🛡 | Update details. Sub-documents merge rather than replace. |
| PATCH | `/users/:id/technician-status` | 🛠🧰🛡 | Availability. Pass `me` as the id to update yourself. |
| DELETE | `/users/:id` | 🛡 | **Soft delete** — deactivates so history survives. Cannot self-deactivate. |

---

## Analytics — `/analytics`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/analytics/overview` | 🛡 | Everything the analytics dashboard needs, in one aggregate. |
| GET | `/analytics/dispatch` | 🧰 | Today's job count, unassigned count, open emergencies, technician availability. |
| GET | `/analytics/customer` | 👤 | Open requests, next visit, balance due, contract. |
| GET | `/analytics/technician` | 🛠 | Today's jobs, completions, hours this week, rating. |

<details>
<summary><code>GET /analytics/overview</code> — shape</summary>

```jsonc
{
  "revenue":   { "today": 4421, "month": 4421, "lastMonth": 2671, "growthPercent": 65.6,
                 "lifetime": 72960, "outstanding": 6206, "outstandingCount": 13 },
  "jobs":      { "completed": 91, "pending": 3, "inProgress": 6, "unassigned": 1,
                 "total": 100, "byStatus": {} },
  "requests":  { "open": 19, "total": 126, "byStatus": {} },
  "contracts": { "active": 11, "expiring": 3, "expired": 0, "recurringValue": 9116 },
  "people":    { "customers": 25, "technicians": 6 },
  "charts": {
    "revenueByMonth":        [{ "label": "Sep", "value": 6172 }],
    "customersByMonth":      [{ "label": "Sep", "value": 2 }],
    "serviceMix":            [{ "label": "repair", "value": 40 }],
    "technicianPerformance": [{ "_id": "…", "name": "Aaliyah Brooks", "completed": 22, "hours": 61, "rating": 5 }]
  },
  "recentJobs": []
}
```
</details>

---

## Notifications, contact, equipment, testimonials

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/notifications` | 👤 | `{ notifications, unreadCount }`. Filter `unread=true`. |
| PATCH | `/notifications/:id/read` | 👤 | Mark one read. |
| PATCH | `/notifications/read-all` | 👤 | Mark all read. |
| POST | `/contact` | 🌐 | Website enquiry form. Notifies admins. |
| GET | `/contact-messages` | 🧰 | Enquiry inbox. Filter `status`. |
| PATCH | `/contact-messages/:id` | 🧰 | Move status. |
| GET | `/equipment` | 🧰 | Catalogue. Filters `category`, `search`. |
| POST | `/equipment` | 🛡 | Add an item. |
| PATCH | `/equipment/:id` | 🛡 | Update an item. |
| GET | `/testimonials` | 🌐 | Published customer stories. |
| GET | `/health` | 🌐 | Service heartbeat. |

---

## Status codes

| Code | Meaning in this API |
| --- | --- |
| `200` / `201` | Success |
| `400` | Validation failure — `details` carries per-field messages |
| `401` | Missing, invalid or expired token, or a deactivated account |
| `403` | Authenticated but not permitted (wrong role, or another customer's record) |
| `404` | Not found — also returned instead of `403` where existence itself is private |
| `409` | Conflict — duplicate email, technician double-booked, job already invoiced, customer already holds a contract |
| `500` | Unexpected server error. Details are suppressed in production |

## Error handling

`middleware/errorHandler.ts` normalises everything into the standard envelope:

- `ApiError` → its own status and message
- Mongoose `ValidationError` → `400` with a per-field `details` map
- Mongoose `CastError` → `400` naming the offending path
- Duplicate key (`11000`) → `409` naming the duplicated field
- Anything else → `500`, with the real message hidden when `NODE_ENV=production`
