# Shoghol — Topic 04, Freelance Gig Board

CSC443 Web Programming · Fall 2026 · Team 404 — Emma Chakkour · Karim Hawa · Giovanny Raad

React rebuild of the design pack in `../topic-04-freelance-gig-board/` (the spec — not copied in).

## Who builds what

> Agree this before writing code. The individual examination is built from this table.

| Surface | Spec | Route | Owner |
|---|---|---|---|
| Home | `01-home.html` | `/` |Emma |
| Find work | `02-browse.html` | `/browse` | Giovanni |
| Job detail | `03-gig.html` | `/gigs/:gigId` | Karim |
| Post a job | `04-post.html` | `/post` | Emma |
| My jobs | `05-mine.html` | `/mine` | |
| Sign in & register | `06-auth.html` | `/signin`, `/register` | Karim|
| Status track (shared) | `components.html` | `/dev/status-track` (preview) |. |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # vitest, once
npm run test:watch
npm run build
```

## Stack

Vite + React 19, React Router, Tailwind CSS **3.4.19** (same version the pack was
compiled with, so its class names work unchanged). Theme tokens (`paper`, `ink`,
`line`, `surface`, `muted`, `brand-*`, `accent-*`, `rounded-card`, `font-display`,
`font-body`) are in `tailwind.config.js`. Fonts (Chivo, Karla) are embedded in
`src/fonts.css`, lifted from the pack, so the app works offline.

## Layout

```
src/
  domain/gigStatus.js        GIG_STATUS, trackFor(status), acceptsOffers(gig)
  components/StatusTrack.jsx the signature component — <StatusTrack gig={gig} />
  layout/                    site header + page shell
  pages/                     surfaces (placeholders until built) + track preview
```

## The status track

`<StatusTrack gig={gig} className="…" />` draws Open → Assigned → Delivered → Closed
from `gig.status` alone. Cancelled is a stop, not a fifth step: every step greys and
a line of text says so. The caller frames it (`className`), because the surfaces
frame it differently (card on detail, divider inside a My-jobs card).

Deviation from the pack: at widths below `sm` the four labels do not fit beside their
dots (the pack itself overlaps at 390px), so each label sits under its dot. At `sm`
and wider it matches the pack exactly.

## House rule

A job may have exactly one accepted offer; accepting it rejects every other pending
offer in the same operation; a job that is not Open accepts no offers; nobody offers
on their own job. `acceptsOffers(gig)` covers the third; the rest belongs with the
offer data when it is built. Phase 1 enforces it in the interface, Phase 2 in the API.
