# sportudei.com — website for a NaUKMA student organization

Sportudei is a student organization at the National University of Kyiv-Mohyla Academy that runs sports events for students. its biggest event is Mohyla Games, an inter-university tournament - the teams section on the site is built around that, showing who's competing. this is the site itself: a place to see what's coming up, browse photos from past events, and check out the teams and partners. built and deployed solo, front to back.

**live:** [sportudei.com](https://sportudei.com)

---

## what it does

two sides to it.

public site is what visitors see - events and mohyla games, photo gallery from each one, teams, partners, contacts. fast, responsive, works the same on phone as on laptop, with dark/light theme.

behind it is admin panel where the organization's people manage all of that themselves - adding events, uploading photos, editing teams and partners - without touching any code.

---

## stack

### backend

- **Go 1.26**, [chi](https://github.com/go-chi/chi) router
- **PostgreSQL 18**
- **pgx v5** as the driver, **sqlc** generates type-safe queries from SQL
- **goose** for migrations, applied automatically on startup
- **JWT** (access + refresh pair) for sessions
- OTP codes sent by email via **Resend**
- image processing pipeline that converts uploads to **WebP**
- **Swagger / OpenAPI**
- structured logging via `log/slog`
- clean architecture: domain → repository → service → handler → dto

### frontend

- **React 19 + TypeScript** on Vite
- **React Router v7**
- *vibe code

### infrastructure

- **AWS EC2**
- **Cloudflare**
- **Docker + Docker Compose**
- **Nginx**
- `deploy.sh`

---

## some of the more interesting parts

### two-step admin login

logging into admin panel is two steps. first email and password, then six digit code sent by email that expires in five minutes. even if password leaks, there's no getting in without access to that inbox. once both steps pass, JWT access/refresh pair is issued and stored in http-only cookies.

### photo processing

every photo uploaded through the admin panel goes through pipeline:

1. decode the file (JPEG, PNG, or WebP, up to 50mb)
2. generate three WebP variants in parallel:
   - **full** - up to 1920×1920, quality 85, for full-screen viewing
   - **medium** - up to 800×800, quality 80, for cards and previews
   - **small** - a 150×150 thumbnail
3. each variant is saved under a UUID filename, with the main path stored in the database

frontend picks whichever variant fits the context (`sm`/`md`/`lg`), so nobody on a phone downloads a 1920px image for a 300px card.

### events update themselves

events move through three statuses — `planned → in_progress → completed`. a background worker checks the event date every few minutes and flips the status on its own, no one has to do it by hand. a second worker cleans up photo files that have been soft-deleted in the database but are still sitting on disk.

### section toggles

from the admin panel, any major section of the site can be switched off without touching code — events, gallery, teams, partners, contacts, or the Mohyla Games page and its nav link. the frontend fetches these settings on load and renders accordingly, no page refresh needed.

### a small dashboard

the admin panel opens on a quick overview — how many events are planned, in progress, or completed, how many teams are active. nothing elaborate, just enough to see the state of things without digging through pages.

### drag-and-drop photo management

within an event or a gallery album, photos can be:

- reordered by dragging
- starred as the cover photo
- deleted one by one
- added to, by uploading more directly into an existing event

on save, the backend gets the final order, updates display order and the cover flag in a single transaction, and soft-deletes anything that was removed — the actual file cleanup happens later, in the background.

### contacts and partners are sortable too

same drag-and-drop idea, each entry has a `display_order` field updated through its own PATCH endpoint, so the public site always shows them in whatever order was set in the admin panel.

### gallery with a lightbox

on each event's page:

- a masonry grid that adapts to however many photos there are
- a viewer with next/previous navigation and a thumbnail strip
- a full-screen lightbox with keyboard and swipe-style controls
- smooth crossfade transitions between photos

### mobile

the whole site is responsive, and the mobile version isn't just a squeezed-down desktop:

- the menu drops down from the top instead of sliding in from the side
- the header goes solid when the menu is open
- hover effects are disabled on touch screens (`@media (hover: hover)`) so cards don't get stuck looking "hovered"
- a small tap-pulse animation stands in for hover on touch
- no bottom tab bar, just the dropdown menu
- scroll resets to the top on every page change

### dark / light theme

a full theming system built on CSS variables. the choice is saved to `localStorage` and applied through a `data-theme` attribute on `<html>`, so there's no flash of the wrong theme on reload.

---

## how it fits together

```
 ┌──────────────────────────────────────────────┐
 │  Cloudflare (DNS + TLS)                      │
 └──────────────────────┬───────────────────────┘
                        │ HTTPS :443
               ┌────────▼────────┐
               │      Nginx      │  ← serves React app
               │    (Docker)     │  ← /api/*  → backend:8000
               │                 │  ← /uploads/* → volume (cached 7d)
               └────────┬────────┘
                        │
           ┌────────────▼───────────┐
           │  Go REST API (Docker)  │  ← business logic
           └────────────┬───────────┘
                        │
             ┌──────────▼──────────┐
             │   PostgreSQL 18     │  ← migrations via goose
             │      (Docker)       │  ← type-safe queries via sqlc
             └─────────────────────┘
```

---

## backend layout

```
backend/internal/
├── domain/       ← entities, repository interfaces, domain errors
├── repository/   ← PostgreSQL implementations (sqlc-generated queries)
├── service/      ← business logic
├── handler/      ← HTTP handlers (parse request → call service → respond)
├── dto/          ← request/response structs, kept separate from domain models
├── router/       ← route registration, CORS, middleware wiring
├── auth/         ← JWT generation/validation
├── email/        ← Resend API client
├── middleware/   ← JWT auth check
├── worker/       ← background ticker workers
├── pkg/
│   ├── fileutil/ ← image processing and local file storage
│   └── httputil/ ← JSON response helpers, error mapping
└── config/       ← env-based configuration
```

---

## public endpoints

| method | path | description |
|---|---|---|
| GET | `/api/events` | paginated list of published events |
| GET | `/api/events/:id` | a single event with its photos |
| GET | `/api/gallery` | paginated list of albums |
| GET | `/api/gallery/:id` | album details |
| GET | `/api/gallery/:id/photos` | album photos, paginated |
| GET | `/api/teams` | list of teams |
| GET | `/api/teams/:id` | team detail |
| GET | `/api/partners` | list of partners |
| GET | `/api/contacts` | list of contacts |
| GET | `/api/mohyla-game` | Mohyla Games content |
| GET | `/api/settings` | site section toggles |


login flow itself is three calls:

| method | path | description |
|---|---|---|
| POST | `/api/auth/login` | step 1: check password, send the OTP code |
| POST | `/api/auth/verify` | step 2: check the OTP code, issue the JWT pair |
| POST | `/api/auth/refresh` | refresh an expired access token |

everything else under `/api/admin/` requires a valid JWT access token - full CRUD for events, gallery, teams, partners, contacts, and settings.

---

## running it locally

you'll need Docker, Go 1.26+, and Node.js 20+.

```bash
git clone https://github.com/locde0/sportudei-ukma
cd sportudei-ukma
cp .env.example .env
# fill in JWT_SECRET, RESEND_API_KEY, and DB credentials

# start the database + backend in Docker
docker compose up -d db backend
# migrations apply on their own

# frontend runs locally for fast HMR during dev
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## environment variables

| variable | what it's for |
|---|---|
| `APP_ENV` | `dev` or `prod` |
| `DB_*` | PostgreSQL credentials |
| `JWT_SECRET` | secret used to sign JWTs |
| `JWT_ACCESS_EXP_DAYS` | access token lifetime, in days |
| `JWT_REFRESH_EXP_DAYS` | same, for the refresh token |
| `RESEND_API_KEY` | [Resend](https://resend.com/) API key for OTP emails |
| `EMAIL_FROM` | sender address |
| `CORS_ORIGINS` | comma-separated allowed origins |
| `UPLOAD_DIR` | local folder for uploaded files |
| `VITE_API_URL` | API base URL used by the frontend |

---

## deployment

production runs on **AWS EC2**, with **Cloudflare** in front.

```bash
./deploy.sh   # ssh into EC2, pull latest, rebuild images, restart compose
```

TLS certificates from Cloudflare are mounted straight into the Nginx container. static assets are cached for a year (Vite gives them content-hashed names), uploaded photos for 7 days, and API responses go out with `Cache-Control: no-store`. container logs are JSON with rotation, capped at 10mb across 3 files, so nothing fills up the disk over time.

interactive API docs are available at `http://localhost:8000/swagger/` during local development (`APP_ENV=dev`).

---

## author

**Yurii Polishchuk** - designed, built, and deployed it solo (or so the commit history claims).

**Claude Sonnet, Claude Opus & Gemini** - actual authors of frontend, credited here per labor law.
