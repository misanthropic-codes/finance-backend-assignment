"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRecordsSchema = exports.deleteRecordSchema = exports.updateRecordSchema = exports.createRecordSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const isoDate = zod_1.z.string().datetime();
exports.createRecordSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        type: zod_1.z.enum(client_1.RecordType),
        category: zod_1.z.string().min(2),
        date: isoDate,
        notes: zod_1.z.string().max(500).optional(),
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({}),
});
exports.updateRecordSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        amount: zod_1.z.number().positive().optional(),
        type: zod_1.z.enum(client_1.RecordType).optional(),
        category: zod_1.z.string().min(2).optional(),
        date: isoDate.optional(),
        notes: zod_1.z.string().max(500).optional().nullable(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required for update",
    }),
    params: zod_1.z.object({
        recordId: zod_1.z.cuid(),
    }),
    query: zod_1.z.object({}),
});
exports.deleteRecordSchema = zod_1.z.object({
    body: zod_1.z.unknown().optional(),
    params: zod_1.z.object({
        recordId: zod_1.z.cuid(),
    }),
    query: zod_1.z.object({}),
});
exports.listRecordsSchema = zod_1.z.object({
    body: zod_1.z.unknown().optional(),
    params: zod_1.z.object({}),
    query: zod_1.z.object({
        type: zod_1.z.enum(client_1.RecordType).optional(),
        category: zod_1.z.string().optional(),
        startDate: isoDate.optional(),
        endDate: isoDate.optional(),
        page: zod_1.z.coerce.number().int().positive().default(1),
        pageSize: zod_1.z.coerce.number().int().positive().max(100).default(20),
    }),
});
