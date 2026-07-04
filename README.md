# Distributed Job Scheduler

## Setup

1. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Apply the database schema:
   ```bash
   npx prisma migrate dev --workspace=packages/db
   ```
4. Start services:
   ```bash
   npm run dev:api
   npm run dev:scheduler
   npm run dev:worker
   npm run dev:dashboard
   ```

## Testing

```bash
npm test
```
