import mongoose from "mongoose";

// Tokens signed out before they expired. A JWT can't be cancelled by itself, so logout records its id
// here and verifyToken refuses it. MongoDB deletes each row once the token would have expired anyway.
const RevokedTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});

export default mongoose.model("RevokedToken", RevokedTokenSchema);
