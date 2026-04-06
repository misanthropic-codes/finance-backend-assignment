"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
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
exports.validate = validate;
