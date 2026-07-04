import { PrismaClient } from "@job-scheduler/db";

const prisma = new PrismaClient();

export async function claimNextJob(workerId: string, queueId: string) {
  const jobs = await prisma.$queryRaw<any[]>`
    UPDATE "Job" SET status = 'CLAIMED', "workerId" = ${workerId}, "claimedAt" = now()
    WHERE id = (
      SELECT id FROM "Job"
      WHERE "queueId" = ${queueId}
        AND status = 'QUEUED'
        AND "scheduledAt" <= now()
      ORDER BY priority DESC, "scheduledAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *;
  `;
  return jobs[0] ?? null;
}
