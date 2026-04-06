"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const user_schemas_1 = require("../schemas/user.schemas");
const errors_1 = require("../errors");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get("/", (0, auth_1.authorize)(client_1.Role.ADMIN), async (_req, res, next) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json({ data: users });
    }
    catch (error) {
        next(error);
    }
});
exports.userRouter.post("/", (0, auth_1.authorize)(client_1.Role.ADMIN), (0, validate_1.validate)(user_schemas_1.createUserSchema), async (req, res, next) => {
    try {
        const { name, email, password, role, status } = req.body;
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new errors_1.AppError("Email already in use", 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
                status
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(201).json({ data: user });
    }
    catch (error) {
        next(error);
    }
});
exports.userRouter.patch("/:userId/role", (0, auth_1.authorize)(client_1.Role.ADMIN), (0, validate_1.validate)(user_schemas_1.updateUserRoleSchema), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const updated = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                updatedAt: true
            }
        });
        res.json({ data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.userRouter.patch("/:userId/status", (0, auth_1.authorize)(client_1.Role.ADMIN), (0, validate_1.validate)(user_schemas_1.updateUserStatusSchema), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        const updated = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { status },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                updatedAt: true
            }
        });
        res.json({ data: updated });
    }
    catch (error) {
        next(error);
    }
});
