import express from "express";
import { checkAuth, login, logout, me, signup } from "../controllers/auth.controller.js";
import { createAuthLimits } from "../Middleware/authLimits.js";
import verifyToken from "../Middleware/verifyToken.js";

// Built per app so each gets its own rate-limit counters (the tests rely on that).
export default function authRoute() {
  const router = express.Router();
  const limits = createAuthLimits();

  router.get("/me", me);
  router.get("/check-auth", verifyToken, checkAuth);

  router.post("/signup", limits.signup, signup);
  router.post("/login", limits.loginByIp, limits.loginByAccount, login);
  router.post("/logout", logout);

  return router;
}
