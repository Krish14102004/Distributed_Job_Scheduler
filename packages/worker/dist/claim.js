"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimNextJob = claimNextJob;
const db_1 = require("@job-scheduler/db");
const prisma = new db_1.PrismaClient();
async function claimNextJob(workerId, queueId) {
    const jobs = await prisma.$queryRaw `
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
