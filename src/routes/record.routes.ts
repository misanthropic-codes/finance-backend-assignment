import { Role } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createRecordSchema,
  deleteRecordSchema,
  listRecordsSchema,
  updateRecordSchema,
} from "../schemas/record.schemas";

export const recordRouter = Router();

recordRouter.get(
  "/",
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  validate(listRecordsSchema),
  async (req, res, next) => {
    try {
      const {
        type,
        category,
        startDate,
        endDate,
        page: rawPage,
        pageSize: rawPageSize,
      } = req.query as unknown as {
        type?: "INCOME" | "EXPENSE";
        category?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        pageSize?: string;
      };
      const page = Number(rawPage ?? "1");
      const pageSize = Number(rawPageSize ?? "20");

      const where = {
        ...(type ? { type } : {}),
        ...(category
          ? { category: { contains: category, mode: "insensitive" as const } }
          : {}),
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate ? { gte: new Date(startDate as string) } : {}),
                ...(endDate ? { lte: new Date(endDate as string) } : {}),
              },
            }
          : {}),
      };

      const [total, records] = await prisma.$transaction([
        prisma.financeRecord.count({ where }),
        prisma.financeRecord.findMany({
          where,
          orderBy: { date: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
      ]);

      res.json({
        data: records,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

recordRouter.post(
  "/",
  authorize(Role.ADMIN),
  validate(createRecordSchema),
  async (req, res, next) => {
    try {
      const { amount, type, category, date, notes } = req.body;

      const record = await prisma.financeRecord.create({
        data: {
          amount,
          type,
          category,
          date: new Date(date),
          notes,
          createdById: req.user!.id,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.status(201).json({ data: record });
    } catch (error) {
      next(error);
    }
  },
);

recordRouter.patch(
  "/:recordId",
  authorize(Role.ADMIN),
  validate(updateRecordSchema),
  async (req, res, next) => {
    try {
      const { recordId } = req.params as { recordId: string };
      const updateData = req.body as {
        amount?: number;
        type?: "INCOME" | "EXPENSE";
        category?: string;
        date?: string;
        notes?: string | null;
      };

      const record = await prisma.financeRecord.update({
        where: { id: recordId },
        data: {
          ...updateData,
          ...(updateData.date ? { date: new Date(updateData.date) } : {}),
        },
      });

      res.json({ data: record });
    } catch (error) {
      next(error);
    }
  },
);

recordRouter.delete(
  "/:recordId",
  authorize(Role.ADMIN),
  validate(deleteRecordSchema),
  async (req, res, next) => {
    try {
      const { recordId } = req.params as { recordId: string };

      await prisma.financeRecord.delete({ where: { id: recordId } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
