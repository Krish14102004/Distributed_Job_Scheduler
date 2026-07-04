import { Router } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res, next) => {
  try {
    const deadLetters = await prisma.deadLetterJob.findMany({ include: { job: true } });
    return res.json(deadLetters);
  } catch (err) {
    next(err);
  }
});

router.post("/:jobId/retry", async (req, res, next) => {
  try {
    const existing = await prisma.deadLetterJob.findUnique({ where: { jobId: req.params.jobId } });
    if (!existing) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Dead letter entry not found" } });
    await prisma.deadLetterJob.delete({ where: { jobId: req.params.jobId } });
    await prisma.job.update({ where: { id: req.params.jobId }, data: { status: "QUEUED", scheduledAt: new Date() } });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
