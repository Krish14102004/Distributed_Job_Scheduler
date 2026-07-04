import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(authMiddleware);

const queueSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  priority: z.number().int().optional(),
  concurrencyLimit: z.number().int().optional(),
  retryPolicyId: z.string().optional()
});

router.get("/", async (_req: AuthRequest, res, next) => {
  try {
    const queues = await prisma.queue.findMany({ include: { project: true } });
    res.json(queues);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(queueSchema), async (req: AuthRequest, res, next) => {
  try {
    const policy = await prisma.retryPolicy.findFirst();
    const queue = await prisma.queue.create({
      data: {
        projectId: req.body.projectId,
        name: req.body.name,
        priority: req.body.priority ?? 0,
        concurrencyLimit: req.body.concurrencyLimit ?? 5,
        retryPolicyId: req.body.retryPolicyId ?? policy?.id ?? ""
      }
    });
    return res.status(201).json(queue);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/pause", async (req, res, next) => {
  try {
    const queue = await prisma.queue.update({ where: { id: req.params.id }, data: { isPaused: true } });
    res.json(queue);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/resume", async (req, res, next) => {
  try {
    const queue = await prisma.queue.update({ where: { id: req.params.id }, data: { isPaused: false } });
    res.json(queue);
  } catch (err) {
    next(err);
  }
});

export default router;
