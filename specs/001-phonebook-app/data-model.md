# Data Model: Phonebook Contact Manager

**Date**: 2026-04-28
**Spec**: [spec.md](./spec.md)

## Entities

### Contact

The central record representing a person in the user's phonebook.

**MongoDB collection**: `contacts`

| Field        | Type             | Required | Default     | Constraints                                             |
|--------------|------------------|----------|-------------|---------------------------------------------------------|
| `_id`        | ObjectId         | Yes      | auto        | MongoDB-generated                                       |
| `name`       | String           | Yes      | —           | trimmed, length 1–100                                   |
| `phones`     | [PhoneEntry]     | Yes      | —           | min 1, max 10 entries                                   |
| `birthday`   | Date \| null     | No       | `null`      | optional ISO date                                       |
| `notes`      | String           | No       | `""`        | length 0–2000                                           |
| `photo`      | String \| null   | No       | `null`      | filename of file in `server/uploads/`                   |
| `tags`       | [String]         | No       | `[]`        | each tag trimmed, length 1–30; max 20 tags per contact  |
| `isFavorite` | Boolean          | Yes      | `false`     | —                                                       |
| `createdAt`  | Date             | Yes      | auto        | populated by Mongoose timestamps                        |
| `updatedAt`  | Date             | Yes      | auto        | populated by Mongoose timestamps                        |

**Indexes**:

- `{ name: 1 }` — supports alphabetical sort and prefix search
- `{ tags: 1 }` — supports tag filter queries
- `{ isFavorite: 1 }` — supports the Favorites view

### PhoneEntry (embedded sub-document)

A single phone number entry attached to a Contact.

| Field    | Type   | Required | Constraints                                                                       |
|----------|--------|----------|-----------------------------------------------------------------------------------|
| `number` | String | Yes      | trimmed, length 3–25; allowed chars: digits, `+`, `-`, space; format not enforced |
| `label`  | String | Yes      | one of `"Mobile"`, `"Home"`, `"Work"` or any user-supplied string ≤ 20 chars      |

PhoneEntry is **not** a top-level document; it lives only inside `Contact.phones`. Each entry gets an auto-generated `_id` from Mongoose subdocuments to allow stable React keys.

### Tag (derived, not stored)

The set of available tags is derived at query time:

```js
db.contacts.distinct("tags")
```

A tag exists exactly as long as ≥1 contact references it. There is no separate `tags` collection, no creation/deletion endpoints for tags, and no rename operation in v1.

## Validation Rules

These rules are enforced server-side in the Mongoose schema and surfaced in API `400` responses. The client should also apply them in form components for fast feedback.

| Rule                                                                          | Source        |
|-------------------------------------------------------------------------------|---------------|
| `name` is required and non-empty after trim                                   | FR-001        |
| `phones` must contain at least one entry                                      | FR-007, FR-001 |
| Each `phones[].number` matches `/^[0-9+\-\s]{3,25}$/`                         | data-model    |
| Each `phones[].label` is non-empty and ≤ 20 chars                             | FR-008        |
| `notes` ≤ 2000 chars                                                          | data-model    |
| Each `tags[i]` is non-empty after trim and ≤ 30 chars                         | FR-016        |
| `tags` array length ≤ 20                                                      | data-model    |
| Profile picture file MIME type ∈ {jpeg, png, webp, gif}                       | FR-012        |
| Profile picture file size ≤ 5 MB                                              | data-model    |

## Lifecycle / State Transitions

The Contact document has only one meaningful state flag: `isFavorite`. Transitions:

```
[any contact]
   │
   ├── PATCH /api/contacts/:id/favorite { isFavorite: true }  ──▶  appears in Favorites view
   │
   └── PATCH /api/contacts/:id/favorite { isFavorite: false } ──▶  removed from Favorites view
```

Profile picture lifecycle:

```
[no photo]                                                       [photo set]
    │                                                                  │
    │── POST /:id/photo (multipart) ─────────────────────────────▶─────┤
    │                                                                  │
    │◀──── DELETE /:id/photo (file deleted from disk, photo=null) ─────│
    │                                                                  │
    │       POST /:id/photo (old file deleted, new file saved) ────────┤
                                                                       │
                                                                  DELETE /:id
                                                                       │
                                                                       ▼
                                                              [photo file deleted from disk
                                                               along with contact document]
```

## Relationships

The data model is intentionally flat — there are no foreign keys or joins. Contacts are independent documents; tags are values, not entities; profile pictures are filesystem files referenced by name.
