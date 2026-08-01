# Entity Relationship Diagram

ServiceFlow — ArcticAir HVAC Solutions

Rendered with Mermaid. GitHub displays these natively; VS Code needs the Markdown Preview Mermaid
extension.

---

## Full ER diagram

```mermaid
erDiagram
    USER ||--o{ SERVICE_REQUEST : "raises"
    USER ||--o{ QUOTATION : "receives"
    USER ||--o{ JOB : "is customer of"
    USER ||--o{ JOB : "is technician on"
    USER ||--o{ INVOICE : "is billed"
    USER ||--o{ PAYMENT : "makes"
    USER ||--o{ MAINTENANCE_CONTRACT : "holds"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ QUOTATION : "creates (staff)"

    SERVICE_REQUEST ||--o| QUOTATION : "is priced by"
    SERVICE_REQUEST ||--o| JOB : "becomes"

    QUOTATION ||--o| JOB : "authorises"
    QUOTATION ||--o| INVOICE : "is billed as"

    JOB ||--o| INVOICE : "generates"
    JOB }o--o| MAINTENANCE_CONTRACT : "fulfils visit of"

    INVOICE ||--o{ PAYMENT : "is settled by"

    MAINTENANCE_PLAN ||--o{ MAINTENANCE_CONTRACT : "is basis for"
    MAINTENANCE_CONTRACT ||--o| MAINTENANCE_CONTRACT : "renews into"

    EQUIPMENT }o--o{ QUOTATION : "priced on line items"
    EQUIPMENT }o--o{ INVOICE : "billed on line items"

    USER {
        ObjectId _id PK
        string   name
        string   email UK
        string   password "bcrypt, select:false"
        string   phone
        enum     role "customer|technician|dispatcher|admin"
        string   avatarUrl
        boolean  isActive
        date     lastLoginAt
        object   customer "sub-doc: address, propertyType, companyName, customerSince, preferredContact"
        object   technician "sub-doc: employeeId, skills[], certifications[], serviceAreas[], status, rating, jobsCompleted, hourlyRate, shift"
        date     createdAt
    }

    SERVICE_REQUEST {
        ObjectId _id PK
        string   trackingCode UK "SR-7K4M2Q"
        ObjectId customer FK "null for guest submissions"
        object   contact "name, email, phone"
        enum     serviceType "installation|repair|maintenance|inspection|duct-cleaning|thermostat|emergency"
        enum     propertyType "residential|commercial"
        string   title
        string   description
        enum     priority "low|normal|high|emergency"
        enum     status "submitted|reviewing|quoted|approved|scheduled|in_progress|completed|cancelled"
        date     preferredDate
        enum     preferredWindow "morning|afternoon|evening|anytime"
        object   address
        array    photos "url, publicId, caption"
        string   systemBrand
        string   systemAge
        array    timeline "status, note, at, by"
        ObjectId quotation FK
        ObjectId job FK
        date     createdAt
    }

    QUOTATION {
        ObjectId _id PK
        string   quoteNumber UK "QT-2026-0042"
        ObjectId serviceRequest FK
        ObjectId customer FK
        array    lineItems "kind, description, quantity, unitPrice"
        number   laborTotal "derived"
        number   equipmentTotal "derived"
        number   subtotal "derived"
        enum     discountType "none|percent|fixed"
        number   discountValue
        number   discountAmount "derived"
        number   taxRate
        number   taxAmount "derived"
        number   total "derived"
        enum     status "draft|sent|accepted|rejected|expired"
        date     validUntil
        string   notes
        string   terms
        string   rejectionReason
        date     sentAt
        date     respondedAt
        ObjectId createdBy FK
    }

    JOB {
        ObjectId _id PK
        string   jobNumber UK "JOB-2026-0007"
        ObjectId serviceRequest FK
        ObjectId quotation FK
        ObjectId contract FK
        ObjectId customer FK
        ObjectId technician FK
        string   title
        string   serviceType
        enum     priority
        enum     status "unassigned|assigned|en_route|in_progress|on_hold|completed|cancelled"
        object   address
        date     scheduledStart
        date     scheduledEnd
        date     startedAt
        date     completedAt
        array    checklist "label, done"
        array    photos "url, caption, phase(before|after), uploadedAt"
        object   report "summary, workPerformed, partsUsed[], recommendations, laborHours"
        object   signature "url, signedBy, signedAt"
        array    notes "text, by, at"
        array    timeline "status, note, at, by"
        ObjectId invoice FK
    }

    INVOICE {
        ObjectId _id PK
        string   invoiceNumber UK "INV-2026-0087"
        ObjectId customer FK
        ObjectId job FK
        ObjectId quotation FK
        ObjectId contract FK
        array    lineItems
        number   subtotal "derived"
        number   discountAmount
        number   taxRate
        number   taxAmount "derived"
        number   total "derived"
        number   amountPaid
        number   balance "derived"
        enum     status "draft|sent|partial|paid|overdue|void"
        date     issueDate
        date     dueDate
        date     paidAt
        string   notes
    }

    PAYMENT {
        ObjectId _id PK
        string   paymentNumber UK "PAY-2026-0031"
        ObjectId invoice FK
        ObjectId customer FK
        number   amount
        enum     method "card|cash|check|bank_transfer|online"
        enum     status "pending|succeeded|failed|refunded"
        string   reference
        date     paidAt
        ObjectId recordedBy FK
    }

    MAINTENANCE_PLAN {
        ObjectId _id PK
        string   slug UK
        string   name
        string   tagline
        number   priceMonthly
        number   priceAnnual
        number   visitsPerYear
        number   responseHours
        number   repairDiscountPercent
        array    features
        boolean  isPopular
        boolean  isActive
        number   sortOrder
    }

    MAINTENANCE_CONTRACT {
        ObjectId _id PK
        string   contractNumber UK "MC-2025-0001"
        ObjectId customer FK
        ObjectId plan FK
        string   planName "denormalised snapshot"
        enum     billingCycle "monthly|annual"
        number   amount
        date     startDate
        date     endDate
        enum     status "pending|active|expiring|expired|cancelled"
        boolean  autoRenew
        number   visitsTotal
        number   visitsUsed
        array    visits "scheduledDate, status, job, completedAt"
        array    remindersSent "type, at"
        ObjectId renewedFrom FK
        date     cancelledAt
    }

    EQUIPMENT {
        ObjectId _id PK
        string   sku UK
        string   name
        enum     category "ac-unit|furnace|heat-pump|thermostat|air-handler|ductwork|filter|part"
        string   brand
        string   modelNumber
        number   unitPrice
        string   unit
        number   stock
        number   reorderLevel
        array    specs "label, value"
        boolean  isActive
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        enum     type "request_confirmed|technician_assigned|appointment_reminder|quotation_sent|quotation_approved|quotation_rejected|invoice_generated|payment_received|maintenance_due|contract_renewal|job_completed|system"
        string   title
        string   message
        string   link
        boolean  read
        date     readAt
        object   meta
        date     createdAt
    }

    CONTACT_MESSAGE {
        ObjectId _id PK
        string   name
        string   email
        string   phone
        string   subject
        string   message
        enum     status "new|read|responded|archived"
        date     createdAt
    }

    TESTIMONIAL {
        ObjectId _id PK
        string   author
        string   role
        string   city
        number   rating
        string   quote
        string   serviceType
        boolean  isPublished
    }
```

---

## Simplified core relationships

The commercial spine of the system, stripped of supporting entities:

```mermaid
erDiagram
    CUSTOMER ||--o{ SERVICE_REQUEST : raises
    SERVICE_REQUEST ||--o| QUOTATION : "priced by"
    QUOTATION ||--o| JOB : "approved into"
    TECHNICIAN ||--o{ JOB : performs
    JOB ||--o| INVOICE : generates
    INVOICE ||--o{ PAYMENT : "settled by"
    CUSTOMER ||--o| CONTRACT : holds
    PLAN ||--o{ CONTRACT : "basis for"
    CONTRACT ||--o{ JOB : "schedules visits"
```

---

## Cardinality notes

| Relationship | Cardinality | Rationale |
| --- | --- | --- |
| Service request → Quotation | 1 : 0..1 | One live estimate per request. A rejected quote is superseded by a new request, keeping the audit trail honest. |
| Quotation → Job | 1 : 0..1 | A job is only created once the customer approves. |
| Job → Invoice | 1 : 0..1 | Guarded server-side: `createInvoice` rejects a job that already carries an invoice. |
| Invoice → Payment | 1 : 0..n | Partial payments are first-class; the balance is recomputed on every write. |
| Customer → Contract | 1 : 0..n over time, 1 : 0..1 live | `createContract` rejects a second `active`/`expiring` contract for the same customer. |
| Contract → Contract | 1 : 0..1 | `renewedFrom` chains renewal history without duplicating the record. |
| Job → Technician | 0..1 : 1 | A job can sit unassigned in the dispatch queue. Overlapping assignments are rejected with `409`. |

## Denormalisation decisions

Three fields are deliberately duplicated:

- **`MaintenanceContract.planName`** — a snapshot of the plan name at signing. If the plan is later
  renamed or repriced, historical contracts still say what the customer actually bought.
- **`Job.address`** and **`Job.serviceType`** — copied from the service request so the technician's
  view needs no join, and so an address correction on a later request never rewrites the record of
  where someone was actually sent.
- **`ServiceRequest.contact`** — captured at submission, because a guest may not have an account and
  a customer may later change their profile details.
