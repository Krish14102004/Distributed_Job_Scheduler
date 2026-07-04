import { Router } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res, next) => {
  try {
    const totalJobs = await prisma.job.count();
    const queuedJobs = await prisma.job.count({ where: { status: "QUEUED" } });
    const runningJobs = await prisma.job.count({ where: { status: "RUNNING" } });
    const claimedJobs = await prisma.job.count({ where: { status: "CLAIMED" } });
    const completedJobs = await prisma.job.count({ where: { status: "COMPLETED" } });
    const failedJobs = await prisma.job.count({ where: { status: "FAILED" } });
    const deadLetterJobs = await prisma.deadLetterJob.count();
    const workerCount = await prisma.worker.count();
    const queueCount = await prisma.queue.count();

    return res.json({
      totalJobs,
      queuedJobs,
      claimedJobs,
      runningJobs,
      completedJobs,
      failedJobs,
      deadLetterJobs,
      workerCount,
      queueCount
    });
  } catch (err) {
    next(err);
  }
});

export default router;
