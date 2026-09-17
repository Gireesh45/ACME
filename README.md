# ACME Salary Manager

> Employee salary management platform for a 10,000-person organisation — built as part of the Incubyte Software Craftsperson assessment.

---

## Live Demo

> **Login:** `admin@acme.com` / `admin`

Run locally with the steps below — no cloud setup required.

---

## What It Does

Built for an **HR Manager** persona managing 10,000+ employees across 12 countries and 10 departments.

| Feature | Details |
|---------|---------|
| **Dashboard** | KPI cards (total/active employees, payroll, avg salary), salary-by-department bar chart, headcount-by-country donut chart |
| **Employee List** | Paginated table (25/page) with full-text search, filter by dept/country/status/gender, multi-column sort |
| **Employee Detail** | Profile, current compensation, full salary history timeline (audit trail) |
| **Add Employee** | Form with auto-currency from country, auto-positions from department, creates initial salary record |
| **Edit Employee** | Update any profile field via modal |
| **Salary Records** | Add salary updates with effective date and reason — every change is preserved in audit trail |
| **Deactivate/Reactivate** | Soft-delete preserves data and history |
| **CSV Export** | Export all employees (or filtered subset) — handles all 10,000 rows safely via cursor-batched queries |
| **Analytics** | Min/avg/max salary by department, country payroll breakdown in local currency |

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 16** (App Router, Turbopack) | Latest stable, file-based routing, server components |
| Database | **SQLite** (file-based) | Zero infra for assessment — trivially swappable to Postgres |
| ORM | **Prisma 7** + `better-sqlite3` adapter | Prisma 7 requires explicit driver adapter |
| Auth | **JWT** (via `jose`) in HTTP-only cookie | Secure, stateless, no session store needed |
| UI | **Vanilla CSS** custom design system | No framework overhead, full control |
| Charts | **Recharts** | Composable, React-native |
| Tests | **Vitest 5** | Fast, native ESM, no Jest config overhead |
| Validation | **Zod** | Schema-first, type-safe input validation |

---

## Architecture Decisions

### Salary as an Audit Trail
Every salary change creates a **new `SalaryRecord` row** — records are never updated or deleted. This gives:
- Full history of every pay change with effective date and reason
- The "current salary" is always `MAX(effectiveDate)` via a subquery join
- Supports future payroll reporting by period

### Prisma 7 Specifics
Prisma 7 introduced breaking changes that required careful handling:
- `datasource.url` moved from `schema.prisma` → `prisma.config.ts`
- `PrismaClient` now requires a **driver adapter** (`PrismaBetterSqlite3`)
- `skipDuplicates` removed from `createMany` — seed handled in batches
- CSV export hit SQLite's `P2029` query-parameter limit with 10k rows — fixed with **cursor-based batch fetching** (500/batch)

### Route Protection
A single `src/proxy.ts` (Next.js 16 middleware) intercepts all non-public routes, verifies the JWT from the HTTP-only cookie, and redirects to `/login` on failure — no per-page auth checks needed.

### No-Blink Filter UX
Split loading into two states:
- `loading` (initial) — shows skeleton rows
- `fetching` (filter/sort/page changes) — keeps previous rows visible at 55% opacity with an animated progress bar — eliminates the jarring flash on every keystroke

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# 1. Clone
git clone https://github.com/Gireesh45/ACME.git
cd ACME

# 2. Install dependencies
npm install

# 3. Create environment file
echo "JWT_SECRET=your-secret-key-here" > .env.local
echo "DATABASE_URL=file:./data/salary.db" >> .env.local

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate deploy

# 6. Seed 10,000 employees
npx ts-node --project tsconfig.json -e "require('./prisma/seed.ts')"
# or via prisma:
npx prisma db seed

# 7. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — login with `admin@acme.com` / `admin`.

### Run Tests

```bash
npm test
# 40 tests, 2 suites — utils + validation schemas
```

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                  # Authenticated route group
│   │   ├── dashboard/          # Overview + charts
│   │   ├── employees/
│   │   │   ├── page.tsx        # Employee list
│   │   │   ├── new/            # Add employee form
│   │   │   └── [id]/           # Employee detail + salary history
│   │   └── analytics/          # Department + country breakdown
│   ├── api/
│   │   ├── auth/               # Login / logout
│   │   ├── employees/          # CRUD + export
│   │   │   └── [id]/salary/    # Salary record management
│   │   └── analytics/          # Summary, by-dept, by-country
│   ├── login/
│   └── globals.css             # Design system (tokens, components)
├── components/
│   ├── Sidebar.tsx
│   ├── AddSalaryModal.tsx
│   └── EditEmployeeModal.tsx
├── lib/
│   ├── auth.ts                 # JWT sign/verify/session
│   ├── db.ts                   # Prisma client with driver adapter
│   ├── utils.ts                # formatCurrency, parsePagination, etc.
│   └── validations.ts          # Zod schemas
├── tests/
│   ├── utils.test.ts           # 21 unit tests
│   └── validations.test.ts     # 19 unit tests
└── proxy.ts                    # Next.js 16 middleware (route guard)

prisma/
├── schema.prisma               # Employee + SalaryRecord models
├── seed.ts                     # Seeds 10,000 employees
└── migrations/

prisma.config.ts                # Prisma 7 datasource config
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Issue JWT session cookie |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/employees` | Paginated list — search, filter, sort |
| `POST` | `/api/employees` | Create employee + initial salary record |
| `GET` | `/api/employees/[id]` | Employee detail with full salary history |
| `PUT` | `/api/employees/[id]` | Update employee profile |
| `DELETE` | `/api/employees/[id]` | Soft-delete (sets status = Inactive) |
| `POST` | `/api/employees/[id]/salary` | Add salary record (audit trail) |
| `GET` | `/api/employees/export` | CSV download (filter-aware, cursor-batched) |
| `GET` | `/api/analytics/summary` | Org-wide KPIs |
| `GET` | `/api/analytics/by-department` | Per-dept salary stats |
| `GET` | `/api/analytics/by-country` | Per-country headcount + payroll |

---

## How I Used AI

This project was built using **Google Antigravity (Gemini)** as an AI pair-programming tool.

**What AI accelerated:**
- Scaffolding boilerplate (route handlers, form structure, modal shells)
- Writing the 40 unit tests after reviewing the utility functions
- Generating the Recharts chart configurations
- Debugging Prisma 7 breaking changes (`P2029`, driver adapter requirement)

**Where I exercised independent judgment:**
- Chose SQLite + cursor-batched CSV export over a naive `findMany` (which hit P2029 at 10k rows)
- Designed salary as an immutable audit trail rather than a mutable field
- Separated `loading` vs `fetching` states to eliminate the filter blink UX issue
- Chose Prisma 7's `prisma.config.ts` pattern over dotenv workarounds after reading the actual Prisma docs in `node_modules`
- Reviewed every AI-generated route handler for correctness before committing

**Every commit represents a deliberate, reviewed checkpoint** — not a bulk dump.

---

## Commit History

```
216ffae  fix: eliminate filter blink - keep rows visible during refetch with progress bar
79bf1c3  fix: CSV export P2029 error - use cursor-based batch fetching (500/batch)
58d689f  feat: complete full-stack salary management system
a42c0d6  feat: initialize project with Prisma 7 + SQLite schema and 10k employee seed
```

---

## Deployment

The app is designed to deploy to **Vercel**:
1. Push this repo to GitHub (done)
2. Import into Vercel — it auto-detects Next.js
3. Set env vars: `JWT_SECRET`, `DATABASE_URL`
4. For production, swap SQLite for **Postgres** (change the Prisma adapter to `@prisma/adapter-pg`)

> Note: SQLite is file-based and works perfectly for this assessment. A production deployment would use Postgres (Vercel Postgres or Neon).
