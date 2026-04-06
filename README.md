# Finance Data Processing and Access Control Backend

A TypeScript + Express + Prisma backend implementing:

- Role-based access control (Viewer, Analyst, Admin)
- User lifecycle management (create, role/status updates, list)
- Financial record CRUD with filters and pagination
- Dashboard analytics (totals, category totals, monthly trends, recent activity)
- Input validation with Zod
- Centralized error handling
- SQLite persistence via Prisma

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite
- Zod validation
- JWT authentication

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Copy environment file

```bash
cp .env.example .env
```

3. Generate Prisma client and run migrations

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Seed sample data

```bash
npm run prisma:seed
```

5. Run the API

```bash
npm run dev
```

API base URL: `http://localhost:4000/api`

## Demo Users (Seeded)

- Admin: `admin@example.com` / `Admin123!`
- Analyst: `analyst@example.com` / `Analyst123!`
- Viewer: `viewer@example.com` / `Viewer123!`

## API Endpoints

### Public

- `GET /api/health`
- `POST /api/auth/login`

### Authenticated (Bearer token required)

#### Users

- `GET /api/users` (Admin)
- `POST /api/users` (Admin)
- `PATCH /api/users/:userId/role` (Admin)
- `PATCH /api/users/:userId/status` (Admin)

#### Records

- `GET /api/records` (Viewer, Analyst, Admin)
- `POST /api/records` (Admin)
- `PATCH /api/records/:recordId` (Admin)
- `DELETE /api/records/:recordId` (Admin)

Query params for `GET /api/records`:

- `type=INCOME|EXPENSE`
- `category=<text>`
- `startDate=<ISO date-time>`
- `endDate=<ISO date-time>`
- `page=<number>` (default 1)
- `pageSize=<number>` (default 20, max 100)

#### Dashboard

- `GET /api/dashboard/summary` (Viewer, Analyst, Admin)

Returns:

- total income, expenses, net balance
- category-wise totals
- month-wise trends
- recent 10 activities

## Access Control Rules

- Viewer: read records + dashboard summaries
- Analyst: read records + dashboard summaries
- Admin: full access including user and record management

Inactive users cannot access protected routes.

## Validation and Error Handling

- All request payloads are validated with Zod
- Validation failures return HTTP `400`
- Auth failures return `401` or `403`
- Unknown routes return `404`
- Unhandled issues return `500`

## Test and Build

```bash
npm run build
npm test
```

RBAC integration coverage is implemented in tests/rbac.integration.test.ts and verifies Viewer, Analyst, and Admin access for:

- records read/create/update/delete endpoints
- dashboard summary endpoint
- users list/create/role-update/status-update endpoints

## Postman Automatic Test Collection

Use the included Postman assets to run automated API and RBAC checks from Postman Collection Runner:

- Collection: postman/Finance-RBAC-Auto-Tests.postman_collection.json
- Environment: postman/Finance-Local.postman_environment.json

Run steps:

1. Start the API server locally.
2. Import both Postman files.
3. Select the Finance Backend Local environment.
4. Run the Finance Backend RBAC Auto Tests collection in order.

The collection performs automated assertions and covers:

- health check
- role-based login and token capture
- records RBAC matrix (read/create/update/delete)
- dashboard RBAC matrix
- users RBAC matrix (list/create/role/status)

## Assumptions

- This assignment uses SQLite for local simplicity.
- JWT-based login is used for authenticated APIs.
- Record ownership is tracked (`createdById`) but admin is allowed to manage all records.
