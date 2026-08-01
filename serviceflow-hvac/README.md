# ServiceFlow™ — HVAC Service Management System

Client: ArcticAir HVAC Solutions
Built by: BranDive Media Solutions — Web Dev Internship, Week 1 Sprint

## Tech Stack
- Frontend: React.js / Next.js + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB
- Auth: JWT
- Hosting: Vercel (frontend) + Hostinger VPS (backend)

## Folder Structure
```
serviceflow-hvac/
├── client/          # Next.js frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── dashboards/{customer,technician,dispatcher,admin}/
│       ├── lib/
│       ├── styles/
│       └── hooks/
├── server/          # Express backend
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── models/
│       ├── middleware/
│       ├── config/
│       └── utils/
└── docs/            # ER diagram, flow diagram, screenshots
```

## Setup
1. `cd client && npm install && npm run dev`
2. `cd server && npm install && npm run dev`
3. Copy `server/.env.example` to `server/.env` and fill in values.

## User Roles
Guest, Customer, Technician, Dispatcher, Administrator — see docs/ for full permission breakdown.
