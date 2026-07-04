import { PrismaClient } from "@job-scheduler/db";
import parser from "cron-parser";

const prisma = new PrismaClient();

async function materializeCronJobs() {
  const dueJobs = await prisma.scheduledJob.findMany({ where: { isActive: true, nextRunAt: { lte: new Date() } } });
  for (const scheduled of dueJobs) {
    await prisma.job.create({
      data: {
        queueId: scheduled.queueId,
        payload: scheduled.payloadTemplate as any,
        status: "QUEUED",
        scheduledAt: new Date()
      }
    });
    const interval = parser.parse(scheduled.cronExpression);
    const next = interval.next().toDate();
    await prisma.scheduledJob.update({ where: { id: scheduled.id }, data: { lastRunAt: new Date(), nextRunAt: next } });
  }
}

async function requeueDeadWorkers() {
  const stale = new Date(Date.now() - 30_000);
  const workers = await prisma.worker.findMany({ where: { status: { not: "DEAD" } } });
  for (const worker of workers) {
    const latestHeartbeat = await prisma.workerHeartbeat.findFirst({ where: { workerId: worker.id }, orderBy: { reportedAt: "desc" } });
    if (latestHeartbeat && latestHeartbeat.reportedAt < stale) {
      await prisma.job.updateMany({ where: { workerId: worker.id, status: { in: ["CLAIMED", "RUNNING"] } }, data: { status: "QUEUED", workerId: null, claimedAt: null, startedAt: null } });
    }
  }
}

(async () => {
  setInterval(async () => {
    await materializeCronJobs();
    await requeueDeadWorkers();
  }, 10_000);
})();
