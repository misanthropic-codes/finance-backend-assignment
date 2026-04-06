"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const validate_1 = require("../middleware/validate");
const auth_schemas_1 = require("../schemas/auth.schemas");
const errors_1 = require("../errors");
const config_1 = require("../config");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/login", (0, validate_1.validate)(auth_schemas_1.loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new errors_1.AppError("Invalid credentials", 401);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new errors_1.AppError("Invalid credentials", 401);
        }
        if (user.status !== "ACTIVE") {
            throw new errors_1.AppError("User account is inactive", 403);
        }
        const jwtOptions = {
            subject: user.id,
            expiresIn: config_1.config.JWT_EXPIRES_IN,
        };
        const token = jsonwebtoken_1.default.sign({ role: user.role }, config_1.config.JWT_SECRET, jwtOptions);
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
