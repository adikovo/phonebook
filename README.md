# Phonebook

A single-user web app for managing personal contacts: full CRUD, real-time search, custom tags, favorites, and optional profile pictures.

Built as an npm workspaces monorepo: **React + Vite + shadcn/ui** frontend and a **Node.js + Express + Mongoose** backend connected to MongoDB Atlas, with profile pictures stored on the server filesystem.

## Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS v4, shadcn/ui, axios, Sonner (toasts)
- **Backend**: Node.js 20, Express 5, Mongoose 9, multer, CORS, dotenv
- **Database**: MongoDB Atlas
- **Storage**: server filesystem (`server/uploads/`)

## Quickstart

```bash
# 1. Install everything
npm install

# 2. Set up environment
cp .env.example .env
# Open .env and replace <db_password> with your Atlas password

# 3. Run both client and server
npm run dev
```

- Client: <http://localhost:5173>
- Server: <http://localhost:4000>

The Vite dev server proxies `/api` and `/uploads` requests to the Express backend, so the React app sees everything as same-origin.

## Project layout

```
phonebook/
├── client/              # React + Vite + shadcn/ui
├── server/              # Node.js + Express + Mongoose
│   └── uploads/         # uploaded profile pictures (gitignored)
└── specs/               # spec-kit specifications
    └── 001-phonebook-app/
        ├── spec.md      # what & why
        ├── plan.md      # tech context
        ├── data-model.md
        ├── contracts/api.md
        └── tasks.md     # implementation checklist
```

## Specification

This project was built using [spec-kit](https://github.com/github/spec-kit). The full specification and the detailed task list live under [`specs/001-phonebook-app/`](specs/001-phonebook-app/).
