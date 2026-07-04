# Architecture

The system is organized as a monorepo with separate packages for domain logic, database access, REST API, worker runtime, scheduler, and a React dashboard.

- `packages/shared` holds shared types and utilities across services.
- `packages/db` exposes Prisma client configuration and connects to PostgreSQL.
- `packages/api` serves the dashboard and worker clients with REST routes for auth, projects, queues, jobs, workers, metrics, and dead-letter recovery.
- `packages/worker` claims work from the API and executes queued jobs.
- `packages/scheduler` schedules cron-based jobs, enqueues future work, and helps recover stalled workers.
- `packages/dashboard` is a React/Vite SPA that consumes the API and presents user-facing queue/job management.

## System Diagram

```mermaid
flowchart LR
  Browser[Browser / Dashboard SPA]
  Dashboard[Dashboard Service<br/>(React + Vite)]
  API[API Service<br/>(Express + Prisma)]
  DB[PostgreSQL Database]
  Worker[Worker Service]
  Scheduler[Scheduler Service]

  Browser -->|HTTPS REST| Dashboard
  Dashboard -->|REST API calls| API
  Worker -->|REST job claim / status| API
  Scheduler -->|REST enqueue / query| API
  API -->|SQL queries| DB

  subgraph Monorepo
    Shared[Shared types / models]
    Dashboard
    API
    Worker
    Scheduler
    DB
  end

  Shared --> Dashboard
  Shared --> API
  Shared --> Worker
  Shared --> Scheduler
```

## Runtime behavior

1. A user logs into the dashboard and calls the API to manage projects, queues, and jobs.
2. The scheduler creates or enqueues recurring jobs based on cron definitions.
3. The worker polls the API for queued jobs, uses an atomic claim query, executes work, and updates job status.
4. Dead letter jobs are available for retry from the API dashboard.
5. Heartbeats from workers are used to detect stale execution and trigger recovery.
