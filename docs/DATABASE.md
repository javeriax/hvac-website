# Database Schema

ServiceFlow — MongoDB (Mongoose 8). Twelve collections.
The visual relationship map is in [ER-DIAGRAM.md](ER-DIAGRAM.md).

---

## Conventions used throughout

- **`_id`** — MongoDB `ObjectId`, primary key on every collection.
- **`createdAt` / `updatedAt`** — added automatically by `{ timestamps: true }`.
- **Derived money fields** (`subtotal`, `taxAmount`, `total`, `balance`) are never trusted from the
  client. A `pre('validate')` hook recomputes them from the line items on every save.
- **Document numbers** are year-scoped and zero-padded: `QT-2026-0042`, `INV-2026-0087`,
  `JOB-2026-0007`, `MC-2025-0001`, `PAY-2026-0031`.
- **Tracking codes** use a 32-character alphabet with `I`, `O`, `0` and `1` removed, so a customer
  reading one over the phone cannot produce an ambiguous character: `SR-7K4M2Q`.

---

## 1. `users`

All five roles live in one collection, with role-specific data in optional sub-documents. A single
collection keeps authentication, RBAC and the "who did this" references on every other document
uniform.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | Required |
| `email` | String | Required, **unique**, lower-cased, format-validated |
| `password` | String | Required, min 8, bcrypt-hashed in a `pre('save')` hook, `select: false` |
| `phone` | String | |
| `role` | Enum | `customer` \| `technician` \| `dispatcher` \| `admin`. Indexed |
| `avatarUrl` | String | |
| `isActive` | Boolean | Default `true`. Deactivation replaces deletion |
| `lastLoginAt` | Date | Written on successful sign-in |
| `customer` | Sub-doc | Only on customers — see below |
| `technician` | Sub-doc | Only on technicians — see below |

**`customer` sub-document**

| Field | Type | Notes |
| --- | --- | --- |
| `address` | Object | `line1`, `line2?`, `city`, `state`, `zip` — all required except `line2` |
| `propertyType` | Enum | `residential` \| `commercial` |
| `companyName` | String | Commercial accounts |
| `customerSince` | Date | |
| `preferredContact` | Enum | `phone` \| `email` \| `sms` |

**`technician` sub-document**

| Field | Type | Notes |
| --- | --- | --- |
| `employeeId` | String | e.g. `AA-T001` |
| `skills` | [String] | Drives assignment ranking |
| `certifications` | [String] | NATE, EPA 608, OSHA 30 |
| `serviceAreas` | [String] | Cities covered |
| `status` | Enum | `available` \| `on_job` \| `off_duty` \| `on_leave` |
| `rating` | Number | 0–5 |
| `jobsCompleted` | Number | Incremented when a job closes |
| `hourlyRate` | Number | |
| `shiftStart` / `shiftEnd` | String | `"08:00"` format |
| `hiredAt` | Date | |

**Methods:** `comparePassword(candidate)` → `Promise<boolean>`.
**Transform:** `toJSON` deletes `password` so it can never leak through a response.

---

## 2. `servicerequests`

The intake record. Everything downstream — quotation, job, invoice — traces back to one of these.

| Field | Type | Notes |
| --- | --- | --- |
| `trackingCode` | String | Required, **unique**, indexed. Public lookup key |
| `customer` | ObjectId → `users` | **Nullable** — guests can submit without an account |
| `contact` | Object | `name`, `email`, `phone`. Captured at submission |
| `serviceType` | Enum | `installation` \| `repair` \| `maintenance` \| `inspection` \| `duct-cleaning` \| `thermostat` \| `emergency`. Indexed |
| `propertyType` | Enum | `residential` \| `commercial` |
| `title` | String | Auto-generated if the customer leaves it blank |
| `description` | String | Required |
| `priority` | Enum | `low` \| `normal` \| `high` \| `emergency`. Indexed. Forced to `emergency` when `serviceType` is `emergency` |
| `status` | Enum | See the state machine in [SYSTEM-FLOW.md](SYSTEM-FLOW.md#3-service-request-state-machine). Indexed |
| `preferredDate` | Date | |
| `preferredWindow` | Enum | `morning` \| `afternoon` \| `evening` \| `anytime` |
| `address` | Object | Service location — may differ from the profile address |
| `photos` | [Object] | `url`, `publicId`, `caption` — up to 6, stored on Cloudinary |
| `systemBrand` / `systemAge` | String | Helps the technician arrive with the right parts |
| `timeline` | [Object] | `status`, `note`, `at`, `by` — append-only audit trail |
| `quotation` | ObjectId → `quotations` | |
| `job` | ObjectId → `jobs` | |

**Indexes:** `trackingCode` (unique), `customer`, `status`, `priority`, `serviceType`, `createdAt: -1`.

---

## 3. `quotations`

| Field | Type | Notes |
| --- | --- | --- |
| `quoteNumber` | String | Required, **unique**, indexed |
| `serviceRequest` | ObjectId → `servicerequests` | Required |
| `customer` | ObjectId → `users` | Required, indexed |
| `lineItems` | [Object] | `kind` (`labor`\|`equipment`\|`part`\|`fee`), `description`, `quantity`, `unitPrice`, `equipment?` |
| `laborTotal` | Number | **Derived** — sum of `labor` lines |
| `equipmentTotal` | Number | **Derived** — sum of `equipment` + `part` lines |
| `subtotal` | Number | **Derived** |
| `discountType` | Enum | `none` \| `percent` \| `fixed` |
| `discountValue` | Number | Raw input |
| `discountAmount` | Number | **Derived**, capped at `subtotal` |
| `taxRate` | Number | Default `8.25` |
| `taxAmount` | Number | **Derived** — applied after discount |
| `total` | Number | **Derived** |
| `status` | Enum | `draft` \| `sent` \| `accepted` \| `rejected` \| `expired`. Indexed |
| `validUntil` | Date | Defaults to +30 days |
| `notes` / `terms` | String | |
| `rejectionReason` | String | |
| `sentAt` / `respondedAt` | Date | |
| `createdBy` | ObjectId → `users` | The staff member who priced it |

**Methods:** `recalculate()` — invoked automatically in `pre('validate')`.

**Rules:** drafts are invisible to customers; a quotation becomes immutable once `accepted` or
`rejected`; responding to an expired quote flips it to `expired` and returns `400`.

---

## 4. `jobs`

The field record — what the technician works from and what the customer reads afterwards.

| Field | Type | Notes |
| --- | --- | --- |
| `jobNumber` | String | Required, **unique**, indexed |
| `serviceRequest` | ObjectId | Required |
| `quotation` / `contract` | ObjectId | Whichever authorised the work |
| `customer` | ObjectId → `users` | Required, indexed |
| `technician` | ObjectId → `users` | **Nullable** — unassigned jobs sit in the dispatch queue. Indexed |
| `title` / `serviceType` / `priority` | — | Denormalised from the request |
| `status` | Enum | `unassigned` \| `assigned` \| `en_route` \| `in_progress` \| `on_hold` \| `completed` \| `cancelled`. Indexed |
| `address` | Object | Snapshot — where someone was actually sent |
| `scheduledStart` / `scheduledEnd` | Date | Both required. Used for the conflict check |
| `startedAt` / `completedAt` | Date | |
| `checklist` | [Object] | `label`, `done`. Seeded per service type |
| `photos` | [Object] | `url`, `caption`, `phase` (`before`\|`after`), `uploadedAt` |
| `report` | Sub-doc | `summary`, `workPerformed`, `partsUsed[]`, `recommendations`, `laborHours`, `submittedAt` |
| `signature` | Sub-doc | `url` (Cloudinary), `signedBy`, `signedAt` |
| `notes` | [Object] | `text`, `by`, `at` |
| `timeline` | [Object] | Append-only status history |
| `invoice` | ObjectId → `invoices` | Set when billed |

**Indexes:** `jobNumber` (unique), `{ technician: 1, scheduledStart: 1 }` (compound — powers the
double-booking check), `status`, `priority`, `customer`, `scheduledStart`.

**Rules:** a job cannot move to `completed` without `report`; assignment is rejected with `409` when
`scheduledStart < existing.scheduledEnd && scheduledEnd > existing.scheduledStart` for the same
technician.

---

## 5. `invoices`

| Field | Type | Notes |
| --- | --- | --- |
| `invoiceNumber` | String | Required, **unique**, indexed |
| `customer` | ObjectId → `users` | Required, indexed |
| `job` / `quotation` / `contract` | ObjectId | Source of the line items |
| `lineItems` | [Object] | Same shape as quotation lines |
| `subtotal` / `taxAmount` / `total` / `balance` | Number | **Derived** |
| `discountAmount` | Number | |
| `taxRate` | Number | Default `8.25` |
| `amountPaid` | Number | Incremented as payments land |
| `status` | Enum | `draft` \| `sent` \| `partial` \| `paid` \| `overdue` \| `void`. Indexed |
| `issueDate` / `dueDate` | Date | `dueDate` defaults to +30 days, indexed |
| `paidAt` | Date | Set when the balance reaches zero |
| `notes` | String | |
| `createdBy` | ObjectId → `users` | |

**Methods:** `recalculate()` — recomputes totals, then transitions status: balance ≤ 0 → `paid`;
partial payment → `partial`; past `dueDate` and unpaid → `overdue`. `draft` and `void` are never
auto-transitioned.

---

## 6. `payments`

| Field | Type | Notes |
| --- | --- | --- |
| `paymentNumber` | String | Required, **unique**, indexed |
| `invoice` | ObjectId → `invoices` | Required, indexed |
| `customer` | ObjectId → `users` | Required, indexed |
| `amount` | Number | Required, > 0, cannot exceed the outstanding balance |
| `method` | Enum | `card` \| `cash` \| `check` \| `bank_transfer` \| `online` |
| `status` | Enum | `pending` \| `succeeded` \| `failed` \| `refunded` |
| `reference` | String | Cheque number, transaction ID |
| `paidAt` | Date | Indexed — every revenue aggregation keys off this |
| `recordedBy` | ObjectId → `users` | |

A separate ledger rather than an array on the invoice: payments are queried independently for
revenue reporting, and an unbounded array would eventually strain the document.

---

## 7. `maintenanceplans`

The catalogue rendered on the public pricing page and configurable at `/dashboard/admin/plans`.

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | String | Required, **unique**, lower-case |
| `name` / `tagline` | String | |
| `priceMonthly` / `priceAnnual` | Number | Required |
| `visitsPerYear` | Number | Required — drives the generated visit schedule |
| `responseHours` | Number | Contractual response guarantee |
| `repairDiscountPercent` | Number | |
| `features` | [String] | Rendered as the feature list |
| `isPopular` / `isActive` | Boolean | |
| `sortOrder` | Number | Display order |

Seeded plans: Essential Care, Comfort Plus (popular), Elite Total Care, Commercial Assurance.

---

## 8. `maintenancecontracts`

| Field | Type | Notes |
| --- | --- | --- |
| `contractNumber` | String | Required, **unique**, indexed |
| `customer` | ObjectId → `users` | Required, indexed |
| `plan` | ObjectId → `maintenanceplans` | Required |
| `planName` | String | **Denormalised snapshot** — survives a later rename or reprice |
| `billingCycle` | Enum | `monthly` \| `annual` |
| `amount` | Number | Price at signing |
| `startDate` / `endDate` | Date | `endDate` indexed for the renewal sweep |
| `status` | Enum | `pending` \| `active` \| `expiring` \| `expired` \| `cancelled`. Indexed |
| `autoRenew` | Boolean | Customer-controllable |
| `visitsTotal` / `visitsUsed` | Number | |
| `visits` | [Object] | `scheduledDate`, `status`, `job?`, `completedAt?`, `notes?` — spread evenly across the term |
| `remindersSent` | [Object] | `type`, `at` — prevents duplicate chasing |
| `renewedFrom` | ObjectId → self | Chains renewal history |
| `cancelledAt` | Date | |

**Virtual:** `daysRemaining`.
**Methods:** `refreshStatus()` — `< 0` days → `expired`, `≤ 60` → `expiring`, else `active`.
**Rule:** a customer may hold only one `active`/`expiring` contract at a time.

---

## 9. `equipment`

| Field | Type | Notes |
| --- | --- | --- |
| `sku` | String | Required, **unique**, upper-cased |
| `name` | String | Required |
| `category` | Enum | `ac-unit` \| `furnace` \| `heat-pump` \| `thermostat` \| `air-handler` \| `ductwork` \| `filter` \| `part`. Indexed |
| `brand` | String | Required |
| `modelNumber` | String | Named this rather than `model` — `model` collides with Mongoose's `Document.model` |
| `description` | String | |
| `unitPrice` | Number | Required. Feeds the quotation builder search |
| `unit` | String | Default `each` |
| `stock` / `reorderLevel` | Number | Drives the low-stock warning |
| `specs` | [Object] | `label`, `value` |
| `isActive` | Boolean | |

---

## 10. `notifications`

| Field | Type | Notes |
| --- | --- | --- |
| `user` | ObjectId → `users` | Required, indexed |
| `type` | Enum | 12 values — see the ER diagram |
| `title` / `message` | String | Required |
| `link` | String | Deep link into the relevant dashboard page |
| `read` / `readAt` | Boolean / Date | Indexed on `read` |
| `meta` | Mixed | Free-form payload |

**Index:** `{ user: 1, createdAt: -1 }` — the bell's exact query shape.

---

## 11. `contactmessages`

| Field | Type | Notes |
| --- | --- | --- |
| `name` / `email` | String | Required |
| `phone` | String | |
| `subject` | String | Defaults to `General enquiry` |
| `message` | String | Required |
| `status` | Enum | `new` \| `read` \| `responded` \| `archived`. Indexed |

---

## 12. `testimonials`

| Field | Type | Notes |
| --- | --- | --- |
| `author` / `city` / `quote` | String | Required |
| `role` | String | Defaults to `Homeowner` |
| `rating` | Number | 1–5 |
| `serviceType` | String | |
| `isPublished` | Boolean | Indexed — only published ones reach the website |

---

## Aggregation pipelines

The admin analytics screen is served by a single endpoint (`GET /api/analytics/overview`) that runs
fifteen aggregations in parallel via `Promise.all`:

| Metric | Source | Approach |
| --- | --- | --- |
| Daily / monthly / lifetime revenue | `payments` | `$match` on `paidAt` range + `$group` sum |
| Month-over-month growth | `payments` | Two windowed sums compared in JS |
| Outstanding balance | `invoices` | `$match` status in `sent`/`partial`/`overdue`, sum `balance` |
| Job + request status counts | `jobs`, `servicerequests` | `$group` by `$status` |
| 12-month revenue trend | `payments` | `$group` by `{ $year, $month }`, then padded to a full 12 |
| Customer growth | `users` | Same shape, filtered to `role: customer` |
| Most requested services | `servicerequests` | `$group` by `serviceType`, `$sort` descending |
| Technician leaderboard | `jobs` | `$group` by technician → `$lookup` into `users` → `$project` |
| Contract statistics | `maintenancecontracts` | `$group` by status with a value sum |

Computing this server-side keeps the client a thin renderer and means the numbers on the dashboard
and in any future export can never disagree.
