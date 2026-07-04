#!/usr/bin/env node
(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const workerId = process.argv[2];
    const queueId = process.argv[3];
    if (!workerId || !queueId) {
      console.error('Usage: node scripts/force_claim.js <workerId> <queueId>');
      process.exit(2);
    }

    const sql = `
      UPDATE "Job" SET status = 'CLAIMED', "workerId" = '${workerId}', "claimedAt" = now()
      WHERE id = (
        SELECT id FROM "Job"
        WHERE "queueId" = '${queueId}'
          AND status = 'QUEUED'
          AND "scheduledAt" <= now()
        ORDER BY priority DESC, "scheduledAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING *;
    `;

    const res = await prisma.$queryRawUnsafe(sql);
    console.log('Claim result:', res);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
