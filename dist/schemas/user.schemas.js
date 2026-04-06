"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatusSchema = exports.updateUserRoleSchema = exports.createUserSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.email(),
        password: zod_1.z.string().min(6),
        role: zod_1.z.enum(client_1.Role).optional(),
        status: zod_1.z.enum(client_1.UserStatus).optional(),
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({}),
});
exports.updateUserRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(client_1.Role),
    }),
    params: zod_1.z.object({
        userId: zod_1.z.cuid(),
    }),
    query: zod_1.z.object({}),
});
exports.updateUserStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(client_1.UserStatus),
    }),
    params: zod_1.z.object({
        userId: zod_1.z.cuid(),
    }),
    query: zod_1.z.object({}),
});
