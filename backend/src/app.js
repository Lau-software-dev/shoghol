import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import requireJson from "./Middleware/requireJson.js";
import createRateLimiter from "./Middleware/rateLimiter.js";
import authRoute from "./routes/auth.route.js";
import healthRoute from "./routes/health.route.js";
import { HttpError } from "./utils/httpError.js";

// The Express app without listening or connecting to the database, so the tests can drive it directly.
export function createApp({ trustProxy = Number(process.env.TRUST_PROXY ?? 0) } = {}) {
  const app = express();
  const FRONTEND_URL =
    process.env.MODE === "production"
      ? process.env.FRONTEND_PROD_URL || "http://localhost:5173"
      : process.env.FRONTEND_DEV_URL || "http://localhost:5173";

  // Behind a host's proxy (Render, Railway…) set TRUST_PROXY=1 so req.ip is the visitor, not the proxy.
  app.set("trust proxy", trustProxy);

  app.use(helmet());
  app.use(express.json({ limit: "100kb" }));
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
  app.use(createRateLimiter());
  app.use(cookieParser());
  app.use(requireJson);

  app.use("/api/health", healthRoute);
  app.use("/api/auth", authRoute());
  // app.use("/api/jobs", jobRoute());  — the house rule's server side goes here.

  app.use("/api", (_req, res) => res.status(404).json({ success: false, code: "not_found", message: "Nothing here." }));

  // Every error ends here: fail(...) from a controller, a bad JSON body, or a bug.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError)
      return res.status(err.status).json({ success: false, code: err.code, message: err.message });
    if (err.type === "entity.parse.failed")
      return res.status(400).json({ success: false, code: "bad_json", message: "The request body isn't valid JSON." });
    if (err.type === "entity.too.large")
      return res.status(413).json({ success: false, code: "too_big", message: "That's too much data." });
    console.error(err);
    return res
      .status(500)
      .json({ success: false, code: "server_error", message: "Something went wrong on our side. Try again." });
  });

  return app;
}
