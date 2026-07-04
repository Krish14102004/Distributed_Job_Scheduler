(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    console.log('All jobs:');
    for (const j of jobs) {
      console.log(JSON.stringify({ id: j.id, queueId: j.queueId, status: j.status, scheduledAt: j.scheduledAt, attempts: j.attempts, maxAttempts: j.maxAttempts, payload: j.payload }, null, 2));
    }
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
