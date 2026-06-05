import { Router } from "express";

export const jobsRouter = Router();

jobsRouter.get("/", (_req, res) => {
  res.json({ success: true, data: [] });
});

jobsRouter.post("/", (_req, res) => {
  res.status(201).json({ success: true, data: { message: "Job creation endpoint scaffolded" } });
});
