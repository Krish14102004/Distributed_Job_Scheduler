import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { validate } from "../middleware/validate";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/signup", validate(signupSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: { code: "EMAIL_EXISTS", message: "Email already registered" } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    const organization = await prisma.organization.create({
      data: {
        name: `${email}'s Organization`,
        members: { create: { userId: user.id, role: "OWNER" } }
      }
    });
    const token = jwt.sign({ userId: user.id, email: user.email }, env.jwtSecret);
    return res.status(201).json({ token, user: { id: user.id, email: user.email }, organizationId: organization.id });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validate(signupSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, env.jwtSecret);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

export default router;
