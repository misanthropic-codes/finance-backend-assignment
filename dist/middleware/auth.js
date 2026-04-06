"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errors_1 = require("../errors");
const prisma_1 = require("../lib/prisma");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new errors_1.AppError("Missing or invalid authorization header", 401);
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.sub },
            select: { id: true, role: true, status: true }
        });
        if (!user) {
            throw new errors_1.AppError("User no longer exists", 401);
        }
        if (user.status !== client_1.UserStatus.ACTIVE) {
            throw new errors_1.AppError("User account is inactive", 403);
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            next(error);
            return;
        }
        next(new errors_1.AppError("Invalid or expired token", 401));
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        const role = req.user?.role;
        if (!role) {
            next(new errors_1.AppError("Unauthenticated request", 401));
            return;
        }
        if (!allowedRoles.includes(role)) {
            next(new errors_1.AppError("Insufficient permissions", 403));
            return;
        }
        next();
    };
};
exports.authorize = authorize;
