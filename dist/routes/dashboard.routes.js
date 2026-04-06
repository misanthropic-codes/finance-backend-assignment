"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.get("/summary", (0, auth_1.authorize)(client_1.Role.VIEWER, client_1.Role.ANALYST, client_1.Role.ADMIN), async (_req, res, next) => {
    try {
        const [records, recentActivity] = await Promise.all([
            prisma_1.prisma.financeRecord.findMany({
                select: {
                    amount: true,
                    type: true,
                    category: true,
                    date: true
                }
            }),
            prisma_1.prisma.financeRecord.findMany({
                orderBy: { date: "desc" },
                take: 10,
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true }
                    }
                }
            })
        ]);
        const totalIncome = records.filter((r) => r.type === client_1.RecordType.INCOME).reduce((sum, r) => sum + r.amount, 0);
        const totalExpenses = records
            .filter((r) => r.type === client_1.RecordType.EXPENSE)
            .reduce((sum, r) => sum + r.amount, 0);
        const categoryTotals = Object.entries(records.reduce((acc, record) => {
            acc[record.category] = (acc[record.category] ?? 0) + record.amount;
            return acc;
        }, {})).map(([category, amount]) => ({ category, amount }));
        const monthlyTrends = Object.entries(records.reduce((acc, record) => {
            const month = record.date.toISOString().slice(0, 7);
            if (!acc[month]) {
                acc[month] = { income: 0, expense: 0 };
            }
            if (record.type === client_1.RecordType.INCOME) {
                acc[month].income += record.amount;
            }
            else {
                acc[month].expense += record.amount;
            }
            return acc;
        }, {}))
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
    }
    catch (error) {
        next(error);
    }
});
