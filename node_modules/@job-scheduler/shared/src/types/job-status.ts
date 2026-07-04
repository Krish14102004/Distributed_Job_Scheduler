export const JOB_STATUSES = [
  "QUEUED",
  "SCHEDULED",
  "CLAIMED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "RETRYING",
  "DEAD_LETTER",
  "CANCELLED"
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
