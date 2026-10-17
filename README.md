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
