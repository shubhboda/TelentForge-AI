import { Router } from "express";

export const analyticsRouter = Router();

analyticsRouter.get("/summary", (_req, res) => {
  res.json({
    success: true,
    data: {
      candidateCount: 0,
      applicationCount: 0,
      interviewCount: 0,
      hiringVelocity: 0,
    },
  });
});
