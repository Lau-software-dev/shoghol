import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closeTestDb, resetTestDb, startTestDb, testApp } from "./helpers.js";

const EMMA = {
  name: "  Emma Chakkour ",
  email: " Emma.Chakkour@LAU.edu ",
  skills: "Design, video editing",
  password: "hunter22!",
};

beforeAll(startTestDb);
afterAll(closeTestDb);
beforeEach(resetTestDb);

/** A browser: keeps the authToken cookie between requests. */
const browser = (app) => request.agent(app);

describe("signup", () => {
  it("creates the account, signs in, and never returns the hash", async () => {
    const app = testApp();
    const agent = browser(app);
    const res = await agent.post("/api/auth/signup").send(EMMA);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toMatchObject({
      name: "Emma Chakkour",
      email: "emma.chakkour@lau.edu",
      skills: "Design, video editing",
      initials: "EC",
    });
    expect(JSON.stringify(res.body)).not.toMatch(/hashedPassword|\$2[aby]\$/);

    const cookie = res.headers["set-cookie"].join(";");
    expect(cookie).toMatch(/authToken=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);

    const me = await agent.get("/api/auth/me");
    expect(me.body.user.email).toBe("emma.chakkour@lau.edu");
  });

  it("only takes a university address", async () => {
    const app = testApp();
    for (const email of ["emma@gmail.com", "emma@lau.edu.evil.com", "emma@notlau.edu", "@lau.edu", "nope"]) {
      const res = await request(app).post("/api/auth/signup").send({ ...EMMA, email });
      expect([email, res.status, res.body.code]).toEqual([email, 400, "bad_email"]);
    }
  });

  it("refuses an email already in use, whatever the case", async () => {
    const app = testApp();
    await request(app).post("/api/auth/signup").send(EMMA);
    const again = await request(app)
      .post("/api/auth/signup")
      .send({ ...EMMA, email: "EMMA.chakkour@lau.edu" });
    expect([again.status, again.body.code]).toEqual([409, "email_taken"]);
  });

  it("checks every field", async () => {
    const app = testApp();
    const code = async (patch) =>
      (await request(app).post("/api/auth/signup").send({ ...EMMA, ...patch })).body.code;
    expect(await code({ name: " " })).toBe("bad_name");
    expect(await code({ name: "x".repeat(81) })).toBe("bad_name");
    expect(await code({ skills: "" })).toBe("bad_skills");
    expect(await code({ skills: "x".repeat(121) })).toBe("bad_skills");
    expect(await code({ password: "short" })).toBe("weak_password");
    expect(await code({ password: 12345678 })).toBe("weak_password");
  });

  it("allows 5 sign-ups an hour from one address", async () => {
    const app = testApp();
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ ...EMMA, email: `u${i}@lau.edu` });
      expect(res.status).toBe(201);
    }
    const sixth = await request(app).post("/api/auth/signup").send({ ...EMMA, email: "u9@lau.edu" });
    expect(sixth.status).toBe(429);
  });
});

describe("login", () => {
  it("signs in with email and password, whatever the email's case", async () => {
    const app = testApp();
    await request(app).post("/api/auth/signup").send(EMMA);
    const agent = browser(app);
    const res = await agent
      .post("/api/auth/login")
      .send({ email: "EMMA.CHAKKOUR@lau.edu", password: EMMA.password });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Emma Chakkour");
    expect((await agent.get("/api/auth/me")).body.user.name).toBe("Emma Chakkour");
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const app = testApp();
    await request(app).post("/api/auth/signup").send(EMMA);
    const wrongPw = await request(app)
      .post("/api/auth/login")
      .send({ email: EMMA.email, password: "nope-nope" });
    const noUser = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@lau.edu", password: EMMA.password });
    expect(wrongPw.status).toBe(401);
    expect(noUser.status).toBe(401);
    expect(wrongPw.body).toEqual(noUser.body);
    expect(wrongPw.body.code).toBe("wrong_login");
  });

  it("locks an account out after 10 tries in 15 minutes, from any address", async () => {
    const app = testApp();
    await request(app).post("/api/auth/signup").send(EMMA);
    for (let i = 0; i < 10; i++)
      await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", `198.51.100.${i}`)
        .send({ email: EMMA.email, password: "wrong" });
    const locked = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "192.0.2.9")
      .send({ email: EMMA.email, password: EMMA.password });
    expect(locked.status).toBe(429);
  });
});

describe("session", () => {
  it("me answers user: null when signed out", async () => {
    const res = await request(testApp()).get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, user: null });
  });

  it("logout ends the token on the server, not just the cookie", async () => {
    const app = testApp();
    const signup = await request(app).post("/api/auth/signup").send(EMMA);
    const stolen = signup.headers["set-cookie"][0].split(";")[0]; // authToken=…

    const out = await request(app).post("/api/auth/logout").set("Cookie", stolen).send({});
    expect(out.status).toBe(200);
    expect(out.headers["set-cookie"].join(";")).toMatch(/authToken=;/);

    const replay = await request(app).get("/api/auth/me").set("Cookie", stolen);
    expect(replay.body.user).toBeNull();
  });

  it("rejects an expired or forged token", async () => {
    const app = testApp();
    const signup = await request(app).post("/api/auth/signup").send(EMMA);
    const userId = signup.body.user.id;
    const expired = jwt.sign({ userId, jti: "x" }, process.env.JWT_SECRET, { expiresIn: -10 });
    const forged = jwt.sign({ userId, jti: "y" }, "not-the-secret");
    for (const token of [expired, forged]) {
      const res = await request(app).get("/api/auth/me").set("Cookie", `authToken=${token}`);
      expect(res.body.user).toBeNull();
    }
  });

  it("verifyToken guards a route: 401 without a session", async () => {
    const res = await request(testApp()).get("/api/auth/check-auth");
    expect([res.status, res.body.code]).toEqual([401, "signed_out"]);
  });
});

describe("request checks", () => {
  it("refuses writes that are not JSON", async () => {
    const res = await request(testApp())
      .post("/api/auth/signup")
      .set("Content-Type", "text/plain")
      .send("name=x");
    expect([res.status, res.body.code]).toEqual([415, "bad_type"]);
  });

  it("answers unknown API paths with JSON 404", async () => {
    const res = await request(testApp()).get("/api/nope");
    expect([res.status, res.body.code]).toEqual([404, "not_found"]);
  });

  it("health check reports the database", async () => {
    const res = await request(testApp()).get("/api/health/db");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
