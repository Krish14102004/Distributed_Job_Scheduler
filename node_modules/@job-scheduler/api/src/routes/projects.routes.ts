import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(authMiddleware);

const projectSchema = z.object({ name: z.string().min(1) });

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const memberships = await prisma.organizationMember.findMany({ where: { userId }, select: { organizationId: true } });
    const organizationIds = memberships.map((m) => m.organizationId);
    const projects = await prisma.project.findMany({ where: { organizationId: { in: organizationIds } } });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(projectSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const membership = await prisma.organizationMember.findFirst({ where: { userId } });
    if (!membership) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "No organization membership" } });
    }
    const project = await prisma.project.create({
      data: { name: req.body.name, organizationId: membership.organizationId }
    });
    return res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

export default router;
