export function getEnv() {
  const required = {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  return {
    JWT_ACCESS_SECRET: required.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: required.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL ?? "15m",
    REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL ?? "7d",
    SUPABASE_URL: required.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: required.SUPABASE_SERVICE_ROLE_KEY,
  };
}
