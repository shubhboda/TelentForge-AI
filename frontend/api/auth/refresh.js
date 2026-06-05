import { refreshSession } from "../_lib/auth.js";
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
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) {
      sendJson(res, 400, { success: false, message: "Refresh token is required" });
      return;
    }

    const result = await refreshSession(refreshToken);
    sendJson(res, result.status, result.body);
  } catch (error) {
    handleApiError(res, error);
  }
}
