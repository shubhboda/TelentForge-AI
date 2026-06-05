import { handleApiError, methodNotAllowed, sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, { success: true, data: { status: "ok", service: "talentforge-backend" } });
    return;
  }

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    methodNotAllowed(res);
  } catch (error) {
    handleApiError(res, error);
  }
}
