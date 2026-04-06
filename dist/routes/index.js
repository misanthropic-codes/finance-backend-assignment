"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./auth.routes");
const dashboard_routes_1 = require("./dashboard.routes");
const record_routes_1 = require("./record.routes");
const user_routes_1 = require("./user.routes");
const auth_1 = require("../middleware/auth");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
exports.apiRouter.use("/auth", auth_routes_1.authRouter);
exports.apiRouter.use(auth_1.authenticate);
exports.apiRouter.use("/users", user_routes_1.userRouter);
exports.apiRouter.use("/records", record_routes_1.recordRouter);
exports.apiRouter.use("/dashboard", dashboard_routes_1.dashboardRouter);
