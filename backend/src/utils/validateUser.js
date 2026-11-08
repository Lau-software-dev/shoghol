// Field rules for accounts. The register form checks the same things first; these are the ones that count.
import { fail } from "./httpError.js";

// Accounts are tied to a university address: people are agreeing to pay each other.
export const UNIVERSITY_EMAIL = /^[^\s@]+@lau\.edu$/;

export function cleanEmail(raw) {
  const email = String(raw ?? "").trim().toLowerCase();
  if (email.length > 254 || !UNIVERSITY_EMAIL.test(email))
    fail(400, "bad_email", "Use your @lau.edu address.");
  return email;
}

export function cleanName(raw) {
  const name = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) fail(400, "bad_name", "Enter your full name.");
  return name;
}

export function cleanSkills(raw) {
  const skills = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (skills.length < 2 || skills.length > 120)
    fail(400, "bad_skills", "Say what you do in a few words, so offers carry something to judge.");
  return skills;
}

export function checkPassword(raw) {
  if (typeof raw !== "string" || raw.length < 8)
    fail(400, "weak_password", "Passwords need at least 8 characters.");
  if (raw.length > 200) fail(400, "bad_password", "Passwords can be at most 200 characters.");
}
