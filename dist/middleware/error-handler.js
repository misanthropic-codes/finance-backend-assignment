"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const zod_1 = require("zod");
const errors_1 = require("../errors");
const notFound = (_req, res) => {
    res.status(404).json({ message: "Route not found" });
};
exports.notFound = notFound;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            message: "Validation failed",
            details: err.flatten()
        });
        return;
    }
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    if (typeof err === "object" && err !== null && "statusCode" in err && "message" in err) {
        const e = err;
        res.status(e.statusCode).json({ message: e.message, details: e.details });
        return;
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
};
exports.errorHandler = errorHandler;
