---
description: "Task list for Phonebook Contact Manager implementation"
---

# Tasks: Phonebook Contact Manager

**Input**: Design documents from `/specs/001-phonebook-app/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md)

**Tests**: Not requested. Per research.md decision #12, v1 is verified via the manual smoke test in [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (touches different files, no incomplete dependencies)
- **[Story]**: Maps to user stories US1–US5 in spec.md
- All file paths are relative to the repo root `phonebook/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the monorepo, install dependencies, and configure dev tooling.

- [x] T001 Create root `package.json` at `package.json` declaring npm workspaces `["client", "server"]` and a `dev` script using `concurrently` to run both workspaces
- [x] T002 Create `.gitignore` at the repo root excluding `node_modules/`, `.env`, `server/uploads/*` (keep `.gitkeep`), and `client/dist/`
- [x] T003 Create `.env.example` at the repo root with placeholder `MONGODB_URI=` and `PORT=4000`
- [x] T004 [P] Initialize the client workspace at `client/` with Vite (React template), then install `react-router-dom`, `axios`, and Tailwind CSS
- [x] T005 [P] Initialize the server workspace at `server/` with `npm init -y`, then install `express`, `mongoose`, `multer`, `cors`, `dotenv`, and `nodemon` (dev)
- [x] T006 Install and configure shadcn/ui in `client/` (run `npx shadcn@latest init`, generate components.json), then add base primitives: `button`, `card`, `input`, `textarea`, `dialog`, `avatar`, `badge`, `label`
- [x] T007 Configure Vite dev server proxy in `client/vite.config.js` to forward `/api` and `/uploads` to `http://localhost:4000`
- [x] T008 Add npm scripts: `client/package.json` → `dev` runs `vite`; `server/package.json` → `dev` runs `nodemon index.js`; root `dev` runs both via `concurrently`

**Checkpoint**: `npm run dev` from the root starts both servers (server logs "listening on 4000", client logs Vite URL).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure every user story depends on — DB connection, model, routing scaffold, error handling, base UI shell.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Server foundation

- [x] T009 Create `server/index.js` with Express bootstrap: load `dotenv`, enable `cors()` and `express.json()`, mount `/uploads` static route serving `server/uploads/`, mount `/api/contacts` and `/api/tags` routers (stubs for now), attach `errorHandler` middleware last, listen on `process.env.PORT`
- [x] T010 [P] Create `server/config/db.js` exporting `connectDB()` that calls `mongoose.connect(process.env.MONGODB_URI)`; call it from `server/index.js` on startup
- [x] T011 [P] Create `server/middleware/errorHandler.js` exporting an Express error middleware that responds with `{ error: <message> }` and the appropriate status code (400 for `ValidationError`/`CastError`, 500 otherwise)
- [x] T012 [P] Create `server/middleware/upload.js` configuring `multer.diskStorage` (dest `server/uploads/`, filename `<contactId>-<timestamp>.<ext>`), `fileFilter` accepting only `image/jpeg|png|webp|gif`, `limits.fileSize = 5 * 1024 * 1024`
- [x] T013 Create `server/models/Contact.js` defining the `PhoneEntry` sub-schema and the `Contact` schema per data-model.md (validation rules from FR-001/007/008, required `name` and `phones`, default `isFavorite: false`, Mongoose `timestamps: true`); add indexes on `name`, `tags`, `isFavorite`
- [x] T014 Create `server/uploads/.gitkeep` so the upload directory exists in fresh checkouts

### Client foundation

- [x] T015 Create `client/src/api/contacts.js` exporting axios-based functions stubs: `listContacts(params)`, `getContact(id)`, `createContact(body)`, `updateContact(id, body)`, `deleteContact(id)`, `toggleFavorite(id, isFavorite)`, `uploadPhoto(id, file)`, `deletePhoto(id)`, `listTags()` — all targeting `/api/...`
- [x] T016 [P] Create `client/src/lib/initials.js` exporting `getInitials(name)` that returns the first letter of the first word + first letter of the last word, uppercased; if single word, return only its first letter
- [x] T017 [P] Create `client/src/components/AvatarOrInitials.jsx` rendering the shadcn `Avatar` with `AvatarImage src={photoUrl}` if `photo` filename is provided (URL = `/uploads/${photo}`), otherwise an `AvatarFallback` with initials from `getInitials(name)`
- [x] T018 [P] Create `client/src/components/NavTabs.jsx` rendering two links (`/` All Contacts, `/favorites` Favorites) using `react-router-dom` `NavLink`, styled as a tab bar with active state
- [x] T019 Set up `client/src/main.jsx` with `BrowserRouter` and `client/src/App.jsx` rendering the layout shell: `NavTabs` at the top, `<Outlet />` below; configure routes `/` and `/favorites` (page components are placeholders for now)

**Checkpoint**: Backend connects to Mongo on startup without crashing; frontend shell renders with two tab links and switches routes; `npm run dev` shows no console errors.

---

## Phase 3: User Story 1 — Manage Contacts (Priority: P1) 🎯 MVP

**Goal**: Full CRUD on contacts. The user can add, view, edit, and delete contacts with name, phones (multiple, with labels), birthday, and notes. Initials avatar shown for all contacts (no upload yet).

**Independent Test**: Run quickstart smoke-test steps 1–4 (add contact, see it in the grid with initials avatar, edit it, delete it).

### Server

- [x] T020 [US1] Create `server/controllers/contactsController.js` with `listContacts` (returns all contacts sorted by `name`, no filters yet), `getContact`, `createContact`, `updateContact`, `deleteContact` (also unlinks `server/uploads/<photo>` if set, ignoring ENOENT)
- [x] T021 [US1] Create `server/routes/contacts.js` wiring `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` to the controller; include `Location` header on 201
- [x] T022 [US1] Replace the stub mount in `server/index.js` with the real `contacts` router; verify with `curl http://localhost:4000/api/contacts` returns `[]`

### Client

- [x] T023 [P] [US1] Implement axios methods `listContacts`, `getContact`, `createContact`, `updateContact`, `deleteContact` in `client/src/api/contacts.js` (replacing the stubs from T015)
- [x] T024 [P] [US1] Create `client/src/hooks/useContacts.js` exposing `{ contacts, loading, error, reload }` and an internal `params` ref so callers can pass `{ search, tags, favoritesOnly }` later — for US1 it's called with no params
- [ ] T025 [US1] Create `client/src/components/ContactCard.jsx` showing avatar (via `AvatarOrInitials`), name, primary phone label+number, tag badges (display only, can be empty); clickable to open detail
- [ ] T026 [US1] Create `client/src/components/ContactForm.jsx` (shadcn `Dialog`) with controlled inputs for `name` (required), dynamic `phones` array (add/remove rows; each row has `number` text input and `label` select with options Mobile/Home/Work/Custom — Custom reveals a free-text input), `birthday` date picker, `notes` textarea, and a comma-separated `tags` text input; calls `createContact` or `updateContact` on submit; shows server `{ error }` message at the top of the dialog on 400
- [ ] T027 [US1] Create `client/src/components/ContactDetail.jsx` (shadcn `Dialog`) showing all fields read-only with Edit and Delete buttons; Delete shows a confirmation `AlertDialog` before calling `deleteContact`
- [ ] T028 [US1] Create `client/src/pages/AllContactsPage.jsx`: header row with page title and "Add contact" button (opens empty `ContactForm`); responsive grid of `ContactCard`s from `useContacts()`; clicking a card opens `ContactDetail`; empty state message when `contacts.length === 0`
- [ ] T029 [US1] Wire `AllContactsPage` to the `/` route in `client/src/App.jsx` (replaces the placeholder)

**Checkpoint**: User can add a contact, see it on the grid with initials avatar, open it, edit it, delete it (with confirmation). Refresh the page → contacts persist.

---

## Phase 4: User Story 2 — Search and Filter Contacts (Priority: P2)

**Goal**: Real-time search by name or phone, plus tag filter chips, both applied to the contact list.

**Independent Test**: Quickstart steps 5–6 (type a partial name → list narrows; click a tag chip → list filters; clear → full list returns).

### Server

- [ ] T030 [US2] Extend `listContacts` in `server/controllers/contactsController.js` to read `req.query.search`, `req.query.tags`, `req.query.favoritesOnly`; build a Mongo filter using `$regex` (case-insensitive) on `name` OR `phones.number` for search, `$all` on `tags` for the tag list, and `isFavorite: true` when `favoritesOnly === 'true'`
- [ ] T031 [P] [US2] Create `server/controllers/tagsController.js` with `listTags` returning `Contact.distinct('tags')` sorted alphabetically
- [ ] T032 [P] [US2] Create `server/routes/tags.js` with `GET /` → `listTags`; replace the stub mount in `server/index.js` with the real router

### Client

- [ ] T033 [P] [US2] Implement `listTags` in `client/src/api/contacts.js`
- [ ] T034 [P] [US2] Create `client/src/hooks/useTags.js` exposing `{ tags, reload }` that fetches `/api/tags`
- [ ] T035 [P] [US2] Create `client/src/components/SearchBar.jsx`: shadcn `Input` with a search icon, controlled value, `onChange` propagated upward; parent debounces input by 150 ms before triggering refetch
- [ ] T036 [P] [US2] Create `client/src/components/TagFilterChips.jsx`: takes `availableTags` and `selectedTags`; renders a horizontally scrollable row of shadcn `Badge` toggles; clicking toggles a tag in/out of the selection; emits `onChange(selectedTags)`
- [ ] T037 [US2] Update `client/src/hooks/useContacts.js` to accept `{ search, tags, favoritesOnly }` and pass them as query params to `listContacts`; trigger refetch when any param changes
- [ ] T038 [US2] Wire `SearchBar` and `TagFilterChips` into `client/src/pages/AllContactsPage.jsx`: stack them above the grid; manage local state for search text (debounced) and selected tags; pass to `useContacts`
- [ ] T039 [US2] Add an empty-state component when search/filter returns no results (separate message from "no contacts at all"): "No contacts match your search."

**Checkpoint**: Typing in the search bar filters the list within ~200 ms; toggling tag chips combines with search; clearing both restores the full list.

---

## Phase 5: User Story 3 — Favorites (Priority: P3)

**Goal**: Mark/unmark contacts as favorite; dedicated Favorites tab shows only favorites; search and tag filter still work within Favorites.

**Independent Test**: Quickstart step 7 (favorite a contact, switch to Favorites tab, see it; unfavorite, see it disappear from that tab but remain in All Contacts).

### Server

- [ ] T040 [US3] Add `toggleFavorite` to `server/controllers/contactsController.js` (validates body has boolean `isFavorite`, updates the doc, returns it)
- [ ] T041 [US3] Add `PATCH /:id/favorite` route in `server/routes/contacts.js` wired to `toggleFavorite`

### Client

- [ ] T042 [P] [US3] Implement `toggleFavorite` in `client/src/api/contacts.js`
- [ ] T043 [P] [US3] Add a star toggle button to `client/src/components/ContactCard.jsx`: filled star when `isFavorite`, outline otherwise; clicking calls `toggleFavorite` and triggers `reload()` on the parent's `useContacts`; stop click propagation so it doesn't open the detail modal
- [ ] T044 [US3] Create `client/src/pages/FavoritesPage.jsx` reusing the same layout as `AllContactsPage` but calling `useContacts({ favoritesOnly: true, ... })`; show "No favorites yet" empty state when zero results and no active filter
- [ ] T045 [US3] Wire `FavoritesPage` to the `/favorites` route in `client/src/App.jsx`

**Checkpoint**: Toggling the star on a card moves it in/out of the Favorites tab in real time. Search and tag chips work inside Favorites.

---

## Phase 6: User Story 4 — Tags Polish (Priority: P4)

**Goal**: Tag UX feels finished — autocomplete from previously used tags when editing, chips on cards.

**Independent Test**: Quickstart step 5 (create a custom tag, edit a second contact and see the tag suggested in the autocomplete list, save, confirm both contacts show the tag chip).

> Note: tag _creation_ and _filtering_ already work end-to-end after US2 (raw text input, server stores them, `/api/tags` lists them, chips filter the list). This phase upgrades the tag input UX from "comma-separated text" to "real chip input with autocomplete".

### Client

- [ ] T046 [US4] Replace the comma-separated `tags` text input in `client/src/components/ContactForm.jsx` with a chip input: existing tags shown as removable chips, a text input below to add a new one (Enter or comma confirms), suggestions dropdown sourced from `useTags()` filtered by the current input
- [ ] T047 [US4] Display tag chips on `client/src/components/ContactCard.jsx` (limit to first 3, "+N more" if extra) using shadcn `Badge`
- [ ] T048 [US4] Display all tag chips on `client/src/components/ContactDetail.jsx`

**Checkpoint**: Editing a contact suggests existing tags; new tags become available across the app immediately after save.

---

## Phase 7: User Story 5 — Profile Picture (Priority: P5)

**Goal**: Upload, display, and remove profile pictures. Initials avatar remains as fallback.

**Independent Test**: Quickstart steps 8–9 (upload a JPEG, see the avatar replace initials; remove the photo, see initials return).

### Server

- [ ] T049 [P] [US5] Add `uploadPhoto` to `server/controllers/contactsController.js`: accepts `req.file` from multer; if the contact already had a `photo`, unlink the old file from `server/uploads/`; set `photo` to the new filename; on disk-write failure, delete the new file and re-throw so `errorHandler` returns 500
- [ ] T050 [P] [US5] Add `deletePhoto` to the same controller: unlinks `server/uploads/<photo>` (ignore ENOENT), sets `photo: null`, returns the contact; 404 if contact not found OR `photo` was already null
- [ ] T051 [US5] Add routes `POST /:id/photo` (with `upload.single('photo')` middleware before the controller) and `DELETE /:id/photo` in `server/routes/contacts.js`

### Client

- [ ] T052 [P] [US5] Implement `uploadPhoto(id, file)` (uses `FormData` with field name `photo`, `Content-Type` auto) and `deletePhoto(id)` in `client/src/api/contacts.js`
- [ ] T053 [US5] Add a photo section to `client/src/components/ContactForm.jsx`: shows current avatar (`AvatarOrInitials`), file picker button accepting `image/jpeg,image/png,image/webp,image/gif`, a "Remove photo" button (visible only when a photo exists); on file select, validate size ≤ 5 MB client-side and show inline error if violated; on save, if file selected → call `uploadPhoto` after `createContact`/`updateContact` succeeds; if "Remove" was clicked → call `deletePhoto`
- [ ] T054 [US5] Verify `AvatarOrInitials` already displays uploaded photos correctly in `ContactCard` and `ContactDetail` by passing the `photo` prop (no change should be needed if T017 was done correctly — confirm)

**Checkpoint**: Upload a photo → avatar updates everywhere. Remove → initials return. Bad file type or oversize file shows a clear error and doesn't save.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final pass for usability, error visibility, and validation against the spec.

- [ ] T055 [P] Add a global toast/notification system (shadcn `Sonner` or `Toast`) and surface failed API calls (network errors, 500s) as toasts in `client/src/api/contacts.js` axios interceptor
- [ ] T056 [P] Confirm contacts are sorted alphabetically by `name` in the server response (case-insensitive); add a Mongoose collation if needed
- [ ] T057 [P] Audit empty-state copy across pages: "Add your first contact" (zero contacts), "No contacts match your search." (search/filter), "No favorites yet" (Favorites empty)
- [ ] T058 [P] Verify mobile/tablet responsiveness of the contact grid; cards should stack to a single column below ~640 px
- [ ] T059 Run the full smoke test from [quickstart.md](./quickstart.md) against the running app; fix any deviations
- [ ] T060 Update root `README.md` with one paragraph: what the app is, the `npm install` + `.env` + `npm run dev` flow, and a link to the spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies, must be done first
- **Foundational (Phase 2)**: depends on Setup; **blocks all user stories**
- **US1 (Phase 3)**: depends on Foundational; this is the MVP
- **US2 (Phase 4)**: depends on Foundational + US1 (UI mounts on the All Contacts page)
- **US3 (Phase 5)**: depends on Foundational + US1 (uses ContactCard); independent of US2
- **US4 (Phase 6)**: depends on US1 (tags exist as raw input) + US2 (`useTags`)
- **US5 (Phase 7)**: depends on Foundational + US1 (uses ContactForm)
- **Polish (Phase 8)**: depends on whichever stories you've shipped

### Within Each User Story

- Server endpoints before client API methods that call them
- Hooks before pages that consume them
- Pages last (they wire everything together)

### Parallel Opportunities

- Phase 1: T004 and T005 in parallel (different workspaces)
- Phase 2: T010, T011, T012 in parallel (different files, all foundational); T016, T017, T018 in parallel on the client
- Phase 3: T023, T024 in parallel (different files); T020 must come before T021/T022
- Phase 4: T031, T032 in parallel; T033–T036 in parallel; T037–T038 are sequential
- Phase 5: T042 and T043 in parallel; T040 before T041
- Phase 7: T049 and T050 in parallel; T051 after both; T052 in parallel with server work
- Phase 8: T055–T058 are independent

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1 — Manage Contacts
4. **STOP and run smoke-test steps 1–4** in the browser
5. If happy, this is already a usable phonebook. Ship/demo here.

### Incremental Delivery (recommended)

Ship after each user story:

1. MVP after US1 (CRUD only)
2. - US2 → contact list is now searchable and filterable
3. - US3 → Favorites tab works
4. - US4 → tag UX feels real (chips + autocomplete)
5. - US5 → profile pictures
6. Polish

Each step is independently demoable.

---

## Notes

- [P] = different files, no dependencies on incomplete tasks in the same phase
- Each user story phase ends in a checkpoint that's directly testable in the browser via quickstart.md
- No automated tests in v1 — the manual smoke test is the gate
- Commit after each completed user story (the `after_*` git hooks will prompt)
- If anything in spec.md or contracts/api.md drifts during implementation, update those docs in the same commit
