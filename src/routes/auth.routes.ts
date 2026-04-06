import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/auth.schemas";
import { AppError } from "../errors";
import { config } from "../config";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("User account is inactive", 403);
    }

    const jwtOptions: SignOptions = {
      subject: user.id,
      expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };

    const token = jwt.sign({ role: user.role }, config.JWT_SECRET, jwtOptions);

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
  } catch (error) {
    next(error);
  }
});
