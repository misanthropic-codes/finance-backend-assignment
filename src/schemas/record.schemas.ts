import { RecordType } from "@prisma/client";
import { z } from "zod";

const isoDate = z.string().datetime();

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(RecordType),
    category: z.string().min(2),
    date: isoDate,
    notes: z.string().max(500).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateRecordSchema = z.object({
  body: z
    .object({
      amount: z.number().positive().optional(),
      type: z.enum(RecordType).optional(),
      category: z.string().min(2).optional(),
      date: isoDate.optional(),
      notes: z.string().max(500).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
  params: z.object({
    recordId: z.cuid(),
  }),
  query: z.object({}),
});

export const deleteRecordSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({
    recordId: z.cuid(),
  }),
  query: z.object({}),
});

export const listRecordsSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({}),
  query: z.object({
    type: z.enum(RecordType).optional(),
    category: z.string().optional(),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
});
