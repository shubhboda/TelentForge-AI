import { Router } from "express";

export const candidatesRouter = Router();

candidatesRouter.get("/", (_req, res) => {
  res.json({ success: true, data: [] });
});
