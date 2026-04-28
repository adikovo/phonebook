# Quickstart: Phonebook Contact Manager

**Goal**: Get the app running locally end-to-end in under 10 minutes.

## Prerequisites

- Node.js 20 LTS (`node --version` should print `v20.x.x`)
- npm 10+
- A MongoDB Atlas cluster and connection string (the user has already provisioned `Cluster0`)

## 1. Clone and install

```bash
cd phonebook
npm install
```

This installs dependencies for the root, `client/`, and `server/` workspaces in one pass.

## 2. Configure environment

Create a `.env` file at the repo root (it is gitignored):

```env
MONGODB_URI=mongodb+srv://adikovo_db_user:<your-real-password>@cluster0.8eqtv7c.mongodb.net/phonebook?appName=Cluster0
PORT=4000
```

Replace `<your-real-password>` with the actual password and add `/phonebook` as the database name (so the app uses a dedicated DB rather than the default).

## 3. Run in development

From the repo root:

```bash
npm run dev
```

This concurrently starts:

- **Backend** on `http://localhost:4000` (Express, auto-restart on changes)
- **Frontend** on `http://localhost:5173` (Vite, HMR)

The Vite dev server proxies `/api/*` and `/uploads/*` to `localhost:4000`, so the frontend treats both the API and the uploaded images as same-origin during development.

## 4. Smoke test

Open `http://localhost:5173` in a browser and verify:

1. **Empty state** — the All Contacts page shows an "Add your first contact" message.
2. **Create** — click "Add contact", fill in name + one phone, save → the contact appears in the grid as a card.
3. **Initials avatar** — the new contact (with no photo) shows initials in a colored circle.
4. **Search** — type the first letter of the contact's name into the search bar; the list narrows in real time.
5. **Tag** — edit the contact, add a tag like "Family", save → a `Family` chip appears below the search bar.
6. **Tag filter** — click the `Family` chip → only tagged contacts are shown.
7. **Favorite** — click the star icon on a contact → switch to the Favorites tab and confirm it's there.
8. **Photo upload** — edit, upload a JPEG/PNG, save → the avatar replaces the initials.
9. **Photo remove** — edit, click "Remove photo" → initials are shown again.
10. **Delete** — delete the contact, confirm → it disappears from both views.

If all 10 steps work, the v1 implementation matches the spec.

## 5. Verify against API contract

Optional sanity checks with `curl`:

```bash
# list (should be JSON array)
curl http://localhost:4000/api/contacts

# tags
curl http://localhost:4000/api/tags
```

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| Server fails on startup with `MongoServerError: bad auth` | wrong password in `.env` `MONGODB_URI` |
| `npm run dev` runs only one process | `concurrently` missing — run `npm install` from the root again |
| Image uploads return 400 | file is not JPEG/PNG/WebP/GIF, or larger than 5 MB |
| Frontend says "Network Error" but backend is up | Vite proxy misconfigured — check `client/vite.config.js` |
| Avatar 404s after upload | check `server/uploads/` exists and is writable |
