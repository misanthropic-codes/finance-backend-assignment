import { Role } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../schemas/user.schemas";
import { AppError } from "../errors";

export const userRouter = Router();

userRouter.get("/", authorize(Role.ADMIN), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ data: users });
  } catch (error) {
    next(error);
  }
});

userRouter.post(
  "/",
  authorize(Role.ADMIN),
  validate(createUserSchema),
  async (req, res, next) => {
    try {
      const { name, email, password, role, status } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError("Email already in use", 409);
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
          status,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.patch(
  "/:userId/role",
  authorize(Role.ADMIN),
  validate(updateUserRoleSchema),
  async (req, res, next) => {
    try {
      const { userId } = req.params as { userId: string };
      const { role } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });

      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.patch(
  "/:userId/status",
  authorize(Role.ADMIN),
  validate(updateUserStatusSchema),
  async (req, res, next) => {
    try {
      const { userId } = req.params as { userId: string };
      const { status } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });

      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  },
);
