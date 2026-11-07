import mongoose from "mongoose";
import { UNIVERSITY_EMAIL } from "../utils/validateUser.js";

const initialsOf = (name) => {
  const parts = name.split(" ").filter(Boolean);
  return [parts[0], parts.length > 1 ? parts.at(-1) : null]
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [UNIVERSITY_EMAIL, "Use your @lau.edu address"],
    },

    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    // "What you do" — shown beside their offers so posters have something to judge.
    skills: {
      type: String,
      required: [true, "Say what you do"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    hashedPassword: {
      type: String,
      required: true,
      select: false,
    },

    lastLoginAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    // What the client sees of a user: never the hash.
    toJSON: {
      transform: (_doc, u) => ({
        id: String(u._id),
        email: u.email,
        name: u.name,
        initials: initialsOf(u.name),
        skills: u.skills,
        createdAt: u.createdAt,
      }),
    },
  },
);

export default mongoose.model("User", UserSchema);
