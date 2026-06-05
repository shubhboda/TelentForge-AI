import { signupUser } from "../_lib/auth.js";
import { handleApiError, methodNotAllowed, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  try {
    const { email, password, fullName, role, organizationSlug } = req.body ?? {};
    if (!email || !password || !fullName) {
      sendJson(res, 400, { success: false, message: "Full name, email, and password are required" });
      return;
    }

    const result = await signupUser({ email, password, fullName, role, organizationSlug });
    sendJson(res, result.status, result.body);
  } catch (error) {
    handleApiError(res, error);
  }
}
