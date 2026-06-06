import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { jobsRouter } from "./routes/jobs.js";
import { candidatesRouter } from "./routes/candidates.js";
import { applicationsRouter } from "./routes/applications.js";
import { interviewsRouter } from "./routes/interviews.js";
import { analyticsRouter } from "./routes/analytics.js";
import { uploadsRouter } from "./routes/uploads.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.NODE_ENV === "production" ? (env.CORS_ORIGIN ?? true) : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    res.json({ success: true, data: { name: "TalentForge AI API", version: "1.0.0" } });
  });

  app.use("/health", healthRouter);
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/candidates", candidatesRouter);
  app.use("/api/applications", applicationsRouter);
  app.use("/api/interviews", interviewsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/uploads", uploadsRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ success: false, message });
  });

  return app;
}
