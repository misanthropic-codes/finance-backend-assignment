import { Role, UserStatus } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(Role).optional(),
    status: z.enum(UserStatus).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(Role),
  }),
  params: z.object({
    userId: z.cuid(),
  }),
  query: z.object({}),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(UserStatus),
  }),
  params: z.object({
    userId: z.cuid(),
  }),
  query: z.object({}),
});
