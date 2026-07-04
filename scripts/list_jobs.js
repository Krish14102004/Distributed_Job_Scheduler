(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    console.log('Recent jobs:', JSON.stringify(jobs, null, 2));
    await prisma.$disconnect();
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
