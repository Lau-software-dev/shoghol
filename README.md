# Shoghol — Topic 04, Freelance Gig Board

CSC443 Web Programming · Fall 2026 · Section 31

**Team 404**

| Member | Student ID |
|---|---|
| Emma Chakkour | 202305303 |
| Karim Hawa | 202403573 |
| Giovanny Raad | 202402756 |

**Topic 04 — Freelance Gig Board** · brief reference `CSC443-F26 · T04 · rev A`

**Live:** https://shoghol-gamma.vercel.app

React rebuild of the Shoghol design pack (the spec — not copied in).

```
frontend/   React 19 + Vite + Tailwind CSS 3.4.19 + React Router — runs on its own, demo data in React state
backend/    Node + Express 5 + MongoDB (Mongoose) — JWT cookie auth (not wired to the frontend in Phase 1)
```

## Who builds what

> The individual examination is built from this table. All paths are under `frontend/src/`.

| Member | Surface | Spec | Route | Files |
|---|---|---|---|---|
| Emma Chakkour | Home | `01-home.html` | `/` | `pages/home/HomePage.jsx`, `pages/home/RuleCard.jsx` |
| Emma Chakkour | Post a job (and edit) | `04-post.html` | `/post`, `/post?edit=:gigId` | `pages/post/PostPage.jsx`, `pages/post/validateGig.js`, `components/ConfirmDialog.jsx`, `domain/categories.js` |
| Giovanny Raad | Find work | `02-browse.html` | `/browse` | `pages/browse/BrowsePage.jsx`, `pages/browse/FilterBar.jsx`, `pages/browse/filterGigs.js`, `pages/browse/NoMatches.jsx`, `pages/browse/Pagination.jsx`, `components/GigRow.jsx`, `lib/format.js` |
| Giovanny Raad | My jobs | `05-mine.html` | `/mine`, `/mine?tab=offers` | `pages/mine/MinePage.jsx`, `pages/mine/PostedCard.jsx`, `pages/mine/OfferRow.jsx`, `components/EmptyState.jsx`, `components/ErrorState.jsx` |
| Karim Hawa | Job detail | `03-gig.html` | `/gigs/:gigId` | `pages/gig/GigPage.jsx`, `pages/gig/ViewerPanel.jsx`, `pages/gig/OfferList.jsx`, `pages/gig/OfferForm.jsx`, `pages/gig/validateOffer.js` |
| Karim Hawa | Sign in & register | `06-auth.html` | `/signin`, `/register` | `pages/auth/SignInPage.jsx`, `pages/auth/RegisterPage.jsx`, `pages/auth/AuthCard.jsx`, `auth/*` |
| Karim Hawa | Status track (shared component) | `components.html` | `/dev/status-track` (preview) | `components/StatusTrack.jsx`, `domain/gigStatus.js`, `domain/offers.js`, `components/Badge.jsx`, `components/Button.jsx`, `components/TextField.jsx`, `layout/*` |

Shared by everyone: `App.jsx` (routes), `gigs/GigsProvider.jsx` + `gigs/GigsContext.js` (the jobs in state,
set up by Karim), `gigs/seed.js` (the 45 demo jobs, written by Giovanny), `components/buttonStyles.js`.

## Entities

| Entity | Fields |
|---|---|
| **User** | `id` (= email), `name`, `initials`, `email` (`@lau.edu`), `skills` ("what you do"), `password` |
| **Job** (gig) | `id`, `title`, `category` (Design · Web · Video · Writing · Tutoring), `description`, `budget` (USD), `wantedBy` (date), `postedAt` (date), `poster` (`{ name, email }`), `status` (open → assigned → delivered → closed, or cancelled), `offers[]` |
| **Offer** | `id`, `freelancer` (`{ name, email }`), `amount` (USD), `days`, `message`, `status` (pending · accepted · rejected · auto_rejected) |

A job holds its offers; poster and freelancer point to users by email, so a job links to its poster's
other jobs (`/browse?poster=…`) and an offer links back to its job.

## Run it

You need Node.js 20.19+ (or 22.12+) and Git. The frontend needs no server: sign-in and jobs are demo data held in React state.

```sh
git clone https://github.com/Lau-software-dev/shoghol.git
cd shoghol/frontend
npm install
npm run dev                # open http://localhost:5173
```

`npm run build` makes the production build in `frontend/dist/`; `npm test` runs the tests.

## Screenshots

All in [`docs/screenshots/`](docs/screenshots/), taken at 1280px (desktop) and 390px (phone).

| | |
|---|---|
| Home | ![Home](docs/screenshots/01-home.png) |
| Find work | ![Find work](docs/screenshots/02-browse.png) |
| Find work, filtered (`?cat=Web&min=100`) | ![Find work filtered](docs/screenshots/02-browse-filtered.png) |
| Find work, loading / error / no matches | ![Loading](docs/screenshots/02-browse-loading.png) ![Error](docs/screenshots/02-browse-error.png) ![No matches](docs/screenshots/02-browse-empty.png) |
| Job detail: signed out / another user / owner | ![Signed out](docs/screenshots/03-gig-signed-out.png) ![Other user](docs/screenshots/03-gig-other-user.png) ![Owner](docs/screenshots/03-gig-owner.png) |
| Post a job, with errors | ![Post a job](docs/screenshots/04-post.png) |
| My jobs: Posted / My offers | ![Posted](docs/screenshots/05-mine-posted.png) ![My offers](docs/screenshots/05-mine-offers.png) |
| Sign in / register | ![Sign in](docs/screenshots/06-signin.png) ![Register](docs/screenshots/06-register.png) |
| Phone (390px) | ![Find work on a phone](docs/screenshots/02-browse-phone.png) ![My jobs on a phone](docs/screenshots/05-mine-phone.png) |

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
