import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "shoghol-backend",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

router.get("/db", (_req, res) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const readyState = mongoose.connection.readyState;
  const ok = readyState === 1;
  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "unavailable",
    mongo: { readyState, dbName: mongoose.connection.name || null },
    timestamp: new Date().toISOString(),
  });
});

export default router;
