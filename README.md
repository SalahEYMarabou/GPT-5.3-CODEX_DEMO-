# Timesheet Web Application

Full-stack timesheet app built with Angular 21 (frontend) and NestJS (backend), using JSON files for storage.

## Features

- Employee weekly grid (Mon–Sun) with status selection: On-Site, WFH, Leave
- Weekly submission with rule validation
- Employee history (weekly/monthly) and WFH counter
- Admin dashboard with daily counts, KPI cards, violation highlights
- Reports export to CSV and PDF
- Basic metrics: API calls, validation time, submissions/week, violations/week
- Clerk auth in real mode + automatic mock fallback

## Business Rules Enforced

- Team size = 22
- Minimum onsite per day = 8
- Maximum WFH per employee per week = 3
- No duplicate user/day entry
- Violating submissions are blocked with structured errors

## Project Structure

- `frontend/` Angular 21 standalone app using Signals + SCSS
- `backend/` NestJS REST API with JSON storage via `fs/promises`

## Run Instructions

### 1) Install dependencies

From workspace root:

```bash
npm install
```

### 2) Seed data (22 users)

```bash
npm run seed
```

### 3) Run backend

```bash
npm run dev:backend
```

Backend URL: `http://localhost:3000/api`

### 4) Run frontend

```bash
npm run dev:frontend
```

Frontend URL: `http://localhost:4200`

## Authentication Modes

### Mock mode (default)

If `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` are not set, backend runs in mock auth mode.
Frontend sends mock headers and includes a role switcher (employee/admin).

### Clerk mode

Set both keys in backend environment, then send Clerk bearer token from frontend/session.

See `backend/.env.example` for config.

## API Endpoints

- `GET /api/users`
- `GET /api/users/me`

- `POST /api/timesheets/weekly`
- `GET /api/timesheets/week?weekStart=YYYY-MM-DD`
- `GET /api/timesheets/history?mode=weekly|monthly&from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/timesheets/wfh-counter?weekStart=YYYY-MM-DD`

- `GET /api/summaries/daily?from=YYYY-MM-DD&to=YYYY-MM-DD`

- `GET /api/metrics`

- `GET /api/reports/rows?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/reports/csv?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/reports/pdf?from=YYYY-MM-DD&to=YYYY-MM-DD`

## Data Entities

### User

`id, name, email, role, createdAt, clerkUserId?`

### TimesheetEntry

`id, userId, date, status (onsite|wfh|leave), createdAt`

### DaySummary

`date, onsiteCount, wfhCount, violations[], computedAt`
