"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const record_schemas_1 = require("../schemas/record.schemas");
exports.recordRouter = (0, express_1.Router)();
exports.recordRouter.get("/", (0, auth_1.authorize)(client_1.Role.VIEWER, client_1.Role.ANALYST, client_1.Role.ADMIN), (0, validate_1.validate)(record_schemas_1.listRecordsSchema), async (req, res, next) => {
    try {
        const { type, category, startDate, endDate, page, pageSize } = req.query;
        const where = {
            ...(type ? { type } : {}),
            ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
            ...((startDate || endDate)
                ? {
                    date: {
                        ...(startDate ? { gte: new Date(startDate) } : {}),
                        ...(endDate ? { lte: new Date(endDate) } : {})
                    }
                }
                : {})
        };
        const [total, records] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.financeRecord.count({ where }),
            prisma_1.prisma.financeRecord.findMany({
                where,
                orderBy: { date: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true }
                    }
                }
            })
        ]);
        res.json({
            data: records,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.recordRouter.post("/", (0, auth_1.authorize)(client_1.Role.ADMIN), (0, validate_1.validate)(record_schemas_1.createRecordSchema), async (req, res, next) => {
    try {
        const { amount, type, category, date, notes } = req.body;
        const record = await prisma_1.prisma.financeRecord.create({
            data: {
                amount,
                type,
                category,
                date: new Date(date),
                notes,
                createdById: req.user.id
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        res.status(201).json({ data: record });
    }
    catch (error) {
        next(error);
    }
});
exports.recordRouter.patch("/:recordId", (0, auth_1.authorize)(client_1.Role.ADMIN), (0, validate_1.validate)(record_schemas_1.updateRecordSchema), async (req, res, next) => {
    try {
        const { recordId } = req.params;
        const updateData = req.body;
        const record = await prisma_1.prisma.financeRecord.update({
            where: { id: recordId },
            data: {
                ...updateData,
                ...(updateData.date ? { date: new Date(updateData.date) } : {})
            }
        });
        res.json({ data: record });
    }
    catch (error) {
        next(error);
    }
});
exports.recordRouter.delete("/:recordId", (0, auth_1.authorize)(client_1.Role.ADMIN), (0, validate_1.validate)(record_schemas_1.deleteRecordSchema), async (req, res, next) => {
    try {
        const { recordId } = req.params;
        await prisma_1.prisma.financeRecord.delete({ where: { id: recordId } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
