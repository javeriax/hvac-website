# Test Results

Run against the seeded database with both servers up.
Plan: [TEST-PLAN.md](TEST-PLAN.md).

## Summary

| Suite | Cases | Result |
| --- | --- | --- |
| API workflow (suite 1) | 55 | all passed |
| API edge cases and analytics cross-check (suite 2) | 35 | all passed |
| Route render sweep (49 routes incl. dynamic detail pages) | 49 | all passed |
| Responsive checks | 6 pages at 375px | 1 defect found and fixed |
| Browser console | key dashboard pages | no errors |
| Build | client and server | both compile |

**Total: 139 automated checks, 0 failing.**

## How the suites are run

Each suite mutates data, so reseed before each one:

```bash
npm --prefix server run seed:reset
```

Suite 1 walks the full business flow end to end (guest request through to a
settled invoice). Suite 2 covers permission boundaries, money edge cases and
cross-checks every analytics figure against the raw collections.

## Defects found and fixed

**1. Horizontal overflow on mobile (dispatcher board)**
Emergency queue cards pushed the page 94px wider than a 375px screen. Long
request titles could not shrink because the flex children were missing
`min-w-0`, so `truncate` never took effect. Added `min-w-0` and wrapped the
location line in a truncating span. Page now measures 0px overflow.

**2. Registration promised auto-linking that did not exist**
The register and tracking screens both told users that requests raised with the
same email would link to a new account automatically. Nothing implemented it.
A `/service-requests/claim` endpoint existed but no screen ever called it, so
the feature was unreachable. Registration now attaches any guest request that
used the same email, reports the count, and mentions it in the welcome
notification. Verified: two guest requests, register with that email, both
appear in the new account.

**3. Dead endpoint removed**
With auto-linking in place, `POST /service-requests/claim` and its controller
were unreachable code. Removed.

**4. Internal jargon shown to customers**
The customer quotations screen carried the subtitle "Drafts are hidden until we
send them to you". Customers have no concept of a draft, so it raised a question
rather than answering one. Removed.

## Verified as correct (no change needed)

- **Analytics figures.** Lifetime revenue, daily revenue, completed jobs and
  outstanding balance were each recomputed from the raw payment, job and invoice
  collections and matched the API to within a rounding penny.
- **Money maths.** Totals are always recomputed server-side. A quotation posted
  with `total: 99999` still saved at its true line-item value. An oversized fixed
  discount clamps to the subtotal instead of producing a negative total.
- **Permission boundaries.** Customers cannot read another customer's invoice or
  request, technicians cannot open a job assigned to someone else, and the public
  tracking response excludes the address and contact details.
- **Business rules.** A job cannot close without a report, a technician cannot be
  double-booked, a job cannot be invoiced twice, a paid invoice cannot be voided,
  and a quotation becomes immutable once the customer responds.
- **Wide tables.** Every table sits in a container that scrolls on its own, so no
  dashboard page scrolls sideways on a phone.

## False alarm worth recording

An early responsive sweep reported 13px of overflow on `/maintenance-plans`. It
was measuring pages inside hidden iframes, and the measurement ran before the
dev server had injected its CSS, so the comparison table was briefly unstyled.
Re-measured on the real page: 0px overflow, `min-width: 736px` and
`overflow-x: auto` both applied correctly. No code change was needed. Noted here
because the same mistake is easy to repeat.

## Not covered by automation

These were checked by hand in the browser rather than scripted:

- Signature capture drawing (canvas pointer events)
- Photo upload to Cloudinary from the request wizard and the job screen
- Print layout for quotations and invoices
- Theme switch with no flash on first paint
