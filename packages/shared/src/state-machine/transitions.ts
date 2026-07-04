import { JobStatus } from "../types/job-status";

const ALLOWED: Record<JobStatus, JobStatus[]> = {
  QUEUED: ["CLAIMED", "CANCELLED"],
  SCHEDULED: ["QUEUED", "CANCELLED"],
  CLAIMED: ["RUNNING", "QUEUED"],
  RUNNING: ["COMPLETED", "FAILED"],
  FAILED: ["RETRYING", "DEAD_LETTER"],
  RETRYING: ["QUEUED"],
  COMPLETED: [],
  DEAD_LETTER: [],
  CANCELLED: []
};

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertTransition(from: JobStatus, to: JobStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal job transition: ${from} -> ${to}`);
  }
}
