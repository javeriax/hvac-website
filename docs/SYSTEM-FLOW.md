# System Flow Diagrams

ServiceFlow — ArcticAir HVAC Solutions

---

## 1. System architecture

```mermaid
flowchart TB
    subgraph clients["Clients"]
        guest["Guest visitor<br/>(browser)"]
        cust["Customer portal"]
        tech["Technician<br/>(mobile / tablet)"]
        disp["Dispatcher console"]
        adm["Admin dashboard"]
    end

    subgraph frontend["Next.js 14 — App Router"]
        pub["(site) route group<br/>Public marketing + intake"]
        dash["dashboard route group<br/>Role-guarded workspaces"]
        ctx["AuthProvider · ThemeProvider<br/>JWT held in localStorage"]
    end

    subgraph api["Express + TypeScript API"]
        mw["Middleware<br/>CORS · JSON · protect · requireRole"]
        ctrl["Controllers<br/>auth · requests · quotations · jobs<br/>invoices · contracts · analytics · users"]
        notify["notify service<br/>Module 9 triggers"]
        err["Central error handler"]
    end

    subgraph data["Data layer"]
        mongo[("MongoDB Atlas<br/>12 collections")]
        cloud[("Cloudinary<br/>photos + signatures")]
    end

    guest --> pub
    cust --> dash
    tech --> dash
    disp --> dash
    adm --> dash

    pub --> ctx
    dash --> ctx
    ctx -->|"fetch + Bearer token"| mw

    mw --> ctrl
    ctrl --> notify
    ctrl --> mongo
    ctrl --> cloud
    notify --> mongo
    ctrl --> err

    mongo -.->|"aggregations"| ctrl
```

---

## 2. End-to-end service lifecycle

The path a single job takes from enquiry to cash, showing which role acts at each step.

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant W as Website
    participant API as ServiceFlow API
    actor D as Dispatcher
    actor T as Technician
    actor A as Admin

    C->>W: Submit request + photos
    W->>API: POST /service-requests (multipart)
    API->>API: Generate SR-XXXXXX, upload photos
    API-->>C: Tracking code (no account needed)
    API-->>D: Notification — new request

    D->>API: POST /quotations (line items, tax, discount)
    API->>API: Recompute totals server-side
    D->>API: POST /quotations/:id/send
    API-->>C: Notification — quotation ready

    C->>API: POST /quotations/:id/respond {accept}
    API->>API: Status → accepted, request → approved
    API-->>D: Notification — approved, schedule it

    D->>API: POST /jobs {technician, start, duration}
    API->>API: Reject if technician double-booked (409)
    API-->>T: Notification — job assigned
    API-->>C: Notification — visit scheduled

    T->>API: PATCH /jobs/:id/status {en_route}
    T->>API: PATCH /jobs/:id/status {in_progress}
    T->>API: POST /jobs/:id/photos {before}
    T->>API: PATCH /jobs/:id/checklist
    T->>API: POST /jobs/:id/photos {after}
    T->>API: POST /jobs/:id/report
    T->>API: POST /jobs/:id/signature (base64 → Cloudinary)
    T->>API: PATCH /jobs/:id/status {completed}
    Note over API: Rejected unless a report exists
    API-->>C: Notification — work complete, report available
    API-->>A: Notification — ready to invoice

    A->>API: POST /invoices {job}
    Note over API: Line items pulled from the accepted quote
    A->>API: POST /invoices/:id/send
    API-->>C: Notification — invoice issued

    C->>API: POST /invoices/:id/payments
    API->>API: Recompute balance → status paid
    API-->>C: Notification — payment received
    API-->>A: Revenue reflected in analytics
```

---

## 3. Service request state machine

```mermaid
stateDiagram-v2
    [*] --> submitted: Customer or guest submits

    submitted --> reviewing: Dispatcher picks it up
    submitted --> cancelled: Customer withdraws

    reviewing --> quoted: Quotation sent
    reviewing --> cancelled: Not viable

    quoted --> approved: Customer accepts
    quoted --> reviewing: Customer declines — re-quote
    quoted --> cancelled: Customer withdraws

    approved --> scheduled: Job created
    scheduled --> in_progress: Technician starts work
    scheduled --> cancelled: Called off before the visit

    in_progress --> completed: Report submitted, job closed

    completed --> [*]
    cancelled --> [*]
```

## 4. Job state machine

```mermaid
stateDiagram-v2
    [*] --> unassigned: Created without a technician
    [*] --> assigned: Created with a technician

    unassigned --> assigned: Dispatcher assigns
    assigned --> en_route: Technician sets off
    en_route --> in_progress: Arrived on site

    in_progress --> on_hold: Parts needed / access denied
    on_hold --> in_progress: Resumed

    in_progress --> completed: Report submitted ✓
    note right of completed
        Guarded server-side —
        a job cannot close
        without a report.
    end note

    assigned --> cancelled
    unassigned --> cancelled

    completed --> [*]
    cancelled --> [*]
```

---

## 5. Authentication and authorisation

```mermaid
flowchart TD
    start(["Request hits the API"]) --> hasToken{"Authorization:<br/>Bearer token?"}

    hasToken -->|No| isPublic{"Public route?"}
    isPublic -->|Yes| handler["Run controller<br/>(guest context)"]
    isPublic -->|No| unauth["401 — authentication required"]

    hasToken -->|Yes| verify{"JWT valid<br/>and unexpired?"}
    verify -->|No| clear["401 — client clears the stale token"]
    verify -->|Yes| lookup["Load user by token subject"]

    lookup --> active{"Account active?"}
    active -->|No| forbidden401["401 — account deactivated"]
    active -->|Yes| roleCheck{"Route requires<br/>a specific role?"}

    roleCheck -->|No| handler
    roleCheck -->|Yes| hasRole{"User role<br/>permitted?"}
    hasRole -->|No| forbidden["403 — insufficient permissions"]
    hasRole -->|Yes| ownership{"Record-level<br/>ownership check"}

    ownership -->|"Customer accessing<br/>someone else's record"| forbidden
    ownership -->|"Technician accessing<br/>an unassigned job"| forbidden
    ownership -->|Permitted| handler

    handler --> respond(["{ success: true, data }"])
```

Route guards live in two places, deliberately:

- **`middleware/auth.ts`** — `protect` and `requireRole` handle coarse access (is this a dispatcher?).
- **Inside each controller** — record-level ownership (is this *your* invoice?). Keeping this in the
  controller means the check sits next to the query that loaded the document, where it cannot be
  forgotten.

---

## 6. Quotation approval flow

```mermaid
flowchart LR
    draft["Draft<br/>staff only"] -->|"POST /send"| sent["Sent<br/>visible to customer"]

    sent -->|"respond {accept}"| accepted["Accepted"]
    sent -->|"respond {reject}"| rejected["Rejected<br/>+ reason"]
    sent -->|"validUntil elapses"| expired["Expired"]

    accepted --> job["Job scheduled<br/>by dispatcher"]
    job --> invoice["Invoice generated<br/>from these line items"]

    rejected --> requote["Request returns to<br/>reviewing for a re-quote"]

    style draft fill:#2a2a2a,color:#eee
    style accepted fill:#164e3b,color:#eee
    style rejected fill:#5a2020,color:#eee
    style expired fill:#3a3a3a,color:#eee
```

Once a customer has responded, the quotation becomes immutable — `updateQuotation` rejects edits to
anything in `accepted` or `rejected`. That keeps the document a faithful record of what was actually
agreed.

---

## 7. Dispatcher assignment logic

```mermaid
flowchart TD
    A["Dispatcher opens<br/>Assign dialog"] --> B["Load technician roster<br/>GET /users/technicians"]
    B --> C["Rank candidates"]

    C --> C1["+3 skill matches service type"]
    C --> C2["+2 covers the job's city"]
    C --> C3["+1 currently available"]
    C --> C4["−0.4 per job already booked today"]

    C1 --> D["Ordered list shown<br/>with rating, load, shift"]
    C2 --> D
    C3 --> D
    C4 --> D

    D --> E["Dispatcher picks<br/>technician + time + duration"]
    E --> F["POST /jobs/:id/assign"]

    F --> G{"Overlapping job<br/>for this technician?"}
    G -->|Yes| H["409 Conflict<br/>names the clashing job"]
    G -->|No| I["Assign, set schedule,<br/>append to timeline"]

    I --> J["Notify technician"]
    I --> K["Notify customer"]

    H --> E
```

The ranking is a client-side convenience — the authoritative double-booking check runs on the
server, so it holds regardless of what the UI suggested.

---

## 8. Notification triggers (Module 9)

```mermaid
flowchart LR
    subgraph events["Domain events"]
        e1["Request submitted"]
        e2["Quotation sent"]
        e3["Quotation approved / declined"]
        e4["Technician assigned"]
        e5["Job rescheduled"]
        e6["Job completed"]
        e7["Invoice issued"]
        e8["Payment received"]
        e9["Contract renewal due"]
    end

    subgraph service["services/notify.ts"]
        n1["notify(user, …)<br/>single recipient"]
        n2["notifyRole(roles, …)<br/>fan-out to a role"]
    end

    subgraph targets["Recipients"]
        t1["Customer"]
        t2["Technician"]
        t3["Dispatcher"]
        t4["Admin"]
    end

    e1 --> n1 --> t1
    e1 --> n2 --> t3
    e2 --> n1 --> t1
    e3 --> n2 --> t3
    e3 --> n2 --> t4
    e4 --> n1 --> t2
    e4 --> n1 --> t1
    e5 --> n1 --> t1
    e6 --> n1 --> t1
    e6 --> n2 --> t4
    e7 --> n1 --> t1
    e8 --> n1 --> t1
    e9 --> n1 --> t1

    targets --> bell["Notification bell<br/>polls every 45s"]
```

Every trigger funnels through one module. That is the single seam where an email or SMS provider
would be attached — no controller would need to change.

---

## 9. Site map

```mermaid
flowchart TD
    root["/"] --> pub["Public site"]
    root --> auth["Authentication"]
    root --> dash["Dashboards"]

    pub --> p1["/services"]
    pub --> p2["/maintenance-plans"]
    pub --> p3["/service-areas"]
    pub --> p4["/about"]
    pub --> p5["/testimonials"]
    pub --> p6["/emergency"]
    pub --> p7["/faq"]
    pub --> p8["/contact"]
    pub --> p9["/request-quote"]
    pub --> p10["/track"]

    auth --> a1["/login"]
    auth --> a2["/register"]

    dash --> cu["/dashboard/customer"]
    dash --> te["/dashboard/technician"]
    dash --> di["/dashboard/dispatcher"]
    dash --> ad["/dashboard/admin"]

    cu --> cu1["requests · requests/:id"]
    cu --> cu2["quotations · quotations/:id"]
    cu --> cu3["invoices · invoices/:id"]
    cu --> cu4["contracts"]
    cu --> cu5["profile"]

    te --> te1["jobs/:id"]
    te --> te2["schedule"]
    te --> te3["history"]
    te --> te4["profile"]

    di --> di1["schedule"]
    di --> di2["requests · requests/:id"]
    di --> di3["technicians"]
    di --> di4["quotations"]

    ad --> ad1["requests"]
    ad --> ad2["quotations"]
    ad --> ad3["invoices · invoices/:id"]
    ad --> ad4["contracts"]
    ad --> ad5["customers · customers/:id"]
    ad --> ad6["technicians"]
    ad --> ad7["equipment"]
    ad --> ad8["plans"]
    ad --> ad9["messages"]
```
