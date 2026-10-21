# Sprimax — MERN Stack Application

A modern, production-structured fullstack web application built on the **MERN** stack:
- **M**ongoDB (Mongoose ODM schema & database modeling)
- **E**xpress.js (Node.js REST API with modular routing & error handling)
- **R**eact (Vite-powered reactive user interface with custom design tokens)
- **N**ode.js (ES Modules runtime environment)

---

## 📁 Project Structure

```text
Sprimax/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Database connection (db.js)
│   │   ├── controllers/      # Route controllers (healthController, userController)
│   │   ├── middleware/       # Error handling and 404 middlewares
│   │   ├── models/           # Mongoose schemas (User.js)
│   │   ├── routes/           # Express router endpoints (/api/health, /api/users)
│   │   └── server.js         # Backend server entry point
│   ├── .env.example          # Environment variables template
│   ├── .gitignore
│   └── package.json
│
├── frontend/                 # React UI powered by Vite
│   ├── public/
│   ├── src/
│   │   ├── api/              # Axios client and service hooks
│   │   ├── components/       # UI components (Navbar, TechStackGrid, HealthWidget, UserSection, Footer)
│   │   ├── App.jsx           # Main page layout & state
│   │   ├── App.css           # Styling and modern theme tokens
│   │   ├── index.css         # Global CSS variables & typography
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html            # HTML shell with Google Fonts & metadata
│   ├── vite.config.js        # Vite dev server with proxy to backend
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── admin/                    # Separate React admin website
│   ├── public/               # Shared Sprimax brand assets
│   ├── src/                  # Admin login and dashboard UI
│   └── index.html            # Admin app shell
│
├── .gitignore                # Root gitignore
├── package.json              # Monorepo scripts (concurrent dev runner)
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested with Node v24)
- **npm** v9+
- **MongoDB** (Local `mongod` service or MongoDB Atlas cluster connection string)

### 2. Environment Configuration

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/sprimax
CLIENT_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Development Servers

From the root directory, run both frontend and backend concurrently with a single command:

```bash
npm run dev
```

Alternatively, you can run each service individually:

- **Run Backend only**:
  ```bash
  npm run dev:backend
  ```
  Backend runs at [http://localhost:5000](http://localhost:5000).

- **Run Frontend only**:
  ```bash
  npm run dev:frontend
  ```
  Frontend runs at [http://localhost:5173](http://localhost:5173).

- **Run the Admin website only**:
  ```bash
  npm run dev:admin
  ```
  Admin runs at [http://localhost:5174](http://localhost:5174).

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and root welcome message |
| `GET` | `/api/health` | Health status (uptime, database connection, timestamp) |
| `GET` | `/api/users` | Retrieve all users from MongoDB |
| `POST` | `/api/users` | Create a new user (`{ name, email, role }`) |
| `GET` | `/api/solutions/public/:slug` | Public API: Get published solution page |
| `GET` | `/api/solutions/preview/:token` | Preview API: View draft via 7-day secret token |
| `GET` | `/api/solutions` | Admin API: Fetch all solutions with stats & filters |
| `POST` | `/api/solutions` | Admin API: Create solution page |
| `PUT` | `/api/solutions/:id` | Admin API: Update solution page & save version |
| `POST` | `/api/solutions/:id/publish` | Admin API: Publish solution live |
| `POST` | `/api/solutions/:id/unpublish` | Admin API: Revert solution to Draft |
| `POST` | `/api/solutions/:id/duplicate` | Admin API: Duplicate solution as Draft |
| `POST` | `/api/solutions/:id/preview-token` | Admin API: Generate 7-day shareable preview link |
| `POST` | `/api/solutions/:id/restore-version/:ver` | Admin API: Restore from last 10 snapshots |

---

## 🛠️ Industry Solutions CMS Guide

### 1. How to Create a New Industry Solution Page
1. Open the Admin portal at [http://localhost:5174/admin/solutions](http://localhost:5174/admin/solutions).
2. Click **"Create Solution Page"**.
3. Fill in the **Title** (e.g. *Offshore Oil & Gas*) — the URL slug `/solutions/offshore-oil-gas` generates automatically.
4. Add desired sections from the **"Add Section"** picker (`Hero`, `Challenges & Solutions`, `Technical Compliance`, `Engineering Methodology`, `CTA Conversion Banner`).
5. Reorder, duplicate, or toggle visibility on sections as needed.
6. Click **"Save Draft"** to work offline or **"Publish Solution"** to deploy immediately.

### 2. How to Add a New Section Type (Extensibility Architecture)
The section engine uses a two-sided registry system:
- **Editor Registry**: [`admin/src/components/SectionEditorRegistry.jsx`](file:///c:/Users/matee/OneDrive/Documents/Sprimax/admin/src/components/SectionEditorRegistry.jsx)
  1. Add your section type key to `SECTION_METADATA` with label, description, and icon.
  2. Add default data structure to `createDefaultSectionData(type)`.
  3. Create an editor component (e.g. `FaqSectionEditor`) and register it in `SectionEditor`.
- **Renderer Registry**: [`frontend/src/components/solutions/SolutionSectionRegistry.jsx`](file:///c:/Users/matee/OneDrive/Documents/Sprimax/frontend/src/components/solutions/SolutionSectionRegistry.jsx)
  1. Create the public rendering component (e.g. `FaqSection`).
  2. Register in `SECTION_RENDERER_REGISTRY: { ... faq: FaqSection }`.
Both the public site, simulated preview route, and the real-time live preview pane automatically render the new section type!
