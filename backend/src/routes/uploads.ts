import { Router } from "express";
import multer from "multer";
import { env } from "../config/env.js";

export const uploadsRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadsRouter.post("/resume", upload.single("resume"), async (_req, res) => {
  res.status(201).json({
    success: true,
    data: {
      bucket: env.SUPABASE_STORAGE_BUCKET,
      message: "Resume upload endpoint scaffolded for Supabase Storage",
    },
  });
});
