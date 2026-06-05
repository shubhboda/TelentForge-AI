import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id,email,full_name,role,organization_id,password_hash")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const passwordHash = data.password_hash as string | null;
    if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = {
      id: data.id,
      email: data.email,
      role: data.role,
      organizationId: data.organization_id,
    };

    const accessToken = jwt.sign(user, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
    const refreshToken = jwt.sign(user, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL });

    return res.json({
      success: true,
      data: {
        user: { id: data.id, email: data.email, fullName: data.full_name, role: data.role },
        accessToken,
        refreshToken,
      },
    });
  })
);
