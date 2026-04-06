"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, _res, next) => {
        const parsed = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        });
        if (!parsed.success) {
            return next({
                statusCode: 400,
                message: "Validation failed",
                details: parsed.error.flatten()
            });
        }
        const data = parsed.data;
        req.body = data.body;
        req.params = data.params;
        req.query = data.query;
        return next();
    };
};
exports.validate = validate;
