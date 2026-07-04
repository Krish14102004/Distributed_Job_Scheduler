export interface Project {
  id: string;
  name: string;
  organizationId?: string;
}

export interface Queue {
  id: string;
  name: string;
  priority: number;
  concurrencyLimit: number;
  isPaused: boolean;
  projectId: string;
}

export interface Job {
  id: string;
  queueId: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  scheduledAt: string;
  payload: any;
}

export interface WorkerInfo {
  id: string;
  hostname: string;
  status: string;
  startedAt: string;
  heartbeats?: Array<{ reportedAt: string; runningJobs: number }>;
}
