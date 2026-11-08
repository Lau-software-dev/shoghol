import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { fail } from "../utils/httpError.js";
import { checkPassword, cleanEmail, cleanName, cleanSkills } from "../utils/validateUser.js";
import generateTokenAndSetCookie, {
  clearAuthCookie,
  readSession,
  revokeSession,
} from "../utils/generateTokenAndSetCookie.js";

const rounds = () => Number(process.env.BCRYPT_ROUNDS) || 12;

// Never says which half was wrong.
const WRONG_LOGIN = "That email and password do not match.";

// Compared against when the email has no account, so the reply takes as long either way and
// response time doesn't reveal who has an account.
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash("no-such-account", rounds()));

export async function signup(req, res) {
  const name = cleanName(req.body.name);
  const email = cleanEmail(req.body.email);
  const skills = cleanSkills(req.body.skills);
  checkPassword(req.body.password);

  if (await User.exists({ email }))
    fail(409, "email_taken", "An account already uses that email. Sign in instead.");

  const hashedPassword = await bcrypt.hash(req.body.password, rounds());
  let user;
  try {
    user = await User.create({ name, email, skills, hashedPassword });
  } catch (error) {
    // Two sign-ups racing for the same email: the unique index stops the second.
    if (error?.code === 11000) fail(409, "email_taken", "An account already uses that email.");
    throw error;
  }

  generateTokenAndSetCookie(res, user._id);
  return res.status(201).json({ success: true, message: "Account created", user });
}

export async function login(req, res) {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  if (email.length > 254 || password.length > 200) fail(401, "wrong_login", WRONG_LOGIN);

  const user = await User.findOne({ email }).select("+hashedPassword");
  const ok = await bcrypt.compare(password, user?.hashedPassword ?? (await getDummyHash()));
  if (!user || !ok) fail(401, "wrong_login", WRONG_LOGIN);

  user.lastLoginAt = Date.now();
  await user.save();
  generateTokenAndSetCookie(res, user._id);
  return res.status(200).json({ success: true, message: "Signed in", user });
}

export async function logout(req, res) {
  const session = await readSession(req);
  if (session) await revokeSession(session);
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: "Signed out" });
}

/** Who is signed in. Answers user: null rather than 401, so the app can ask on every page load. */
export async function me(req, res) {
  const session = await readSession(req);
  const user = session ? await User.findById(session.userId) : null;
  if (session && !user) clearAuthCookie(res); // account deleted since
  return res.status(200).json({ success: true, user: user ?? null });
}

/** Same as me, but behind verifyToken: 401 when signed out. */
export async function checkAuth(req, res) {
  const user = await User.findById(req.userId);
  if (!user) fail(401, "signed_out", "Sign in first.");
  return res.status(200).json({ success: true, user });
}
