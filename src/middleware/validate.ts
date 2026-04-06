import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      return next({
        statusCode: 400,
        message: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    // Keep middleware side-effect free: validate only, do not mutate request internals.
    // Express 5 exposes req.query with a getter, so reassignment can throw at runtime.
    return next();
  };
};
