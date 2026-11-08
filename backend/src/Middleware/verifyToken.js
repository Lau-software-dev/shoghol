import { fail } from "../utils/httpError.js";
import { readSession } from "../utils/generateTokenAndSetCookie.js";

// For routes that need a signed-in user. Sets req.userId (and req.session) or answers 401.
// The jobs and offers routes use this — hiding a button in React is not protection.
export default async function verifyToken(req, _res, next) {
  const session = await readSession(req);
  if (!session) fail(401, "signed_out", "Sign in first.");
  req.userId = session.userId;
  req.session = session;
  next();
}
