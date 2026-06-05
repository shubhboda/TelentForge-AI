import { Router } from "express";

export const applicationsRouter = Router();

applicationsRouter.get("/", (_req, res) => {
  res.json({ success: true, data: [] });
});
