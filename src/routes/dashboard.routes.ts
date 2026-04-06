import { RecordType, Role } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authorize } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN), async (_req, res, next) => {
  try {
    const [records, recentActivity] = await Promise.all([
      prisma.financeRecord.findMany({
        select: {
          amount: true,
          type: true,
          category: true,
          date: true
        }
      }),
      prisma.financeRecord.findMany({
        orderBy: { date: "desc" },
        take: 10,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    ]);

    const totalIncome = records.filter((r) => r.type === RecordType.INCOME).reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records
      .filter((r) => r.type === RecordType.EXPENSE)
      .reduce((sum, r) => sum + r.amount, 0);

    const categoryTotals = Object.entries(
      records.reduce<Record<string, number>>((acc, record) => {
        acc[record.category] = (acc[record.category] ?? 0) + record.amount;
        return acc;
      }, {})
    ).map(([category, amount]) => ({ category, amount }));

    const monthlyTrends = Object.entries(
      records.reduce<Record<string, { income: number; expense: number }>>((acc, record) => {
        const month = record.date.toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { income: 0, expense: 0 };
        }

        if (record.type === RecordType.INCOME) {
          acc[month].income += record.amount;
        } else {
          acc[month].expense += record.amount;
        }

        return acc;
      }, {})
    )
      .map(([month, totals]) => ({
        month,
        income: totals.income,
        expense: totals.expense,
        net: totals.income - totals.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        netBalance: totalIncome - totalExpenses
      },
      categoryTotals,
      monthlyTrends,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
});
