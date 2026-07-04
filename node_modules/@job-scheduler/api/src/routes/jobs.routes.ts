import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { assertTransition } from "@job-scheduler/shared";

const router = Router();
router.use(authMiddleware);

const submitSchema = z.object({
  payload: z.any().optional(),
  runAt: z.string().optional(),
  idempotencyKey: z.string().optional(),
  priority: z.number().int().optional(),
  maxAttempts: z.number().int().optional()
});

const scheduleSchema = z.object({
  cronExpression: z.string(),
  payloadTemplate: z.any(),
  nextRunAt: z.string().optional()
});

router.post("/:queueId/jobs", validate(submitSchema), async (req: AuthRequest, res, next) => {
  try {
    const { payload = {}, runAt, idempotencyKey, priority = 0, maxAttempts = 5 } = req.body;
    const scheduledAt = runAt ? new Date(runAt) : new Date();
    const job = await prisma.job.upsert({
      where: { id: idempotencyKey ?? "__placeholder__" },
      update: {},
      create: {
        queueId: req.params.queueId,
        payload,
        priority,
        maxAttempts,
        scheduledAt,
        idempotencyKey,
        status: "QUEUED"
      }
    });
    return res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

router.post("/:queueId/jobs/batch", validate(z.object({ jobs: z.array(z.any()) })), async (req, res, next) => {
  try {
    const created = await prisma.$transaction(
      req.body.jobs.map((item: any) =>
        prisma.job.create({
          data: {
            queueId: req.params.queueId,
            payload: item.payload ?? item,
            priority: item.priority ?? 0,
            maxAttempts: item.maxAttempts ?? 5,
            scheduledAt: item.runAt ? new Date(item.runAt) : new Date(),
            status: "QUEUED"
          }
        })
      )
    );
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.post("/:queueId/scheduled-jobs", validate(scheduleSchema), async (req, res, next) => {
  try {
    const scheduled = await prisma.scheduledJob.create({
      data: {
        queueId: req.params.queueId,
        cronExpression: req.body.cronExpression,
        payloadTemplate: req.body.payloadTemplate,
        nextRunAt: req.body.nextRunAt ? new Date(req.body.nextRunAt) : new Date()
      }
    });
    return res.status(201).json(scheduled);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const queueId = req.query.queueId as string | undefined;
    const status = req.query.status as string | undefined;
    const jobs = await prisma.job.findMany({
      where: {
        ...(queueId ? { queueId } : {}),
        ...(status ? { status: status as any } : {})
      },
      orderBy: { createdAt: "desc" }
    });
    return res.json(jobs);
  } catch (err) {
    next(err);
  }
});

router.get("/:queueId/jobs", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const jobs = await prisma.job.findMany({
      where: { queueId: req.params.queueId, ...(status ? { status: status as any } : {}) },
      orderBy: { createdAt: "desc" }
    });
    return res.json(jobs);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { executions: true, logs: true }
    });
    return res.json(job);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/cancel", async (req, res, next) => {
  try {
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    }
    assertTransition(existing.status as any, "CANCELLED");
    const updated = await prisma.job.update({ where: { id: req.params.id }, data: { status: "CANCELLED" } });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/retry", async (req, res, next) => {
  try {
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    }
    assertTransition(existing.status as any, "QUEUED");
    const updated = await prisma.job.update({ where: { id: req.params.id }, data: { status: "QUEUED", scheduledAt: new Date() } });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
