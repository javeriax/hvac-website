# Test Plan

ServiceFlow / ArcticAir HVAC. Every case below traces back to something the brief
asked for, so passing this plan means the brief is met.

**Environment:** API on `localhost:5050`, site on `localhost:3000`, seeded database.
**Accounts:** all use password `ArcticAir#2026`.

| Ref | Meaning |
| --- | --- |
| M1..M9 | Module number from the brief |
| R | Role permission from the brief |
| NF | Non-functional requirement |
| AC | Client acceptance criteria |

---

## 1. Authentication and access control

| # | Test | Expected | Ref |
| --- | --- | --- | --- |
| A1 | Register a new customer | Account created, signed in, lands on customer dashboard | R-Guest |
| A2 | Register with an email already in use | Rejected, 409, clear message | R-Guest |
| A3 | Register with a password under 8 chars | Rejected before submit | NF-Secure |
| A4 | Sign in with each of the 4 roles | Each lands on its own dashboard | R-All |
| A5 | Sign in with a wrong password | 401, no session created | NF-Secure |
| A6 | Customer opens `/dashboard/admin` | Redirected to customer dashboard | NF-Secure |
| A7 | Technician calls the admin analytics API | 403 | NF-Secure |
| A8 | Anonymous user opens any dashboard URL | Sent to login, returned after signing in | NF-Secure |
| A9 | Customer A opens customer B's invoice | 403 or 404, never the data | NF-Secure |
| A10 | Sign out | Session cleared, dashboards no longer reachable | NF-Secure |
| A11 | Change password, then sign in with the new one | Works, old password rejected | NF-Secure |

## 2. Corporate website (M1)

| # | Test | Expected |
| --- | --- | --- |
| W1 | All 9 required pages load | Home, About, Services, Maintenance Plans, Emergency, Testimonials, Service Areas, Request Quote, Contact all return 200 |
| W2 | FAQ page loads | Required by the suggested-pages list |
| W3 | Every navbar and footer link resolves | No 404s |
| W4 | Plans shown on the site come from the database | Editing a plan in admin changes the public page |
| W5 | Testimonials come from the database | Not hard-coded |
| W6 | Contact form submits | Appears in the admin message inbox |
| W7 | Coverage checker | Known city returns covered, unknown returns not covered |
| W8 | Emergency phone links | `tel:` links present and correct |

## 3. Service requests (M2)

| # | Test | Expected |
| --- | --- | --- |
| S1 | Guest submits a request without an account | Accepted, tracking code returned |
| S2 | Signed-in customer submits | Request auto-linked to their account |
| S3 | Submit with photos attached | Photos upload and appear on the request |
| S4 | Try to advance the wizard with an empty required field | Blocked with a field-level error |
| S5 | Choose a preferred date and window | Stored and shown to dispatch |
| S6 | Select service type "emergency" | Priority forced to emergency, warning shown to call instead |
| S7 | Track a request by code, signed out | Status, stage and timeline visible |
| S8 | Track with a bad code | Clean "not found" message, no crash |
| S9 | Tracking response leaks nothing private | No full address, no invoice data |
| S10 | Customer cancels an open request | Status becomes cancelled |
| S11 | Customer tries to cancel an in-progress job | Blocked with an explanation |
| S12 | Customer sees only their own requests | List scoped correctly |

## 4. Quotations (M3)

| # | Test | Expected |
| --- | --- | --- |
| Q1 | Dispatcher builds a quote with labour and parts | Saved as draft |
| Q2 | Add equipment from the catalogue | Price pulled from the catalogue |
| Q3 | Apply a percentage discount | Discount, tax and total recomputed correctly |
| Q4 | Apply a fixed discount larger than subtotal | Capped at subtotal, never negative |
| Q5 | Totals are computed server-side | Tampered client totals are ignored |
| Q6 | Draft is invisible to the customer | Not in their list, detail 404s |
| Q7 | Send the quote | Customer notified, request moves to "quoted" |
| Q8 | Customer accepts | Status accepted, request approved, staff notified |
| Q9 | Customer rejects with a reason | Status rejected, reason stored and shown to staff |
| Q10 | Edit a quote after the customer responded | Blocked |
| Q11 | Respond to an expired quote | Blocked, quote marked expired |
| Q12 | Customer responds to someone else's quote | 403 |
| Q13 | Delete a sent quote | Blocked, drafts only |

## 5. Technician dashboard (M4)

| # | Test | Expected |
| --- | --- | --- |
| T1 | Today view lists only that technician's jobs | Scoped correctly |
| T2 | Open a job, see customer details and the reported fault | All present |
| T3 | Navigate to the job location | Maps link opens with the right address |
| T4 | Status: assigned to en route to in progress | Each transition saves and shows in the timeline |
| T5 | Complete without a report | Blocked with a clear reason |
| T6 | Submit a service report | Saved, visible to the customer |
| T7 | Tick checklist items | Persist across reload |
| T8 | Upload before and after photos | Both groups stored and labelled |
| T9 | Capture a signature | Saved, shown on the job and the customer's report |
| T10 | Add a service note | Saved with a timestamp |
| T11 | Complete the job after a report exists | Succeeds, customer and admin notified |
| T12 | Change own availability | Reflected on the dispatch board |
| T13 | Open a job assigned to someone else | 403 |

## 6. Dispatcher dashboard (M5)

| # | Test | Expected |
| --- | --- | --- |
| D1 | Board shows today's jobs, unassigned count, emergencies | Numbers match the data |
| D2 | Technician lanes show today's schedule | Jobs positioned by time |
| D3 | Assign a technician to an unassigned job | Job assigned, both parties notified |
| D4 | Assign a technician who is already booked at that time | Rejected with 409 naming the clash |
| D5 | Reschedule a job | New time saved, customer notified |
| D6 | Emergency queue lists open emergencies only | Completed ones excluded |
| D7 | Technician availability is visible | Status per technician |
| D8 | Week calendar navigates back and forward | Correct jobs per week |
| D9 | Create a job from an approved request | Job created and linked |
| D10 | Requests can be filtered and searched | Buckets and search work |

## 7. Maintenance contracts (M6)

| # | Test | Expected |
| --- | --- | --- |
| C1 | Admin creates and edits a plan | Saved, visible on the public site |
| C2 | Customer enrols in a plan | Contract created with a visit schedule |
| C3 | Enrol twice | Blocked, one live contract per customer |
| C4 | Visit schedule spread across the term | Correct number of visits |
| C5 | Renew a contract | New term starts where the old one ended |
| C6 | Toggle auto-renew | Saved |
| C7 | Cancel a contract | Status cancelled, auto-renew off |
| C8 | Contracts within 60 days show as expiring | Renewal queue populated |
| C9 | Send renewal reminders | Notifications created, no duplicates within 30 days |

## 8. Invoices and payments (M7)

| # | Test | Expected |
| --- | --- | --- |
| I1 | Generate an invoice from a completed job | Line items pulled from the accepted quote |
| I2 | Invoice the same job twice | Blocked with 409 |
| I3 | Draft invoice hidden from the customer | Not in their list |
| I4 | Issue the invoice | Customer notified, visible to them |
| I5 | Record a partial payment | Status partial, balance reduced |
| I6 | Pay the remaining balance | Status paid, balance zero |
| I7 | Pay more than the balance | Rejected |
| I8 | Void an invoice with payments on it | Blocked |
| I9 | Void a clean invoice | Status void, excluded from revenue |
| I10 | Overdue invoices flagged | Past due date and unpaid shows overdue |
| I11 | Print an invoice | Print layout clean, no navigation |
| I12 | Customer pays from their portal | Works, balance updates |
| I13 | Payment history listed on the invoice | All payments shown |

## 9. Analytics (M8)

| # | Test | Expected |
| --- | --- | --- |
| N1 | Daily revenue | Matches payments taken today |
| N2 | Monthly revenue and growth | Correct against last month |
| N3 | Completed vs pending jobs | Matches job records |
| N4 | Technician performance | Ranked by completed jobs, hours shown |
| N5 | Customer growth chart | 12 months, no gaps |
| N6 | Maintenance contract stats | Active, expiring, expired counts correct |
| N7 | Most requested services | Ordered by count |
| N8 | Charts are interactive | Hover shows values, tabs switch series |
| N9 | Outstanding balance | Matches unpaid invoices |

## 10. Notifications (M9)

| # | Test | Expected |
| --- | --- | --- |
| X1 | Request confirmation | Customer notified on submit |
| X2 | Technician assigned | Both technician and customer notified |
| X3 | Appointment reminder / reschedule | Customer notified |
| X4 | Quotation approved | Staff notified |
| X5 | Invoice generated | Customer notified |
| X6 | Maintenance due | Customer notified from the reminder sweep |
| X7 | Unread count | Badge matches unread notifications |
| X8 | Mark one read / mark all read | Count updates |
| X9 | Notification links | Each opens the right page |

## 11. Non-functional

| # | Test | Expected | Ref |
| --- | --- | --- | --- |
| F1 | Mobile 375px | No horizontal scroll, nav collapses, tables scroll inside their container | NF-Responsive |
| F2 | Tablet 768px | Layouts adapt | NF-Responsive |
| F3 | Production build | Compiles, reasonable bundle size | NF-Fast |
| F4 | Passwords hashed, never returned by the API | bcrypt, `password` absent from responses | NF-Secure |
| F5 | Dark and light theme | Both readable, no flash on load | NF-Easy |
| F6 | Keyboard navigation | Focus visible, forms usable without a mouse | NF-Easy |
| F7 | Server errors surface as messages | No raw stack traces in the UI | NF-Easy |
| F8 | API down | UI shows a clear message rather than hanging | NF-Easy |
| F9 | No console errors in normal use | Clean console | NF-Easy |

## 12. Acceptance criteria from the brief

| # | Criterion | How it is proven |
| --- | --- | --- |
| AC1 | Customers request services and quotations online | S1, S2, Q8 |
| AC2 | Dispatchers assign and schedule efficiently | D3, D4, D8 |
| AC3 | Technicians manage daily jobs | T1 to T11 |
| AC4 | Quotations, invoices, contracts managed centrally | Q, I and C sections |
| AC5 | Management monitors performance | N section |
| AC6 | Scalable for future growth | Documented model and API structure |

---

## Results

See [TEST-RESULTS.md](TEST-RESULTS.md) for the run and the defects found.
