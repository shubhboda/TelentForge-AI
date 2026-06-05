export function sendJson(res, status, body) {
  res.status(status).json(body);
}

export function methodNotAllowed(res) {
  sendJson(res, 405, { success: false, message: "Method not allowed" });
}

export function handleApiError(res, error) {
  const message = error instanceof Error ? error.message : "Internal server error";
  sendJson(res, 500, { success: false, message });
}
