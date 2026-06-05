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

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(["admin", "recruiter", "manager", "candidate"]).optional(),
  organizationSlug: z.string().min(2).optional(),
});

function slugToOrganizationName(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function findOrCreateOrganization(slug: string) {
  const { data: existingOrganization, error: lookupError } = await supabaseAdmin
    .from("organizations")
    .select("id,slug")
    .eq("slug", slug)
    .maybeSingle();

  if (lookupError) {
    return { organization: null, created: false, error: lookupError };
  }

  if (existingOrganization) {
    return { organization: existingOrganization, created: false, error: null };
  }

  const { data: createdOrganization, error: createError } = await supabaseAdmin
    .from("organizations")
    .insert({
      name: slugToOrganizationName(slug),
      slug,
    })
    .select("id,slug")
    .single();

  if (createError || !createdOrganization) {
    return { organization: null, created: false, error: createError };
  }

  return { organization: createdOrganization, created: true, error: null };
}

function buildAuthTokens(user: { id: string; email: string; role: string; organizationId: string | null }) {
  const accessToken = jwt.sign(user, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
  const refreshToken = jwt.sign(user, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
  return { accessToken, refreshToken };
}

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
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const passwordHash = data.password_hash as string | null;
    if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const user = {
      id: data.id,
      email: data.email,
      role: data.role,
      organizationId: data.organization_id,
    };
    const { accessToken, refreshToken } = buildAuthTokens(user);

    res.json({
      success: true,
      data: {
        user: { id: data.id, email: data.email, fullName: data.full_name, role: data.role },
        accessToken,
        refreshToken,
      },
    });
    return;
  })
);

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { email, password, fullName, role, organizationSlug } = signupSchema.parse(req.body);

    const targetOrgSlug = organizationSlug ?? "talentforge-demo";

    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUserError) {
      res.status(500).json({ success: false, message: "Could not verify account state" });
      return;
    }

    if (existingUser) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }

    const { organization, created: organizationCreated, error: orgError } = await findOrCreateOrganization(targetOrgSlug);

    if (orgError || !organization) {
      res.status(500).json({ success: false, message: "Could not resolve organization" });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userRole = organizationCreated ? "admin" : (role ?? "recruiter");

    const { data: createdUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert({
        email,
        full_name: fullName,
        role: userRole,
        organization_id: organization.id,
        password_hash: passwordHash,
      })
      .select("id,email,full_name,role,organization_id")
      .single();

    if (createError || !createdUser) {
      res.status(500).json({ success: false, message: "Failed to create account" });
      return;
    }

    const user = {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      organizationId: createdUser.organization_id,
    };
    const { accessToken, refreshToken } = buildAuthTokens(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          fullName: createdUser.full_name,
          role: createdUser.role,
        },
        accessToken,
        refreshToken,
      },
    });
    return;
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(req.body);

    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        id: string;
        email: string;
        role: string;
        organizationId: string | null;
      };

      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("id,email,full_name,role,organization_id")
        .eq("id", payload.id)
        .maybeSingle();

      if (userError || !user) {
        res.status(401).json({ success: false, message: "User not found" });
        return;
      }

      const updatedUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
      };

      const { accessToken: newAccessToken } = buildAuthTokens(updatedUser);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken,
        },
      });
      return;
    } catch {
      res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
      return;
    }
  })
);
