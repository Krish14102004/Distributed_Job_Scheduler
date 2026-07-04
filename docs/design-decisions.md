# Design Decisions

- UUID primary keys are used for global uniqueness and safer multi-writer inserts.
- The job status is denormalized on the Job row to support fast filtering while execution history is stored in JobExecution.
- Cascade delete is used in development for simplicity, but a soft-delete strategy would be preferable in production to retain audit history.
- The composite index on queueId, status, priority, and scheduledAt supports atomic job claiming with minimal I/O.
