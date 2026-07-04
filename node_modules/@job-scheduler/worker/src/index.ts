import { randomUUID } from "crypto";
import { claimNextJob } from "./claim";
import { executeJob } from "./execute";
import { ensureWorker, heartbeat } from "./heartbeat";
import { registerShutdown } from "./shutdown";
import { PrismaClient } from "@job-scheduler/db";

const prisma = new PrismaClient();
const CONCURRENCY = 5;
let running = 0;
let shuttingDown = false;

async function pollLoop(workerId: string, queueIds: string[]) {
  console.log(`Polling loop started for queues ${queueIds.join(',')}`);
  let idx = 0;
  while (!shuttingDown) {
    if (running < CONCURRENCY && queueIds.length > 0) {
      const queueId = queueIds[idx % queueIds.length];
      idx++;
      try {
        const job = await claimNextJob(workerId, queueId);
        if (job) {
          running++;
          executeJob(job).finally(() => (running--));
        }
      } catch (err) {
        console.error('Error while attempting to claim job for queue', queueId, err);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

(async () => {
  const workerId = randomUUID();
  await ensureWorker(workerId, "local");

  // Load all queues and poll them in round-robin. Refresh periodically.
  let queues = await prisma.queue.findMany();
  if (!queues || queues.length === 0) {
    console.error('No queues found in the database. Create a queue before starting workers.');
    process.exit(1);
  }
  let queueIds = queues.map((q) => q.id);

  const refreshInterval = setInterval(async () => {
    try {
      const qs = await prisma.queue.findMany();
      queueIds = qs.map((q) => q.id);
      console.log('Refreshed queue list:', queueIds);
    } catch (err) {
      console.error('Failed to refresh queues', err);
    }
  }, 30000);

  registerShutdown(workerId, () => { shuttingDown = true; }, async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
  setInterval(() => heartbeat(workerId, running), 5000);
  registerShutdown(workerId, () => { shuttingDown = true; }, async () => {
    clearInterval(refreshInterval);
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
  await pollLoop(workerId, queueIds);
})();
