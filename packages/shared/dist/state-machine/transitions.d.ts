import { JobStatus } from "../types/job-status";
export declare function canTransition(from: JobStatus, to: JobStatus): boolean;
export declare function assertTransition(from: JobStatus, to: JobStatus): void;
