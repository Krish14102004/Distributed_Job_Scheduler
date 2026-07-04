import { Router } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res, next) => {
  try {
    const workers = await prisma.worker.findMany({ include: { heartbeats: { orderBy: { reportedAt: "desc" }, take: 1 } } });
    return res.json(workers);
  } catch (err) {
    next(err);
  }
});

export default router;
