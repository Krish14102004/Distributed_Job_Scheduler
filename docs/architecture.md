# Architecture

The system is organized as a monorepo with separate packages for the shared domain logic, Prisma database client, REST API, worker runtime, scheduler, and a React dashboard.

- API handles authentication, projects, queues, jobs, dead-letter management, and worker visibility.
- Worker polls for queued jobs using an atomic SQL claim query with SKIP LOCKED to avoid duplicate execution.
- Scheduler materializes cron jobs and requeues stranded workers after heartbeat expiry.
- Dashboard consumes the API and presents the current queue and job health.
