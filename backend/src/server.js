import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

// Fail fast if critical env vars are absent — prevents mysterious runtime crashes.
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];
const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]?.trim());
if (missingVars.length > 0) {
  console.error(`[startup] Missing required environment variables: ${missingVars.join(", ")}`);
  console.error("[startup] Copy .env.template to .env and fill it in, or run `npm run dev:memory`.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  createApp().listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
