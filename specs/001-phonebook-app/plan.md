# Implementation Plan: Phonebook Contact Manager

**Branch**: `001-phonebook-app` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phonebook-app/spec.md`

## Summary

A single-user web application for managing personal contacts with full CRUD, real-time search, custom tags, favorites, and optional profile pictures. Implemented as an npm workspaces monorepo: a React + Vite + shadcn/ui frontend and a Node.js + Express + Mongoose backend connected to MongoDB Atlas, with profile pictures stored on the server filesystem.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS), React 18  
**Primary Dependencies**:
- Frontend: React 18, Vite 5, React Router 6, shadcn/ui (Radix UI + Tailwind CSS), axios
- Backend: Express 4, Mongoose 8, multer (file uploads), cors, dotenv

**Storage**:
- MongoDB Atlas (cluster `Cluster0`) — single database, single collection `contacts`
- Server filesystem (`server/uploads/`) — profile picture files

**Testing**: Manual end-to-end via the running app for v1; automated tests deferred to a follow-up feature  
**Target Platform**: Modern desktop/tablet web browsers (Chrome, Firefox, Safari, Edge — last 2 versions)  
**Project Type**: Web application (frontend + backend monorepo)  
**Performance Goals**:
- Search/filter UI updates within 200 ms of keystroke (per SC-002)
- API list endpoint returns within 500 ms for up to 500 contacts

**Constraints**:
- Single user, no authentication
- Profile picture max size 5 MB; allowed MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Contact list size: tens to a few hundred — no pagination required
- Photos served via `/uploads/:filename` static route, not embedded in DB

**Scale/Scope**:
- ~500 contacts max expected
- Single deployment, single user
- ~10 React pages/components, 11 backend endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` contains placeholder content only — no project-specific principles have been ratified. No constitutional gates apply at this time. If principles are added later, this plan should be re-evaluated against them.

**Status**: ✅ PASS (no gates defined)

## Project Structure

### Documentation (this feature)

```text
specs/001-phonebook-app/
├── plan.md              # This file
├── research.md          # Phase 0 output — tech decisions
├── data-model.md        # Phase 1 output — Contact + PhoneEntry schemas
├── quickstart.md        # Phase 1 output — local setup + smoke test
├── contracts/           # Phase 1 output
│   └── api.md           # All /api endpoints with request/response schemas
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
phonebook/
├── package.json                    # npm workspaces root
├── .env                            # MONGODB_URI, PORT (gitignored)
├── client/                         # React + Vite + shadcn/ui
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/contacts.js
│       ├── components/
│       │   ├── ui/                 # shadcn primitives
│       │   ├── ContactCard.jsx
│       │   ├── ContactForm.jsx
│       │   ├── ContactDetail.jsx
│       │   ├── SearchBar.jsx
│       │   ├── TagFilterChips.jsx
│       │   ├── AvatarOrInitials.jsx
│       │   └── NavTabs.jsx
│       ├── pages/
│       │   ├── AllContactsPage.jsx
│       │   └── FavoritesPage.jsx
│       ├── hooks/
│       │   ├── useContacts.js
│       │   └── useTags.js
│       └── lib/initials.js
└── server/                         # Node.js + Express + Mongoose
    ├── package.json
    ├── index.js
    ├── config/db.js
    ├── models/Contact.js
    ├── routes/{contacts.js, tags.js}
    ├── controllers/{contactsController.js, tagsController.js}
    ├── middleware/{upload.js, errorHandler.js}
    └── uploads/                    # gitignored
```

**Structure Decision**: Web application monorepo using **npm workspaces**, with `client/` and `server/` as the two workspace packages. This was chosen over two separate repos for simpler local development (one `npm install`, one `git push`) and over a Next.js fullstack app to keep the React UI and Express API explicitly separated and to satisfy the user's requirement for "a backend with API."

## Complexity Tracking

> No constitution violations to justify.
