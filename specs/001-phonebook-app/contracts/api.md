# API Contract: Phonebook Backend

**Base URL**: `http://localhost:4000` (dev) — all endpoints prefixed with `/api` unless noted.

**Content-Type**: `application/json` for both requests and responses, except photo upload which uses `multipart/form-data`.

**Error shape**: every error response has the body `{ "error": "human-readable message" }`. The HTTP status code indicates the kind of error.

---

## The `Contact` object

Every endpoint that returns a contact returns this shape:

```json
{
  "_id": "65f1aa2b3c8e2a0011223344",
  "name": "Alice Brown",
  "phones": [
    {
      "_id": "65f1aa2b3c8e2a0011223345",
      "number": "+1 555 0100",
      "label": "Mobile"
    },
    {
      "_id": "65f1aa2b3c8e2a0011223346",
      "number": "+1 555 0101",
      "label": "Work"
    }
  ],
  "birthday": "1990-04-15T00:00:00.000Z",
  "notes": "Met at conference 2024",
  "photo": "65f1aa2b3c8e2a0011223344-1714298400000.jpg",
  "tags": ["Work", "Conference"],
  "isFavorite": true,
  "createdAt": "2026-04-28T12:00:00.000Z",
  "updatedAt": "2026-04-28T12:00:00.000Z"
}
```

For full field constraints, see [data-model.md](../data-model.md).

---

## 1. List contacts

**`GET /api/contacts`**

Returns all contacts, with optional filtering. Used by both the All Contacts page and the Favorites page.

### Query parameters

All three are optional. If none are sent, all contacts are returned.

- **`search`** (text) — narrows results to contacts whose name OR phone number contains the given text. Letter case doesn't matter, and partial matches work.
  - `?search=ali` matches a contact named `"Alice"`, `"Khalid"`, or anyone with `"ali"` anywhere in their name.
  - `?search=555` matches any contact who has `"555"` anywhere in any of their phone numbers.

- **`tags`** (comma-separated tag names) — narrows results to contacts that have **all** the listed tags (AND, not OR).
  - `?tags=Family` returns contacts tagged `Family`.
  - `?tags=Family,Friends` returns only contacts tagged with **both** `Family` AND `Friends`.

- **`favoritesOnly`** (`true` or `false`) — when `true`, returns only contacts the user has marked as favorite. Used by the Favorites page.

You can combine all three. For example, `?search=ali&tags=Work&favoritesOnly=true` returns favorited work contacts whose name or phone contains "ali".

### Example requests

```
GET /api/contacts
GET /api/contacts?search=alice
GET /api/contacts?tags=Family,Friends
GET /api/contacts?favoritesOnly=true&search=ali
```

### Responses

**`200 OK`** — array of contacts, sorted alphabetically by `name`:

```json
[
  { "_id": "...", "name": "Alice Brown", "phones": [...], ... },
  { "_id": "...", "name": "Bob Smith",   "phones": [...], ... }
]
```

**`500 Internal Server Error`** — DB failure: `{ "error": "Failed to load contacts" }`

### Edge cases

- No contacts match → returns `[]` (not 404).
- Empty `search` string → treated as no search filter.
- Unknown tag in `tags` → returns `[]`.

---

## 2. Get one contact

**`GET /api/contacts/:id`**

### Path parameter

- `id` — MongoDB ObjectId of the contact.

### Responses

**`200 OK`** — the full Contact object (see top).

**`400 Bad Request`** — id is not a valid ObjectId:

```json
{"error": "Invalid contact id"}
```

**`404 Not Found`**:

```json
{"error": "Contact not found"}
```

---

## 3. Create a contact

**`POST /api/contacts`**

### Request body

```json
{
  "name": "Alice Brown",
  "phones": [{"number": "+1 555 0100", "label": "Mobile"}],
  "birthday": "1990-04-15",
  "notes": "Met at conference 2024",
  "tags": ["Work"],
  "isFavorite": false
}
```

| Field        | Required | Notes                                              |
| ------------ | -------- | -------------------------------------------------- |
| `name`       | Yes      | Trimmed; must be non-empty                         |
| `phones`     | Yes      | Array, must have at least 1 entry, max 10          |
| `birthday`   | No       | ISO date string or `null`; year may be omitted     |
| `notes`      | No       | Defaults to `""`; max 2000 chars                   |
| `tags`       | No       | Defaults to `[]`; each tag ≤ 30 chars; max 20 tags |
| `isFavorite` | No       | Defaults to `false`                                |

### Responses

**`201 Created`** — returns the new Contact (with generated `_id`, `createdAt`, `updatedAt`). Sets `Location: /api/contacts/:id` header.

**`400 Bad Request`** — validation failure (the message names the offending field):

```json
{ "error": "name is required" }
{ "error": "phones must contain at least 1 entry" }
{ "error": "phones[0].number must be 3-25 characters" }
```

**`500 Internal Server Error`** — DB write failure.

### Edge cases

- Whitespace-only name → rejected as missing.
- Duplicate names → allowed (no dedup logic).
- Empty `tags: []` → accepted.

---

## 4. Update a contact

**`PUT /api/contacts/:id`**

Replaces any subset of editable fields. Photo and `isFavorite` are NOT updated through this endpoint — they have dedicated endpoints (#6 and #7).

### Path parameter

- `id` — ObjectId of the contact.

### Request body

Any subset of the create body, e.g.:

```json
{
  "name": "Alice Brown-Smith",
  "tags": ["Work", "Wedding"]
}
```

Editable fields: `name`, `phones`, `birthday`, `notes`, `tags`. Same validation rules as create.

### Responses

**`200 OK`** — the updated Contact.

**`400 Bad Request`** — validation failure (e.g. `{ "error": "phones cannot be empty" }`).

**`404 Not Found`** — `{ "error": "Contact not found" }`.

### Edge cases

- Empty body → returns the contact unchanged.
- Setting `phones: []` → rejected (must keep at least 1).

---

## 5. Delete a contact

**`DELETE /api/contacts/:id`**

Deletes the contact document AND its associated profile picture file from disk (if any).

### Responses

**`204 No Content`** — deletion succeeded (no body).

**`404 Not Found`** — `{ "error": "Contact not found" }`.

### Edge cases

- Photo file already missing on disk → deletion still succeeds; server logs a warning.

---

## 6. Toggle favorite

**`PATCH /api/contacts/:id/favorite`**

### Request body

```json
{"isFavorite": true}
```

### Responses

**`200 OK`** — the updated Contact.

**`400 Bad Request`** — body missing or `isFavorite` not a boolean:

```json
{"error": "isFavorite must be a boolean"}
```

**`404 Not Found`** — `{ "error": "Contact not found" }`.

---

## 7. Upload profile picture

**`POST /api/contacts/:id/photo`**

`Content-Type: multipart/form-data`

### Form field

- `photo` — the image file.

### Constraints

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Maximum size: 5 MB

### Responses

**`200 OK`** — the updated Contact with the new `photo` filename.

**`400 Bad Request`** — file missing, wrong type, or too large:

```json
{ "error": "No file uploaded" }
{ "error": "Unsupported file type. Allowed: jpeg, png, webp, gif" }
{ "error": "File exceeds 5MB limit" }
```

**`404 Not Found`** — `{ "error": "Contact not found" }`.

**`500 Internal Server Error`** — disk write failure; DB change is rolled back so the contact still references its previous photo (if any).

### Edge cases

- Replacing an existing photo → the old file is deleted from disk before saving the new one.

---

## 8. Remove profile picture

**`DELETE /api/contacts/:id/photo`**

Deletes the photo file from disk and sets `photo: null` on the contact.

### Responses

**`200 OK`** — the updated Contact (with `photo: null`).

**`404 Not Found`** — contact not found OR contact has no photo to delete.

---

## 9. List all tags

**`GET /api/tags`**

Returns the deduplicated, sorted list of every tag currently in use across all contacts. Used by the contact form's tag autocomplete and by the tag filter chips below the search bar.

### Responses

**`200 OK`**:

```json
["Conference", "Family", "Friends", "Work"]
```

### Edge cases

- No contacts or no tags anywhere → returns `[]`.

---

## 10. Serve uploaded image

**`GET /uploads/:filename`** _(not under `/api`)_

Static file route serving images from `server/uploads/`.

### Responses

**`200 OK`** — image binary, with `Content-Type` set automatically (e.g. `image/jpeg`).

**`404 Not Found`** — file does not exist (default Express 404 response).
