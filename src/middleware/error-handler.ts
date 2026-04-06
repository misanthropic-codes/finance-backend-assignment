import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors";

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  ) {
    const e = err as { statusCode: number; message: string; details?: unknown };
    res.status(e.statusCode).json({ message: e.message, details: e.details });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
