import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getEnv } from "./env.js";
import { getSupabaseAdmin } from "./supabase.js";

function slugToOrganizationName(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function findOrCreateOrganization(slug) {
  const supabaseAdmin = getSupabaseAdmin();
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
    .insert({ name: slugToOrganizationName(slug), slug })
    .select("id,slug")
    .single();

  if (createError || !createdOrganization) {
    return { organization: null, created: false, error: createError };
  }

  return { organization: createdOrganization, created: true, error: null };
}

export function buildAuthTokens(user) {
  const env = getEnv();
  const accessToken = jwt.sign(user, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
  const refreshToken = jwt.sign(user, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL });
  return { accessToken, refreshToken };
}

export async function loginUser({ email, password }) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id,email,full_name,role,organization_id,password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) {
    return { status: 401, body: { success: false, message: "Invalid credentials" } };
  }

  const passwordHash = data.password_hash;
  if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
    return { status: 401, body: { success: false, message: "Invalid credentials" } };
  }

  const user = {
    id: data.id,
    email: data.email,
    role: data.role,
    organizationId: data.organization_id,
  };
  const { accessToken, refreshToken } = buildAuthTokens(user);

  return {
    status: 200,
    body: {
      success: true,
      data: {
        user: { id: data.id, email: data.email, fullName: data.full_name, role: data.role },
        accessToken,
        refreshToken,
      },
    },
  };
}

export async function signupUser({ email, password, fullName, role, organizationSlug }) {
  const supabaseAdmin = getSupabaseAdmin();
  const targetOrgSlug = organizationSlug ?? "talentforge-demo";

  const { data: existingUser, error: existingUserError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUserError) {
    return { status: 500, body: { success: false, message: "Could not verify account state" } };
  }

  if (existingUser) {
    return { status: 409, body: { success: false, message: "Email already registered" } };
  }

  const { organization, created: organizationCreated, error: orgError } =
    await findOrCreateOrganization(targetOrgSlug);

  if (orgError || !organization) {
    return { status: 500, body: { success: false, message: "Could not resolve organization" } };
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
    return { status: 500, body: { success: false, message: "Failed to create account" } };
  }

  const user = {
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
    organizationId: createdUser.organization_id,
  };
  const { accessToken, refreshToken } = buildAuthTokens(user);

  return {
    status: 201,
    body: {
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
    },
  };
}

export async function refreshSession(refreshToken) {
  const env = getEnv();
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id,email,full_name,role,organization_id")
      .eq("id", payload.id)
      .maybeSingle();

    if (userError || !user) {
      return { status: 401, body: { success: false, message: "User not found" } };
    }

    const updatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    };
    const { accessToken: newAccessToken } = buildAuthTokens(updatedUser);

    return {
      status: 200,
      body: {
        success: true,
        data: { accessToken: newAccessToken, refreshToken },
      },
    };
  } catch {
    return { status: 401, body: { success: false, message: "Invalid or expired refresh token" } };
  }
}
