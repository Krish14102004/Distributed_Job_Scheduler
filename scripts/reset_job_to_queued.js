#!/usr/bin/env node
(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const jobId = process.argv[2];
    if (!jobId) {
      console.error('Usage: node scripts/reset_job_to_queued.js <jobId>');
      process.exit(2);
    }

    const res = await prisma.job.update({ where: { id: jobId }, data: { status: 'QUEUED', workerId: null, claimedAt: null } });
    console.log('Updated job:', res);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
