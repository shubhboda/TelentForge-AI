import { Router } from "express";

export const interviewsRouter = Router();

interviewsRouter.get("/", (_req, res) => {
  res.json({ success: true, data: [] });
});
