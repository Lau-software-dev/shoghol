import { fail } from "../utils/httpError.js";

// Writes must be JSON. A plain HTML form on another site can't send that, so together with the
// SameSite cookie this blocks cross-site form posts riding on someone's session (CSRF).
export default function requireJson(req, _res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (!req.is("application/json")) fail(415, "bad_type", "Send JSON.");
  next();
}
