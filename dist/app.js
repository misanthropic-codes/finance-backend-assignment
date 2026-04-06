"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = require("./routes");
const error_handler_1 = require("./middleware/error-handler");
const openapi_1 = require("./docs/openapi");
exports.app = (0, express_1.default)();
// Disable CSP for API-only app so Swagger UI assets/scripts can render correctly.
exports.app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.get("/api/docs.json", (_req, res) => {
    res.json(openapi_1.openApiSpec);
});
exports.app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openApiSpec, {
    explorer: true,
    customSiteTitle: "Finance Backend API Docs",
    swaggerOptions: {
        url: "/api/docs.json",
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "list",
        filter: true,
        tryItOutEnabled: true,
    },
}));
exports.app.use("/api", routes_1.apiRouter);
exports.app.use(error_handler_1.notFound);
exports.app.use(error_handler_1.errorHandler);
