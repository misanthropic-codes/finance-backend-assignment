import { Router } from "express";
import { authRouter } from "./auth.routes";
import { dashboardRouter } from "./dashboard.routes";
import { recordRouter } from "./record.routes";
import { userRouter } from "./user.routes";
import { authenticate } from "../middleware/auth";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use(authenticate);
apiRouter.use("/users", userRouter);
apiRouter.use("/records", recordRouter);
apiRouter.use("/dashboard", dashboardRouter);
