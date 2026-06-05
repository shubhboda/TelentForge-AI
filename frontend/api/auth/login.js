import { loginUser } from "../_lib/auth.js";
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
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      sendJson(res, 400, { success: false, message: "Email and password are required" });
      return;
    }

    const result = await loginUser({ email, password });
    sendJson(res, result.status, result.body);
  } catch (error) {
    handleApiError(res, error);
  }
}
