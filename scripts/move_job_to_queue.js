#!/usr/bin/env node
(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const jobId = process.argv[2];
    const targetQueueId = process.argv[3];
    if (!jobId || !targetQueueId) {
      console.error('Usage: node scripts/move_job_to_queue.js <jobId> <targetQueueId>');
      process.exit(2);
    }

    const res = await prisma.job.update({ where: { id: jobId }, data: { queueId: targetQueueId } });
    console.log('Moved job:', res.id, 'to queue', res.queueId);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
