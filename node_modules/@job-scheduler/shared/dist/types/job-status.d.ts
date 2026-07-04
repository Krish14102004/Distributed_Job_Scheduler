export declare const JOB_STATUSES: readonly ["QUEUED", "SCHEDULED", "CLAIMED", "RUNNING", "COMPLETED", "FAILED", "RETRYING", "DEAD_LETTER", "CANCELLED"];
export type JobStatus = (typeof JOB_STATUSES)[number];
