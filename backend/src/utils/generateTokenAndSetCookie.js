import crypto from "crypto";
import jwt from "jsonwebtoken";
import RevokedToken from "../models/RevokedToken.js";

const LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isProduction = () => (process.env.MODE || process.env.NODE_ENV || "").toLowerCase() === "production";

// Same-site by default: in dev the Vite server proxies /api, and in production serve both from one
// origin. Set CROSS_SITE_COOKIES=true only if the frontend and API live on different sites.
export const cookieOptions = () => {
  const crossSite = process.env.CROSS_SITE_COOKIES === "true";
  return {
    httpOnly: true, // the page's JavaScript can't read it, so an XSS can't steal it
    secure: isProduction() || crossSite,
    sameSite: crossSite ? "none" : "lax",
    path: "/",
  };
};

export default function generateTokenAndSetCookie(res, userId) {
  // jti lets logout revoke this one token without signing the user out everywhere.
  const token = jwt.sign({ userId: String(userId), jti: crypto.randomUUID() }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("authToken", token, { ...cookieOptions(), maxAge: LIFETIME_MS });
  return token;
}

export function clearAuthCookie(res) {
  res.clearCookie("authToken", cookieOptions());
}

/** The token's { userId, jti, exp } if it is valid and not signed out, otherwise null. */
export async function readSession(req) {
  const token = req.cookies?.authToken;
  if (!token) return null;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null; // expired, forged or malformed
  }
  if (!decoded?.userId || !decoded.jti) return null;
  if (await RevokedToken.exists({ jti: decoded.jti })) return null;
  return decoded;
}

export async function revokeSession(session) {
  await RevokedToken.updateOne(
    { jti: session.jti },
    { $setOnInsert: { jti: session.jti, expiresAt: new Date(session.exp * 1000) } },
    { upsert: true },
  );
}
