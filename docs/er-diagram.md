# ER Diagram

The Prisma schema defines the core entities and their relationships for job scheduling and queue management.

```mermaid
erDiagram
  USER ||--o{ ORGANIZATION_MEMBER : member
  ORGANIZATION ||--o{ ORGANIZATION_MEMBER : has
  ORGANIZATION ||--o{ PROJECT : owns
  PROJECT ||--o{ QUEUE : contains
  QUEUE ||--o{ JOB : enqueues
  QUEUE ||--o{ SCHEDULED_JOB : schedules
  QUEUE }o--|| RETRY_POLICY : uses
  JOB ||--o{ JOB_EXECUTION : records
  JOB ||--o{ JOB_LOG : logs
  JOB ||--o| DEAD_LETTER_JOB : moved_to
  JOB }o--|| WORKER : processed_by
  WORKER ||--o{ WORKER_HEARTBEAT : reports

  USER {
    String id PK
    String email
    String passwordHash
    DateTime createdAt
  }
  ORGANIZATION {
    String id PK
    String name
    DateTime createdAt
  }
  ORGANIZATION_MEMBER {
    String id PK
    String organizationId FK
    String userId FK
    Role role
  }
  PROJECT {
    String id PK
    String name
    String organizationId FK
    DateTime createdAt
  }
  RETRY_POLICY {
    String id PK
    RetryStrategy strategy
    Int maxAttempts
    Int baseDelayMs
    Int maxDelayMs
  }
  QUEUE {
    String id PK
    String name
    String projectId FK
    Int priority
    Int concurrencyLimit
    Boolean isPaused
    String retryPolicyId FK
    DateTime createdAt
  }
  JOB {
    String id PK
    String queueId FK
    Json payload
    JobStatus status
    Int priority
    Int attempts
    Int maxAttempts
    DateTime scheduledAt
    DateTime? claimedAt
    DateTime? startedAt
    DateTime? completedAt
    String? workerId FK
    String? idempotencyKey
    DateTime createdAt
    DateTime updatedAt
  }
  JOB_EXECUTION {
    String id PK
    String jobId FK
    Int attemptNumber
    String? workerId FK
    JobStatus status
    DateTime startedAt
    DateTime? finishedAt
    String? errorMessage
    Int? durationMs
  }
  JOB_LOG {
    String id PK
    String jobId FK
    String level
    String message
    DateTime createdAt
  }
  SCHEDULED_JOB {
    String id PK
    String queueId FK
    String cronExpression
    Json payloadTemplate
    Boolean isActive
    DateTime? lastRunAt
    DateTime? nextRunAt
    DateTime createdAt
  }
  WORKER {
    String id PK
    String hostname
    String status
    DateTime startedAt
  }
  WORKER_HEARTBEAT {
    String id PK
    String workerId FK
    DateTime reportedAt
    Int runningJobs
  }
  DEAD_LETTER_JOB {
    String id PK
    String jobId FK
    String reason
    DateTime movedAt
  }
```

## Notes

- `OrganizationMember` connects `User` and `Organization` with a role.
- `Project` belongs to an `Organization`, and `Queue` belongs to a `Project`.
- `Queue` references a `RetryPolicy` for retry behavior.
- `Job` tracks status and may reference `Worker`, `JobExecution`, `JobLog`, and `DeadLetterJob`.
- `ScheduledJob` stores cron-based recurring payloads for future enqueueing.
