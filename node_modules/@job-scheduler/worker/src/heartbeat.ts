import { PrismaClient } from "@job-scheduler/db";

const prisma = new PrismaClient();

export async function ensureWorker(workerId: string, hostname: string) {
  const existing = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!existing) {
    await prisma.worker.create({ data: { id: workerId, hostname } });
    console.log(`Registered new worker ${workerId} (${hostname})`);
  }
}

export async function heartbeat(workerId: string, runningJobs: number) {
  await prisma.workerHeartbeat.create({ data: { workerId, runningJobs } });
  console.log(`Heartbeat from ${workerId} - runningJobs=${runningJobs}`);
}
