"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.assert = assert;
class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
function assert(condition, message, statusCode = 400) {
    if (!condition) {
        throw new AppError(message, statusCode);
    }
}
