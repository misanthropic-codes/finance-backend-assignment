import type { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "@prisma/client";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "../errors";
import { prisma } from "../lib/prisma";

type TokenPayload = {
  sub: string;
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Missing or invalid authorization header", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError("User account is inactive", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role) {
      next(new AppError("Unauthenticated request", 401));
      return;
    }

    if (!allowedRoles.includes(role)) {
      next(new AppError("Insufficient permissions", 403));
      return;
    }

    next();
  };
};
