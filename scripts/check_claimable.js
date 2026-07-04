(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const queueId = process.argv[2];
    if (!queueId) {
      console.error('Usage: node scripts/check_claimable.js <queueId>');
      process.exit(2);
    }

    // Run the same SELECT used by claimNextJob (without the UPDATE)
    const result = await prisma.$queryRawUnsafe(`
      SELECT id FROM "Job"
      WHERE "queueId" = '${queueId}'
        AND status = 'QUEUED'
        AND "scheduledAt" <= now()
      ORDER BY priority DESC, "scheduledAt" ASC
      LIMIT 1
    `);

    console.log('Eligible job row (if any):', result);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
