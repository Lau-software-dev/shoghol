# Shoghol — Topic 04, Freelance Gig Board

CSC443 Web Programming · Fall 2026 · Team 404 — Emma Chakkour · Karim Hawa · Giovanny Raad

React rebuild of the design pack in `../topic-04-freelance-gig-board/` (the spec — not copied in).

```
frontend/   React 19 + Vite + Tailwind CSS 3.4.19 + React Router — runs on its own, demo data in React state
backend/    Node + Express 5 + MongoDB (Mongoose) — JWT cookie auth (not wired to the frontend in Phase 1)
```

## Who builds what

> Agree this before writing code. The individual examination is built from this table.

| Surface | Spec | Route | Owner |
|---|---|---|---|
| Home | `01-home.html` | `/` |Emma |
| Find work | `02-browse.html` | `/browse` |. |
| Job detail | `03-gig.html` | `/gigs/:gigId` | Karim |
| Post a job | `04-post.html` | `/post` | .m |
| My jobs | `05-mine.html` | `/mine` | . |
| Sign in & register | `06-auth.html` | `/signin`, `/register` | Karim|
| Status track (shared) | `components.html` | `/dev/status-track` (preview) |. |

## Run it

The frontend needs no server: sign-in and jobs are demo data held in React state.

```sh
cd frontend
npm install
npm run dev                # http://localhost:5173
npm test
```

Demo accounts (password `shoghol123` for all — the sign-in page has buttons that fill them in):
`emma.chakkour@lau.edu`, `karim.hawa@lau.edu`, `giovanny.raad@lau.edu`, `lea.haddad@lau.edu`,
`njteh.balian@lau.edu`. Emma posted the logo and translation jobs, Karim the calculus one,
Giovanny the photo one. Registering adds an account to state; a reload resets everything.

Data states are simulated on purpose: jobs arrive after 400 ms (skeleton meanwhile).
Add `?simulate=error` to any address to make the first load fail (then *Try again*), or
`?simulate=slow` for a 2-second wait.

The backend is kept for Phase 2 (`cd backend && npm install && npm run dev`, `npm test`).

## Frontend

Tailwind CSS **3.4.19** — the version the design pack was compiled with, so its class names
paste in unchanged. Theme tokens (`paper`, `ink`, `line`, `surface`, `muted`, `brand-*`,
`accent-*`, `rounded-card`, `font-display`, `font-body`) are in `frontend/tailwind.config.js`.
Fonts (Chivo, Karla) are embedded in `frontend/src/fonts.css`, so it works offline.

```
frontend/src/
  domain/gigStatus.js        GIG_STATUS, trackFor(status), acceptsOffers(gig)
  domain/offers.js           the house rule as pure functions: withAcceptedOffer(gig, id), canOffer, isPoster…
  gigs/GigsProvider.jsx      the jobs: ONE array in useState, shared via context — useGigs() → { gigs, status, retry, save, add }
  gigs/seed.js               the demo jobs it starts from
  components/Badge.jsx       status vocabulary — <Badge status="open" />, "accepted", "yours"…
  components/StatusTrack.jsx the signature component — <StatusTrack gig={gig} />
  components/TextField.jsx   labelled input; error wired with aria-invalid/-describedby
  components/Button.jsx      variants: propose, commit, secondary, quiet, destroy
  auth/                      AuthProvider (React state), demoUsers, useAuth(), RequireAuth, validateRegister
  layout/                    site header (account menu) + page shell
  pages/                     surfaces (placeholders until built), auth pages, track preview
```

### The status track

`<StatusTrack gig={gig} className="…" />` draws Open → Assigned → Delivered → Closed from
`gig.status` alone. Cancelled is a stop, not a fifth step: every step greys and a line of text
says so. The caller frames it (`className`), because surfaces frame it differently.

Deviation from the pack: below `sm` the four labels do not fit beside their dots (the pack
itself overlaps at 390px), so each label sits under its dot. At `sm` and wider it matches.

## Backend

Same layout as our earlier Express projects:

```
backend/src/
  server.js                  loads .env, checks required vars, connects, listens
  app.js                     createApp(): middleware, routes, error handler (tests use this)
  config/                    db.js (Mongoose), upstash.js (optional global rate limit)
  models/                    User, RevokedToken
  controllers/               auth.controller.js
  routes/                    auth.route.js, health.route.js
  Middleware/                verifyToken, requireJson, authLimits, rateLimiter
  utils/                     generateTokenAndSetCookie, validateUser, httpError
```

Every response is `{ success, … }`; errors are `{ success: false, code, message }` with a
stable `code` the frontend switches on (`email_taken`, `wrong_login`, `signed_out`…).
Controllers `fail(status, code, message)` and the error handler in `app.js` answers.

| Route | | |
|---|---|---|
| `POST /api/auth/signup` | `{ name, email, skills, password }` | 201 + cookie |
| `POST /api/auth/login` | `{ email, password }` | 200 + cookie |
| `POST /api/auth/logout` | | clears cookie, revokes the token |
| `GET /api/auth/me` | | `{ user }` or `{ user: null }` |
| `GET /api/auth/check-auth` | behind `verifyToken` | `{ user }` or 401 |
| `GET /api/health`, `/api/health/db` | | liveness, database state |

### Auth

- **Accounts**: full name, `@lau.edu` email (checked on the server, not just the form),
  "what you do", password of 8+ characters, hashed with bcrypt.
- **Session**: a 7-day JWT in an `HttpOnly` `authToken` cookie (`Secure` in production,
  `SameSite=Lax`). Logout records the token's id in `RevokedToken`, so a copied cookie stops
  working too; MongoDB deletes those rows once the token would have expired.
- **Sign-in errors** never say which half was wrong, and take as long either way.
- **Rate limits**: 5 new accounts an hour per address; 10 wrong passwords per 15 minutes per
  address and per account. Optional site-wide cap through Upstash, as in Alizone.
- **Writes** must be JSON (with the SameSite cookie, this blocks cross-site form posts).
- **Protect a route**: `router.post("/", verifyToken, handler)` — then `req.userId` is set.
  `<RequireAuth>` in the frontend is convenience only; the API must check on its own.
- In components: `const { user, status, signIn, register, signOut } = useAuth()`.
- **Phase 1 frontend**: `AuthProvider` does not call this API. It keeps the accounts and the
  signed-in user in React state, seeded from `auth/demoUsers.js`, with the same error codes
  (`wrong_login`, `email_taken`, `bad_*`). In Phase 2, swap its three functions for API calls.
  Tests sign someone in with `<AuthProvider initialUser="emma.chakkour@lau.edu">`.
- Not built: password reset and email verification.

### Where the data lives (Phase 1)

The jobs are one array in `useState` inside `GigsProvider`, shared through context, as the brief
asks ("held in React state"). A page reads `gigs` and changes it in two steps: a pure rule from
`domain/offers.js` builds the whole next job (or throws, and nothing changes), then one `save(next)`
— a single `setGigs` — replaces it. Every page reading `gigs` (job detail, Find work, My jobs)
re-renders from the same array, so there are no copies to keep in sync:

```jsx
const { gigs, save } = useGigs()
const gig = gigs.find((g) => g.id === gigId)
save(withAcceptedOffer(gig, offer.id))        // Find work: filter(gigs…)  My jobs: gigs.filter((g) => isPoster(g, user))
```

Only the poster is shown the offer list and the poster's buttons — in Phase 1 the rule lives in
the interface; in Phase 2 the API enforces it and `save` becomes a request.

## House rule

A job may have exactly one accepted offer; accepting it rejects every other pending offer in
the same operation; a job that is not Open accepts no offers; nobody offers on their own job.
`acceptsOffers(gig)` covers the third on the frontend. On the backend, accept must run in one
MongoDB transaction (`session.withTransaction`) — the test database is already a replica set
so transactions work there. Phase 1 enforces the rule in the interface, Phase 2 in the API.
