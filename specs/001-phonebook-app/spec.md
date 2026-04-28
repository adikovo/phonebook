# Feature Specification: Phonebook Contact Manager

**Feature Branch**: `001-phonebook-app`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "Build a phonebook web app to manage personal contacts"

## Summary

A single-user web app for managing personal contacts with full CRUD, real-time search, custom tags, favorites, and optional profile pictures — built as a React + Node.js/Express monorepo with a MongoDB Atlas backend and shadcn/ui for the interface.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Manage Contacts (Priority: P1)

A user wants to maintain a personal directory of people they know. They can add new contacts with a name and at least one phone number, view the full list of contacts, open a contact to see all its details, edit any field, and delete contacts they no longer need.

**Why this priority**: This is the foundational capability of the app — without it nothing else is meaningful. Every other feature builds on top of a working contact list.

**Independent Test**: Can be fully tested by adding a contact, viewing it in the list, opening it, editing a field, and deleting it — delivering a fully working personal address book.

**Acceptance Scenarios**:

1. **Given** no contacts exist, **When** the user fills in a name and phone number and saves, **Then** the new contact appears in the All Contacts list.
2. **Given** a contact exists, **When** the user opens it and changes the name, **Then** the updated name is reflected immediately in the list and detail view.
3. **Given** a contact exists, **When** the user deletes it, **Then** it is removed from the list and can no longer be found.
4. **Given** a contact with no profile picture, **When** it is displayed, **Then** the contact's initials are shown in the avatar area.
5. **Given** a contact form, **When** the user submits without a name, **Then** an error message is shown and the contact is not saved.

---

### User Story 2 - Search and Filter Contacts (Priority: P2)

A user wants to quickly find a specific contact without scrolling through the entire list. They can type a name or phone number into a search bar and see the list narrow down instantly as they type. They can also filter the visible contacts by one or more tags.

**Why this priority**: Search and filtering are essential for usability as soon as the contact list grows beyond a handful of entries.

**Independent Test**: Can be fully tested by populating several contacts, typing a partial name or number, and confirming only matching contacts are shown — and by selecting a tag filter and confirming only tagged contacts appear.

**Acceptance Scenarios**:

1. **Given** multiple contacts exist, **When** the user types part of a contact's name, **Then** only contacts whose name contains that text are shown, updating with each keystroke.
2. **Given** multiple contacts exist, **When** the user types digits that appear in a phone number, **Then** only contacts with a matching phone number are shown.
3. **Given** contacts with various tags, **When** the user selects the "Family" tag filter, **Then** only contacts tagged "Family" are shown.
4. **Given** an active search term and an active tag filter, **When** both are applied simultaneously, **Then** only contacts matching both criteria are shown.
5. **Given** a search query that matches no contact, **When** the user types it, **Then** an empty-state message is shown.

---

### User Story 3 - Favorites (Priority: P3)

A user wants fast access to the people they contact most often. They can mark any contact as a favorite and view all favorites in a dedicated tab separate from the full contact list.

**Why this priority**: Favorites are a convenience layer on top of the contact list and deliver significant daily-use value once the core list is working.

**Independent Test**: Can be fully tested by marking a contact as favorite, switching to the Favorites tab, and confirming it appears there — and by un-marking it and confirming it disappears.

**Acceptance Scenarios**:

1. **Given** a contact exists, **When** the user marks it as a favorite, **Then** it appears in the Favorites tab.
2. **Given** a contact is marked as a favorite, **When** the user removes the favorite flag, **Then** it disappears from the Favorites tab but remains in All Contacts.
3. **Given** no favorites have been set, **When** the user opens the Favorites tab, **Then** an empty-state message is shown.
4. **Given** the Favorites tab is open, **When** the user searches or filters, **Then** search and tag filtering apply within the Favorites view as well.

---

### User Story 4 - Tags and Groups (Priority: P4)

A user wants to organize contacts into meaningful groups such as "Family", "Work", or "Friends". They can create their own custom tags, assign multiple tags to a single contact, and later filter the contact list by tag.

**Why this priority**: Tags add organizational value once the core contact list is in place, and they enable the tag-based filtering in User Story 2.

**Independent Test**: Can be fully tested by creating a custom tag, assigning it to multiple contacts, and confirming the tag filter shows exactly those contacts.

**Acceptance Scenarios**:

1. **Given** a contact is being created or edited, **When** the user types a new tag name and confirms, **Then** the tag is created and attached to the contact.
2. **Given** existing tags, **When** the user opens a contact form, **Then** they can select from previously used tags without retyping.
3. **Given** a contact, **When** the user assigns multiple tags to it, **Then** all assigned tags are saved and displayed on the contact card.
4. **Given** a tag is removed from all contacts, **When** the user views available tags, **Then** the tag no longer appears as a filter option.

---

### User Story 5 - Profile Picture (Priority: P5)

A user wants to personalize contact entries with a photo. They can upload an image from their device, which is then displayed as the contact's avatar. If no image is uploaded, the contact's initials are shown instead.

**Why this priority**: Profile pictures are a cosmetic enhancement — the app is fully functional without them, so they are lowest priority.

**Independent Test**: Can be fully tested by uploading a photo for a contact, confirming it displays as the avatar, then removing it and confirming the initials avatar returns.

**Acceptance Scenarios**:

1. **Given** a contact form, **When** the user selects an image file and saves, **Then** the uploaded image is displayed as the contact's avatar in the list and detail view.
2. **Given** a contact with a profile picture, **When** the user removes the picture, **Then** the avatar reverts to displaying the contact's initials.
3. **Given** a contact with no picture, **When** the contact is displayed, **Then** a circle with the contact's initials (e.g., "JD" for John Doe) is shown in place of a photo.
4. **Given** a user uploads an unsupported file type (e.g., a PDF), **When** they attempt to save, **Then** an error message is shown and no picture is saved.

---

### Edge Cases

- What happens when a contact's name is a single word with no surname? (Initials avatar shows the first letter only.)
- What happens when two contacts have identical names? (Both are stored and displayed; no duplicate prevention is enforced.)
- What happens if the user clears the search field? (The full contact list is restored immediately.)
- What happens when all contacts are deleted? (The list shows an empty-state message prompting the user to add a contact.)
- What happens when a tag filter and the Favorites tab are active at the same time? (The filter applies within the Favorites view.)
- What happens when a contact has no phone numbers saved? (The contact can still be saved; the phone field is optional beyond the first entry.)

## Requirements _(mandatory)_

### Functional Requirements

**Contact Management**

- **FR-001**: The system MUST allow the user to create a contact with a name (required), one or more phone numbers (each with a label: Mobile, Home, Work, or custom text), a birthday, free-text notes, a profile picture, and one or more tags.
- **FR-002**: The system MUST display all contacts in a card-based layout sorted alphabetically by name.
- **FR-003**: The system MUST allow the user to view the full details of any contact.
- **FR-004**: The system MUST allow the user to edit any field of an existing contact and save the changes.
- **FR-005**: The system MUST allow the user to delete a contact, with a confirmation step before permanent removal.
- **FR-006**: The system MUST persist all contact data so it is available after the user closes and reopens the app.

**Phone Numbers**

- **FR-007**: Each contact MUST support multiple phone number entries.
- **FR-008**: Each phone number entry MUST have an associated label chosen from predefined options (Mobile, Home, Work) or a custom label typed by the user.

**Profile Picture**

- **FR-009**: The system MUST allow the user to upload an image file as a contact's profile picture.
- **FR-010**: When no profile picture is set, the system MUST display the contact's initials as a circular avatar.
- **FR-011**: The system MUST allow the user to remove a contact's profile picture, reverting to the initials avatar.
- **FR-012**: The system MUST reject unsupported file types for profile pictures and inform the user with an error message.

**Search**

- **FR-013**: The system MUST provide a search bar that filters the visible contact list in real time as the user types.
- **FR-014**: Search MUST match contacts by name (partial, case-insensitive) and by phone number (partial match).
- **FR-015**: When no contacts match the search query, the system MUST display an empty-state message.

**Tags**

- **FR-016**: The system MUST allow the user to create custom tags and assign any number of tags to a contact.
- **FR-017**: The system MUST display previously used tags as selectable suggestions when editing a contact.
- **FR-018**: The system MUST provide a row of tag filter chips displayed below the search bar; clicking a chip activates it, clicking again deactivates it; multiple chips can be active simultaneously; the contact list is limited to contacts carrying all selected tags.
- **FR-019**: A tag that is no longer assigned to any contact MUST NOT appear as a filter option.

**Favorites**

- **FR-020**: The system MUST allow the user to mark or unmark any contact as a favorite.
- **FR-021**: The system MUST provide a dedicated Favorites view showing only contacts marked as favorites.
- **FR-022**: The Favorites view MUST support the same real-time search and tag filtering as the All Contacts view.

**Navigation**

- **FR-023**: The system MUST provide two primary navigation destinations: "All Contacts" and "Favorites".

### Data Model

**Contact** (MongoDB collection: `contacts`)

| Field        | Type      | Required | Constraints                                                                 |
|--------------|-----------|----------|-----------------------------------------------------------------------------|
| `_id`        | ObjectId  | Yes      | Auto-generated by MongoDB                                                   |
| `name`       | String    | Yes      | Trimmed, min length 1, max length 100                                       |
| `phones`     | Array     | Yes      | Min 1 entry, max 10 entries; each entry validated against PhoneEntry schema |
| `birthday`   | Date      | No       | Optional; year may be omitted (stored as ISO date or null)                  |
| `notes`      | String    | No       | Max length 2000                                                             |
| `photo`      | String    | No       | Filename of uploaded image stored on server filesystem; null if no picture  |
| `tags`       | [String]  | No       | Array of trimmed strings; each tag max 30 chars; max 20 tags per contact    |
| `isFavorite` | Boolean   | Yes      | Default `false`                                                             |
| `createdAt`  | Date      | Yes      | Auto-populated on insert                                                    |
| `updatedAt`  | Date      | Yes      | Auto-populated on insert and update                                         |

**PhoneEntry** (embedded sub-document inside `contacts.phones`)

| Field    | Type   | Required | Constraints                                                                  |
|----------|--------|----------|------------------------------------------------------------------------------|
| `number` | String | Yes      | Trimmed, min length 3, max length 25; allowed chars: digits, `+`, `-`, space |
| `label`  | String | Yes      | One of `"Mobile"`, `"Home"`, `"Work"`, or any user-supplied string ≤ 20 chars |

**Tag** (not a separate collection — derived from `contacts.tags` arrays)

The set of available tags is the union of all distinct strings present in any contact's `tags` array. A tag exists only as long as at least one contact references it.

### API Endpoints

All endpoints are prefixed with `/api`. Request and response bodies are JSON unless otherwise noted. All errors follow the shape `{ "error": "<message>" }`.

---

#### `GET /api/contacts`
List all contacts with optional filtering.

- **Query params**:
  - `search` (string, optional) — case-insensitive substring match against `name` or any `phones[].number`
  - `tags` (comma-separated string, optional) — return only contacts that have **all** listed tags
  - `favoritesOnly` (boolean, optional) — if `true`, return only contacts where `isFavorite === true`
- **Responses**:
  - `200 OK` → `Contact[]` sorted alphabetically by `name`
  - `500 Internal Server Error` → DB error
- **Edge cases**:
  - No contacts match → returns `[]` (not 404)
  - Empty `search` string → treated as no search filter
  - Unknown tag in `tags` → returns `[]` (no error)

---

#### `GET /api/contacts/:id`
Get a single contact by id.

- **Path params**: `id` — MongoDB ObjectId
- **Responses**:
  - `200 OK` → `Contact`
  - `400 Bad Request` → invalid ObjectId format
  - `404 Not Found` → no contact with that id

---

#### `POST /api/contacts`
Create a new contact.

- **Body** (JSON):
  ```json
  {
    "name": "string (required)",
    "phones": [{ "number": "string", "label": "string" }],
    "birthday": "ISO date string | null",
    "notes": "string",
    "tags": ["string"],
    "isFavorite": false
  }
  ```
- **Responses**:
  - `201 Created` → created `Contact`
  - `400 Bad Request` → validation failure (missing name, no phones, invalid phone format, tag too long, etc.) — error message names the offending field
- **Edge cases**:
  - Whitespace-only name → rejected as missing
  - Duplicate name allowed (no dedup)
  - Empty `tags` array → accepted

---

#### `PUT /api/contacts/:id`
Update an existing contact (full or partial replacement of editable fields).

- **Path params**: `id`
- **Body**: any subset of editable Contact fields (`name`, `phones`, `birthday`, `notes`, `tags`)
- **Responses**:
  - `200 OK` → updated `Contact`
  - `400 Bad Request` → validation failure
  - `404 Not Found` → contact not found
- **Edge cases**:
  - Empty body → returns the contact unchanged
  - Setting `phones` to `[]` → rejected (must keep at least 1)

---

#### `DELETE /api/contacts/:id`
Delete a contact and its associated profile picture file (if any).

- **Path params**: `id`
- **Responses**:
  - `204 No Content` → deletion successful
  - `404 Not Found` → contact not found
- **Edge cases**:
  - Photo file already missing on disk → deletion still succeeds; warning logged server-side

---

#### `PATCH /api/contacts/:id/favorite`
Toggle the favorite flag on a contact.

- **Path params**: `id`
- **Body**: `{ "isFavorite": true | false }`
- **Responses**:
  - `200 OK` → updated `Contact`
  - `400 Bad Request` → missing or non-boolean `isFavorite`
  - `404 Not Found` → contact not found

---

#### `POST /api/contacts/:id/photo`
Upload or replace a contact's profile picture.

- **Path params**: `id`
- **Body**: `multipart/form-data` with field `photo` (file)
- **Constraints**:
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Max file size: 5 MB
- **Responses**:
  - `200 OK` → updated `Contact` (with new `photo` filename)
  - `400 Bad Request` → no file, unsupported MIME type, or file exceeds size limit
  - `404 Not Found` → contact not found
- **Edge cases**:
  - Replacing existing photo → old file is deleted from disk before saving the new one
  - Disk write failure → returns `500` and rolls back the DB change

---

#### `DELETE /api/contacts/:id/photo`
Remove a contact's profile picture (file is deleted, `photo` field set to `null`).

- **Path params**: `id`
- **Responses**:
  - `200 OK` → updated `Contact`
  - `404 Not Found` → contact not found, or contact has no photo to delete

---

#### `GET /api/tags`
Return the list of all tags currently in use across all contacts.

- **Responses**:
  - `200 OK` → `string[]` sorted alphabetically (deduped)
- **Edge cases**:
  - No contacts or no tags → returns `[]`

---

#### `GET /uploads/:filename`
Static file route to serve uploaded profile pictures.

- **Responses**:
  - `200 OK` → image binary with appropriate `Content-Type`
  - `404 Not Found` → file does not exist

### File Structure

```
phonebook/
├── package.json                    # npm workspaces root
├── .env                            # MONGODB_URI, PORT (gitignored)
├── client/                         # React + Vite + shadcn/ui
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                # app entry
│       ├── App.jsx                 # router shell, top-level layout
│       ├── api/
│       │   └── contacts.js         # axios calls for all /api endpoints
│       ├── components/
│       │   ├── ui/                 # shadcn primitives (Button, Card, Input, ...)
│       │   ├── ContactCard.jsx     # card layout for one contact
│       │   ├── ContactForm.jsx     # create/edit form (modal or page)
│       │   ├── ContactDetail.jsx   # detail view
│       │   ├── SearchBar.jsx       # real-time search input
│       │   ├── TagFilterChips.jsx  # row of toggleable tag chips
│       │   ├── AvatarOrInitials.jsx# photo or fallback initials
│       │   └── NavTabs.jsx         # All Contacts / Favorites switcher
│       ├── pages/
│       │   ├── AllContactsPage.jsx
│       │   └── FavoritesPage.jsx
│       ├── hooks/
│       │   ├── useContacts.js      # list + filter state
│       │   └── useTags.js          # available tags
│       └── lib/
│           └── initials.js         # name → initials helper
├── server/                         # Node.js + Express + Mongoose
│   ├── package.json
│   ├── index.js                    # express bootstrap, mongoose connect
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   └── Contact.js              # mongoose Contact + PhoneEntry schemas
│   ├── routes/
│   │   ├── contacts.js             # /api/contacts router
│   │   └── tags.js                 # /api/tags router
│   ├── controllers/
│   │   ├── contactsController.js
│   │   └── tagsController.js
│   ├── middleware/
│   │   ├── upload.js               # multer config (image filter, 5MB limit)
│   │   └── errorHandler.js         # central error formatter
│   └── uploads/                    # uploaded profile pictures (gitignored)
└── specs/                          # spec-kit specifications
    └── 001-phonebook-app/
        ├── spec.md
        └── checklists/
            └── requirements.md
```

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can add a new contact from scratch (name + one phone number) in under 30 seconds.
- **SC-002**: The contact list updates in real time as the user types — visible results change within 200 milliseconds of each keystroke.
- **SC-003**: All contacts and their data are preserved and correctly displayed after the user closes and reopens the browser.
- **SC-004**: A user can locate a specific contact among 200 entries using search in under 2 seconds.
- **SC-005**: Switching between "All Contacts" and "Favorites" tabs completes without a full page reload and feels instantaneous.
- **SC-006**: 100% of contacts without a profile picture display a correctly derived initials avatar (e.g., "AB" for Alice Brown).
- **SC-007**: Tag filtering correctly narrows the contact list to only matching contacts with 0 false positives.

## Assumptions

- The app is for a single user with no authentication required; all data belongs to that one user.
- The user accesses the app via a modern desktop or tablet web browser; mobile-native optimization is not required for this version.
- Contact list size is expected to be in the range of tens to a few hundred contacts; no pagination is needed.
- Profile pictures are stored on the server hosting the app and are not stored inside the contact data record itself.
- Only common image formats (JPEG, PNG, WebP, GIF) are accepted for profile pictures; other file types are rejected.
- There is no import or export functionality in this version.
- There is no multi-user support or data sharing in this version.
- Contacts with a single-word name display only that word's first letter as the initials avatar.
- Duplicate contacts (same name) are allowed; no deduplication logic is applied.
- The birthday field accepts a month-day-year date; year is optional.
