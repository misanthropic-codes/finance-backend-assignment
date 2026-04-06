import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { apiRouter } from "./routes";
import { errorHandler, notFound } from "./middleware/error-handler";
import { openApiSpec } from "./docs/openapi";

export const app = express();

// Disable CSP for API-only app so Swagger UI assets/scripts can render correctly.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/docs.json", (_req, res) => {
  res.json(openApiSpec);
});
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
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
  }),
);

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);
