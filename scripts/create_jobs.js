#!/usr/bin/env node
(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const queueId = process.argv[2] || '04b51610-91b6-4aee-bd6d-d9f85acc448a';
    const count = parseInt(process.argv[3] || '5', 10);

    const created = [];
    for (let i = 0; i < count; i++) {
      const job = await prisma.job.create({
        data: {
          queueId,
          payload: { type: 'test', message: `auto job ${Date.now()}-${i}` },
          status: 'QUEUED',
          scheduledAt: new Date(),
          maxAttempts: 5,
          priority: 0
        }
      });
      created.push(job.id);
    }

    console.log(`Created ${created.length} jobs in queue ${queueId}:`, created);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
