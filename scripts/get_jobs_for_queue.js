(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const queueId = process.argv[2];
    if (!queueId) {
      console.error('Usage: node scripts/get_jobs_for_queue.js <queueId>');
      process.exit(2);
    }

    const jobs = await prisma.job.findMany({ where: { queueId }, orderBy: { createdAt: 'desc' }, take: 20 });
    console.log(`Jobs for queue ${queueId}:`);
    for (const j of jobs) {
      console.log(JSON.stringify({ id: j.id, status: j.status, scheduledAt: j.scheduledAt, attempts: j.attempts, maxAttempts: j.maxAttempts, priority: j.priority, createdAt: j.createdAt }, null, 2));
    }

    // Also print queue pause state
    const queue = await prisma.queue.findUnique({ where: { id: queueId } });
    console.log('Queue:', JSON.stringify({ id: queue?.id, name: queue?.name, isPaused: queue?.isPaused, concurrencyLimit: queue?.concurrencyLimit }, null, 2));

    await prisma.$disconnect();
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
