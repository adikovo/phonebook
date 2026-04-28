# Phase 0 Research: Phonebook Contact Manager

**Date**: 2026-04-28
**Spec**: [spec.md](./spec.md)

This document records the technical decisions taken during Phase 0 of planning. All `NEEDS CLARIFICATION` items from the Technical Context have been resolved here.

## Decisions

### 1. Frontend framework

- **Decision**: React 18 with Vite 5
- **Rationale**: User explicitly requested React. Vite provides fast HMR and a modern build toolchain with zero config; pairs naturally with shadcn/ui's installation flow.
- **Alternatives considered**: Create React App (deprecated by maintainers), Next.js (overkill for a SPA with a separate API).

### 2. UI component library

- **Decision**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Rationale**: User-requested. Components are copied into the codebase rather than imported, giving full styling control — useful for the smartphone-contacts-app aesthetic. Built-in accessible primitives (Dialog, Avatar, Input).
- **Alternatives considered**: Material UI (heavier, opinionated style), Chakra UI (less granular control).

### 3. Backend framework

- **Decision**: Node.js 20 LTS + Express 4
- **Rationale**: User-requested. Mature, minimal, well-documented; pairs trivially with Mongoose and multer.
- **Alternatives considered**: Fastify (faster but smaller ecosystem for the user's familiarity), NestJS (too much structure for a small CRUD app).

### 4. Database

- **Decision**: MongoDB Atlas (free tier cluster `Cluster0`) accessed via Mongoose 8
- **Rationale**: User has provisioned the cluster. Document model fits the contact shape (variable phone-number arrays, free-form tags). Mongoose adds schema validation matching the constraints in the spec.
- **Alternatives considered**: PostgreSQL (better for relational queries — not needed here), SQLite (no remote multi-device access).

### 5. Profile picture storage

- **Decision**: Local server filesystem under `server/uploads/`, served via Express static middleware at `/uploads/:filename`. The `Contact.photo` field stores only the filename.
- **Rationale**: User-requested ("server filesystem"). Keeps DB documents small; image bytes are not double-encoded as base64. Simple to implement with `multer.diskStorage`.
- **Alternatives considered**: GridFS (complicates reads/writes), base64 in DB (bloats documents and network responses), object storage like S3 (adds infra cost for a single-user local app).

### 6. File upload handling

- **Decision**: `multer` with `diskStorage`, MIME-type filter (`image/jpeg|png|webp|gif`), 5 MB size limit.
- **Rationale**: Standard, battle-tested middleware for Express. Matches the spec's allowed-types and size constraints.
- **Alternatives considered**: `formidable` (similar functionality, less common with Express), client-side direct-to-storage uploads (irrelevant without S3).

### 7. Real-time search implementation

- **Decision**: Server-side filtering via the `GET /api/contacts?search=…&tags=…` query params. The client debounces input by ~150 ms and re-fetches.
- **Rationale**: Keeps a single source of truth; trivial with Mongoose `$regex` and `$all`. For ≤500 contacts the latency is negligible. Simple to reason about.
- **Alternatives considered**: Load-all-then-filter-client-side (would also work for 500 contacts; rejected because re-querying keeps the data fresh after edits and avoids stale-state bugs).

### 8. Tag derivation

- **Decision**: Tags are NOT a separate collection. The list of available tags is derived from the union of all `contacts.tags` arrays via a `distinct` query, exposed at `GET /api/tags`.
- **Rationale**: Simpler — no orphan-tag cleanup logic, no second collection. Matches FR-019 (tag disappears when last contact stops using it).
- **Alternatives considered**: Separate `tags` collection (would require sync logic and offers no benefit at this scale).

### 9. Routing & navigation

- **Decision**: React Router 6 with two routes: `/` (All Contacts) and `/favorites`.
- **Rationale**: Distinct URLs allow bookmarking and back-button behavior; matches the "two primary navigation destinations" requirement (FR-023).
- **Alternatives considered**: Single page with internal tab state (loses URL semantics).

### 10. Project layout

- **Decision**: npm workspaces monorepo with `client/` and `server/` workspaces; root `package.json` orchestrates installs and dev scripts.
- **Rationale**: User-requested ("monorepo"). One `npm install` covers both packages; one git history; one `.env` at the root.
- **Alternatives considered**: Separate repos (more git overhead), pnpm/yarn workspaces (npm 10 is sufficient).

### 11. Local dev orchestration

- **Decision**: Run client (Vite, port 5173) and server (Express, port 4000) concurrently via `concurrently` in the root `dev` script. Vite proxy forwards `/api` and `/uploads` requests to the backend in dev.
- **Rationale**: Avoids CORS friction in development and keeps the production-time URL shape (`/api/...`) identical to dev.
- **Alternatives considered**: CORS open to `localhost:5173` (works but exposes a CORS surface needlessly), single-server-serving-built-client (slows iteration during development).

### 12. Testing strategy for v1

- **Decision**: Manual end-to-end testing via the browser against the spec's acceptance scenarios. Automated tests deferred.
- **Rationale**: User did not request tests; the app is small and single-user. Adds no constitutional violation since none are defined.
- **Alternatives considered**: Vitest + React Testing Library + supertest for backend (recommended for v2).

## Resolved Clarifications

No `NEEDS CLARIFICATION` markers remained from the spec or Technical Context. The user provided all major decisions during the conversation, and the spec already documents the data model and API contract.
