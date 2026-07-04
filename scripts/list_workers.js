(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const workers = await prisma.worker.findMany({ include: { heartbeats: { orderBy: { reportedAt: 'desc' }, take: 5 } } });
    console.log('Workers and recent heartbeats:');
    for (const w of workers) {
      console.log(`- id=${w.id} hostname=${w.hostname} status=${w.status} startedAt=${w.startedAt}`);
      const h = w.heartbeats || [];
      for (const hb of h) {
        console.log(`    heartbeat: reportedAt=${hb.reportedAt} runningJobs=${hb.runningJobs}`);
      }
    }
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
