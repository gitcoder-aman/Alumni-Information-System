# 🎓 Alumni Information System

> A full-stack web application to connect alumni, students, and administrators — built with **Node.js + Express + MySQL** on the backend and **React + Vite** on the frontend.

deploye on render and database TiDB (for mysql)
live (backend + frontend) -> https://alumni-information-system-backend.onrender.com/
---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Database Schema](#-database-schema)
6. [API Reference](#-api-reference)
7. [Authentication & Authorization](#-authentication--authorization)
8. [Getting Started](#-getting-started)
9. [Environment Variables](#-environment-variables)
10. [Running the Application](#-running-the-application)
11. [Default Admin Credentials](#-default-admin-credentials)
12. [Frontend Pages](#-frontend-pages)
13. [Scripts](#-scripts)
14. [Contributing](#-contributing)
15. [License](#-license)

---

## 📖 Project Overview

The **Alumni Information System** is a comprehensive platform that bridges the gap between a college's alumni community and its current student body. It provides:

- A **directory** for browsing and searching alumni profiles
- An **events board** for managing reunions, seminars, and college events
- A **job board** where alumni can post opportunities for students
- A **messaging system** for direct communication between users
- An **admin panel** for managing users, roles, and helpdesk support

The backend serves a RESTful JSON API and optionally serves the compiled React frontend as a static build, making it deployable as a single unified Node.js process.

---

## ✨ Features

### 👤 Authentication
- User **registration** with name, email, and password
- Secure **login** with JWT token issuance (7-day expiry)
- **Role-based access control** (`admin`, `alumni`, `student`)
- Stateless JWT auth via `Authorization: Bearer <token>` header

### 🏛️ Alumni Directory
- Public searchable **alumni listing** (no login required)
- **Individual profile view** with graduation year, department, company, designation, location, LinkedIn, and bio
- Alumni can **update their own profile**
- Dashboard stats (total alumni count, etc.)

### 📅 Events
- Public **events listing** and detail view
- **Admin-only** create, update, and delete events
- Event fields: title, description, date, location

### 💼 Job Board
- Public **job listings** (full-time, part-time, internship, contract)
- **Alumni and admins** can post, edit, and delete jobs
- Job fields: company, role, description, type, location, deadline, application link

### 💬 Messaging
- Authenticated users can **send messages** to any other user
- **Inbox** and **Sent** views
- Full **conversation thread** with a specific user
- Message deletion

### 🛠️ Admin Panel
- **Dashboard** overview (counts, activity)
- **User management** — list all users, change roles, delete accounts
- **Helpdesk** — view all users who have messaged admin, read full conversations

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18.x | Runtime environment |
| Express.js | ^4.18.2 | HTTP framework & routing |
| MySQL2 | ^3.22.3 | MySQL database driver (promise-based pool) |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT generation & verification |
| dotenv | ^16.0.0 | Environment variable management |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| nodemon | ^3.0.3 | Dev auto-restart (devDependency) |
| docx | ^9.6.1 | Word document generation utility |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.5 | UI component library |
| React DOM | ^19.2.5 | DOM rendering |
| React Router DOM | ^7.14.2 | Client-side routing |
| Vite | ^8.0.10 | Build tool & dev server |
| ESLint | ^10.2.1 | Code linting |

### Database
| Technology | Purpose |
|---|---|
| MySQL | Relational database (tables: users, alumni_profiles, events, jobs, messages) |

---

## 📁 Project Structure

```
alumni-system/
├── backend/                        # Node.js + Express backend
│   ├── config/
│   │   └── db.js                   # MySQL connection pool setup
│   ├── controllers/
│   │   ├── authController.js       # register, login, getMe, getAdminId
│   │   ├── alumniController.js     # CRUD for alumni profiles + stats
│   │   ├── eventController.js      # CRUD for events
│   │   ├── jobController.js        # CRUD for job listings
│   │   ├── messageController.js    # Send/receive/delete messages
│   │   └── adminController.js      # Admin dashboard, user mgmt, helpdesk
│   ├── middleware/
│   │   └── auth.js                 # protect() + authorise() middlewares
│   ├── routes/
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── alumni.js               # /api/alumni/*
│   │   ├── events.js               # /api/events/*
│   │   ├── jobs.js                 # /api/jobs/*
│   │   ├── messages.js             # /api/messages/*
│   │   └── admin.js                # /api/admin/*
│   ├── scripts/
│   │   ├── schema.sql              # Full DB schema + seed admin
│   │   └── setupDb.js              # Script to run schema.sql automatically
│   ├── frontend/                   # Symlink / copy of React dist (served by Express)
│   ├── generateDoc.js              # Utility: generate Word document report
│   ├── server.js                   # Application entry point
│   ├── package.json
│   ├── .env                        # Environment variables (do NOT commit)
│   └── .gitignore
│
└── frontend/                       # React + Vite frontend
    ├── src/
    │   ├── api.js                  # Axios/fetch base config + API helpers
    │   ├── main.jsx                # React app bootstrap
    │   ├── App.jsx                 # Router + route definitions
    │   ├── index.css               # Global styles
    │   ├── context/
    │   │   └── AuthContext.jsx     # Auth state (loggedIn, user, token)
    │   ├── components/
    │   │   ├── Navbar.jsx          # Top navigation bar
    │   │   ├── Toast.jsx           # Toast notification component
    │   │   └── HelpdeskWidget.jsx  # Floating helpdesk chat widget
    │   └── pages/
    │       ├── Home.jsx            # Public landing page
    │       ├── Login.jsx           # Login form
    │       ├── Register.jsx        # Registration form
    │       ├── Dashboard.jsx       # User dashboard (stats + quick links)
    │       ├── Alumni.jsx          # Alumni directory & profiles
    │       ├── Events.jsx          # Events listing & management
    │       ├── Jobs.jsx            # Job board
    │       ├── Messages.jsx        # Inbox / messaging UI
    │       └── Admin.jsx           # Admin panel (users, helpdesk)
    ├── public/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .gitignore
```

---

## 🗄️ Database Schema

The system uses **MySQL** with the following 5 tables:

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `name` | VARCHAR(100) | Full name |
| `email` | VARCHAR(150) UNIQUE | Login identifier |
| `password` | VARCHAR(255) | bcrypt hash |
| `role` | ENUM | `admin`, `student`, `alumni` |
| `created_at` | TIMESTAMP | Auto-set on insert |

### `alumni_profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `user_id` | INT (FK → users) | One-to-one relationship |
| `graduation_year` | INT | e.g. 2022 |
| `department` | VARCHAR(100) | e.g. "Computer Science" |
| `company` | VARCHAR(150) | Current employer |
| `designation` | VARCHAR(150) | Job title |
| `location` | VARCHAR(150) | City / Country |
| `linkedin` | VARCHAR(255) | LinkedIn profile URL |
| `bio` | TEXT | Free-form biography |
| `created_at` / `updated_at` | TIMESTAMP | Auto-managed |

### `events`
| Column | Type | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `title` | VARCHAR(200) | Event name |
| `description` | TEXT | Event details |
| `event_date` | DATE | Date of event |
| `location` | VARCHAR(200) | Venue / Online |
| `created_by` | INT (FK → users) | Admin who created it |

### `jobs`
| Column | Type | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `company` | VARCHAR(150) | Hiring company |
| `role` | VARCHAR(150) | Job title |
| `description` | TEXT | Job details |
| `type` | ENUM | `full-time`, `part-time`, `internship`, `contract` |
| `location` | VARCHAR(150) | Job location |
| `deadline` | DATE | Application deadline |
| `job_link` | VARCHAR(500) | External application URL |
| `posted_by` | INT (FK → users) | Alumni or admin poster |

### `messages`
| Column | Type | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `sender_id` | INT (FK → users) | Message author |
| `receiver_id` | INT (FK → users) | Message recipient |
| `message` | TEXT | Body |
| `is_read` | TINYINT(1) | 0 = unread, 1 = read |
| `created_at` | TIMESTAMP | Auto-set on insert |

---

## 📡 API Reference

All API routes are prefixed with `/api`. Protected routes require the `Authorization: Bearer <token>` header. Admin-only routes additionally require the user's role to be `admin`.

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ Public | Register a new user |
| `POST` | `/api/auth/login` | ❌ Public | Login and receive JWT |
| `GET` | `/api/auth/me` | ✅ Protected | Get current user's info |
| `GET` | `/api/auth/admin-id` | ✅ Protected | Get admin user's ID |

**Register body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "role": "alumni"
}
```

**Login body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

**Login response:**
```json
{
  "token": "<jwt_token>",
  "user": { "id": 1, "name": "Jane Doe", "email": "...", "role": "alumni" }
}
```

---

### 👥 Alumni — `/api/alumni`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/alumni` | ❌ Public | List/search all alumni |
| `GET` | `/api/alumni/stats` | ✅ Protected | Get alumni count stats |
| `GET` | `/api/alumni/profile/me` | ✅ Protected | Get own alumni profile |
| `PUT` | `/api/alumni/profile` | ✅ Alumni only | Update own profile |
| `GET` | `/api/alumni/:id` | ❌ Public | Get a single alumni's profile |

**Query params for listing:** `?search=<keyword>&department=<dept>&graduation_year=<year>`

**Profile update body:**
```json
{
  "graduation_year": 2021,
  "department": "Computer Science",
  "company": "Google",
  "designation": "Software Engineer",
  "location": "Bangalore, India",
  "linkedin": "https://linkedin.com/in/janedoe",
  "bio": "Passionate about open-source."
}
```

---

### 📅 Events — `/api/events`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events` | ❌ Public | List all events |
| `GET` | `/api/events/:id` | ❌ Public | Get single event |
| `POST` | `/api/events` | ✅ Admin only | Create event |
| `PUT` | `/api/events/:id` | ✅ Admin only | Update event |
| `DELETE` | `/api/events/:id` | ✅ Admin only | Delete event |

**Create/update body:**
```json
{
  "title": "Annual Alumni Meet 2025",
  "description": "Join us for the annual gathering...",
  "event_date": "2025-12-15",
  "location": "College Auditorium, Mumbai"
}
```

---

### 💼 Jobs — `/api/jobs`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | ❌ Public | List all job postings |
| `GET` | `/api/jobs/:id` | ❌ Public | Get single job posting |
| `POST` | `/api/jobs` | ✅ Admin / Alumni | Post a new job |
| `PUT` | `/api/jobs/:id` | ✅ Admin / Alumni | Update a job posting |
| `DELETE` | `/api/jobs/:id` | ✅ Admin / Alumni | Delete a job posting |

**Create/update body:**
```json
{
  "company": "Infosys",
  "role": "Backend Developer",
  "description": "Looking for a Node.js developer...",
  "type": "full-time",
  "location": "Pune, India",
  "deadline": "2025-08-31",
  "job_link": "https://infosys.com/careers/apply/123"
}
```

---

### 💬 Messages — `/api/messages`

> All message routes require authentication (`protect` middleware applied globally).

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/messages` | ✅ Protected | Send a message |
| `GET` | `/api/messages/inbox` | ✅ Protected | Get received messages |
| `GET` | `/api/messages/sent` | ✅ Protected | Get sent messages |
| `GET` | `/api/messages/conversation/:userId` | ✅ Protected | Get conversation thread |
| `DELETE` | `/api/messages/:id` | ✅ Protected | Delete a message |

**Send message body:**
```json
{
  "receiver_id": 5,
  "message": "Hello! I saw your profile and would like to connect."
}
```

---

### 🛠️ Admin — `/api/admin`

> All admin routes require `protect` + `authorise('admin')` middleware.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | ✅ Admin only | Get overview stats |
| `GET` | `/api/admin/users` | ✅ Admin only | List all users |
| `PUT` | `/api/admin/users/:id/role` | ✅ Admin only | Update a user's role |
| `DELETE` | `/api/admin/users/:id` | ✅ Admin only | Delete a user |
| `GET` | `/api/admin/helpdesk` | ✅ Admin only | List users who messaged admin |
| `GET` | `/api/admin/helpdesk/:userId` | ✅ Admin only | Full conversation with a user |

**Update role body:**
```json
{
  "role": "alumni"
}
```

---

## 🔒 Authentication & Authorization

### JWT Flow
1. Client sends credentials to `POST /api/auth/login`
2. Server validates, creates a JWT signed with `JWT_SECRET` (expires in `JWT_EXPIRE`)
3. Client stores the token and sends it in every protected request:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
4. The `protect` middleware verifies the token and attaches `req.user = { id, name, email, role }` to the request

### Roles & Permissions

| Action | Public | Student | Alumni | Admin |
|---|:---:|:---:|:---:|:---:|
| View alumni directory | ✅ | ✅ | ✅ | ✅ |
| Update own profile | ❌ | ❌ | ✅ | ✅ |
| View events | ✅ | ✅ | ✅ | ✅ |
| Create / Edit events | ❌ | ❌ | ❌ | ✅ |
| View jobs | ✅ | ✅ | ✅ | ✅ |
| Post / Edit jobs | ❌ | ❌ | ✅ | ✅ |
| Send messages | ❌ | ✅ | ✅ | ✅ |
| Admin panel | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MySQL** v8.0 or higher — [mysql.com](https://www.mysql.com/downloads/)
- **npm** v9 or higher (bundled with Node.js)
- **Git** — [git-scm.com](https://git-scm.com)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/alumni-system.git
cd alumni-system
```

### 2. Set Up the Database

Start MySQL and create a database:

```sql
CREATE DATABASE alumni_db;
```

Then run the schema script to create all tables and seed the default admin:

```bash
cd backend
npm run db:setup
```

> This runs `scripts/setupDb.js` which executes `scripts/schema.sql` against your MySQL instance. It creates all 5 tables and inserts the default admin user.

Alternatively, run the SQL manually:
```bash
mysql -u root -p alumni_db < backend/scripts/schema.sql
```

### 3. Configure Environment Variables

Copy the example env and fill in your values:

```bash
cd backend
# Create .env manually or copy below
```

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alumni_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRE=7d
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## ▶️ Running the Application

### Development Mode (Recommended)

Run the backend and frontend **separately** for hot-reloading:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# React dev server starts on http://localhost:5173
```

The frontend Vite dev server proxies API requests to `http://localhost:5000`, so both work together seamlessly.

---

### Production Mode

Build the React app and serve it from the Express backend:

```bash
# Step 1: Build the React frontend
cd frontend
npm run build

# Step 2: Copy the build output to the backend's frontend/dist folder
# (The backend looks for: backend/frontend/dist/)
# You may need to adjust the path based on your setup.

# Step 3: Start the backend (it will serve the React build)
cd backend
npm start
# Visit http://localhost:5000
```

---

## 🔑 Default Admin Credentials

A default admin account is seeded when you run `npm run db:setup`:

| Field | Value |
|---|---|
| Email | `admin@alumni.com` |
| Password | `Admin@123` |
| Role | `admin` |

> ⚠️ **Change these credentials immediately** in any production environment.

---

## 🖥️ Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | 🔒 Authenticated |
| `/alumni` | Alumni Directory | 🔒 Authenticated |
| `/events` | Events Board | 🔒 Authenticated |
| `/jobs` | Job Board | 🔒 Authenticated |
| `/messages` | Messaging | 🔒 Authenticated |
| `/admin` | Admin Panel | 🔒 Admin only |

### Key UI Components

| Component | Description |
|---|---|
| `Navbar` | Responsive top navigation with links and logout |
| `Toast` | Global notification system for success/error messages |
| `HelpdeskWidget` | Floating chat widget for users to message admin |

---

## 📜 Scripts

### Backend

| Command | Description |
|---|---|
| `npm start` | Start the server with Node (`node server.js`) |
| `npm run dev` | Start with Nodemon (auto-restarts on file changes) |
| `npm run db:setup` | Run the DB schema script to initialize tables |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint for code quality checks |

---

## 🗂️ Additional Files

| File | Description |
|---|---|
| `backend/generateDoc.js` | Generates a Word document (`.docx`) report of alumni data |
| `backend/Alumni_Information_System.docx` | Pre-generated sample report |
| `backend/README.md` | Backend-specific documentation |
| `backend/REPORT.md` | Project report in Markdown |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Code Style
- Use **2-space indentation**
- Follow existing naming conventions (camelCase for JS, snake_case for DB columns)
- Keep controllers thin — business logic should be in controllers, not routes

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Alumni System** — Built as a full-stack web technologies project.

---

## 🏫 Domain Restriction

> **Important:** Registration is restricted to institutional email addresses only.

The system enforces that all self-registered users (students and alumni) must have a **`@uohyd.ac.in`** email address (University of Hyderabad). This is validated server-side in `authController.js`.

```js
const DOMAIN = 'uohyd.ac.in';
if (!email.toLowerCase().endsWith('@' + DOMAIN))
  return res.status(400).json({ message: `Registration is restricted to @${DOMAIN} email addresses.` });
```

| User Type | Email Requirement |
|---|---|
| Student | Must end with `@uohyd.ac.in` |
| Alumni | Must end with `@uohyd.ac.in` |
| Admin | No restriction (seeded directly into DB) |

> To change the allowed domain, update the `DOMAIN` constant in `backend/controllers/authController.js`.

---

## 🧠 Frontend State Management

### AuthContext (`src/context/AuthContext.jsx`)

The frontend uses React's **Context API** to manage authentication state globally. The context provides:

| Value | Type | Description |
|---|---|---|
| `loggedIn` | `boolean` | Whether a user is currently authenticated |
| `user` | `object` | The logged-in user `{ id, name, email, role }` |
| `token` | `string` | JWT token string |
| `login(token, user)` | `function` | Saves auth data to state + `localStorage` |
| `logout()` | `function` | Clears auth data from state + `localStorage` |

### Token Persistence (localStorage)

Auth data is persisted across browser sessions using `localStorage`:

| Key | Value |
|---|---|
| `ais_token` | JWT bearer token string |
| `ais_user` | JSON-stringified user object |

The `api.js` helper automatically reads `ais_token` and injects it into every request header:

```js
if (token) headers['Authorization'] = `Bearer ${token}`;
```

### Route Protection

`App.jsx` uses a `<PrivateRoute>` wrapper component:

```jsx
function PrivateRoute({ children, adminOnly = false }) {
  const { loggedIn, user } = useAuth();
  if (!loggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
```

- Unauthenticated users are redirected to `/login`
- Non-admin users trying to access `/admin` are redirected to `/dashboard`

---

## ⚠️ Error Handling

### Backend Error Responses

All API endpoints return consistent JSON error objects:

```json
{
  "message": "Human-readable error description",
  "error": "Technical error detail (dev mode)"
}
```

#### Common HTTP Status Codes

| Code | Meaning | Example Scenario |
|---|---|---|
| `200` | OK | Successful GET / PUT |
| `201` | Created | Successful POST (register, create job) |
| `400` | Bad Request | Missing fields, invalid role |
| `401` | Unauthorized | No token / invalid token |
| `403` | Forbidden | Wrong role for the route |
| `404` | Not Found | Resource ID doesn't exist |
| `409` | Conflict | Email already registered |
| `500` | Server Error | DB query failure |

### Global Error Handler

`server.js` includes a catch-all Express error handler as the last middleware:

```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});
```

### Frontend Error Handling

The `apiFetch()` helper in `api.js` throws an `Error` with the server's message if the response is not OK:

```js
if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
```

Page components catch these errors and display them via the `Toast` notification system.

---

## 📊 API Response Examples

### Successful Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Ravi Kumar",
    "email": "ravi@uohyd.ac.in",
    "role": "alumni"
  }
}
```

### Alumni Listing Response (`GET /api/alumni`)
```json
[
  {
    "id": 1,
    "user_id": 2,
    "name": "Ravi Kumar",
    "email": "ravi@uohyd.ac.in",
    "graduation_year": 2020,
    "department": "Computer Science",
    "company": "Google",
    "designation": "Software Engineer",
    "location": "Hyderabad, India",
    "linkedin": "https://linkedin.com/in/ravikumar",
    "bio": "Passionate about distributed systems."
  }
]
```

### Admin Dashboard Response (`GET /api/admin/dashboard`)
```json
{
  "totalUsers": 42,
  "totalAlumni": 28,
  "totalStudents": 13,
  "totalEvents": 5,
  "totalJobs": 17,
  "totalMessages": 89
}
```

### Send Message Response (`POST /api/messages`)
```json
{
  "message": "Message sent",
  "id": 34
}
```

---

## 🗺️ Entity Relationship Diagram

```
┌──────────────────┐        ┌─────────────────────────┐
│      users       │        │     alumni_profiles      │
│──────────────────│        │─────────────────────────│
│ id (PK)          │◄──┐    │ id (PK)                  │
│ name             │   └────│ user_id (FK → users.id)  │
│ email (UNIQUE)   │        │ graduation_year          │
│ password         │        │ department               │
│ role             │        │ company                  │
│ created_at       │        │ designation              │
└──────────────────┘        │ location                 │
        │                   │ linkedin                 │
        │                   │ bio                      │
        │                   └─────────────────────────┘
        │
        ├──────────────────────────────────────────────┐
        │                                              │
        ▼                                              ▼
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐
│    events    │     │     jobs     │     │     messages      │
│──────────────│     │──────────────│     │───────────────────│
│ id (PK)      │     │ id (PK)      │     │ id (PK)           │
│ title        │     │ company      │     │ sender_id (FK)    │
│ description  │     │ role         │     │ receiver_id (FK)  │
│ event_date   │     │ description  │     │ message           │
│ location     │     │ type         │     │ is_read           │
│ created_by   │     │ location     │     │ created_at        │
│   (FK)       │     │ deadline     │     └───────────────────┘
└──────────────┘     │ job_link     │
                     │ posted_by(FK)│
                     └──────────────┘
```

**Relationships:**
- `users` → `alumni_profiles` : **One-to-One** (CASCADE DELETE)
- `users` → `events` (created_by) : **One-to-Many** (SET NULL on delete)
- `users` → `jobs` (posted_by) : **One-to-Many** (SET NULL on delete)
- `users` → `messages` (sender & receiver) : **One-to-Many** (CASCADE DELETE)

---

## 🔧 Troubleshooting

### ❌ `MySQL connection error: Access denied for user 'root'@'localhost'`
**Cause:** Wrong DB credentials in `.env`  
**Fix:** Update `DB_USER` and `DB_PASSWORD` in `backend/.env` to match your MySQL setup.

---

### ❌ `MySQL connection error: Unknown database 'alumni_db'`
**Cause:** The database hasn't been created yet.  
**Fix:**
```sql
-- In MySQL shell:
CREATE DATABASE alumni_db;
```
Then run:
```bash
cd backend && npm run db:setup
```

---

### ❌ `Error: JWT_SECRET is not defined`
**Cause:** The `.env` file is missing or not loaded.  
**Fix:** Make sure `backend/.env` exists and contains `JWT_SECRET=...`. Run the server from the `backend/` directory.

---

### ❌ `Registration is restricted to @uohyd.ac.in email addresses`
**Cause:** You are registering with a non-institutional email.  
**Fix:** Use a `@uohyd.ac.in` email, OR change the `DOMAIN` constant in `authController.js` to your institution's domain.

---

### ❌ React build not found (404 on `/`)
**Cause:** The React app hasn't been built yet.  
**Fix:**
```bash
cd frontend && npm run build
# Then copy dist/ into backend/frontend/dist/
```

---

### ❌ CORS errors in browser
**Cause:** The frontend dev server is on port 5173 but calling the backend on 5000 without a proxy.  
**Fix:** Add a proxy in `frontend/vite.config.js`:
```js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

---

### ❌ `Cannot GET /api/...` (404 in production)
**Cause:** React's client-side router is catching the route before Express.  
**Fix:** The catch-all `app.get('*', ...)` in `server.js` handles this — ensure the React build exists at `backend/frontend/dist/`.

---

## 🔐 Security Best Practices

| Practice | Status | Notes |
|---|---|---|
| Passwords hashed with bcrypt | ✅ Done | Salt rounds: 10 |
| JWT signed with secret key | ✅ Done | Change `JWT_SECRET` in production |
| Role-based access control | ✅ Done | `protect` + `authorise` middleware |
| Institutional email restriction | ✅ Done | `@uohyd.ac.in` domain enforced |
| SQL injection prevention | ✅ Done | Parameterized queries via `mysql2` |
| `.env` excluded from Git | ✅ Done | Listed in `.gitignore` |
| `node_modules` excluded from Git | ✅ Done | Listed in `.gitignore` |
| HTTPS in production | ⚠️ Recommended | Use a reverse proxy (Nginx / Caddy) |
| Rate limiting | ⚠️ Recommended | Add `express-rate-limit` |
| Helmet.js headers | ⚠️ Recommended | Add `helmet` middleware |
| Input sanitization | ⚠️ Recommended | Add `express-validator` |

### Hardening for Production

```bash
npm install helmet express-rate-limit
```

```js
// Add to server.js
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
```

---

## 🚀 Deployment Guide

### Option A — Single Server (Express serves React build)

```
Internet → [Node.js / Express :5000]
              ├── /api/*  → API handlers
              └── /*      → React static files (frontend/dist)
```

**Steps:**
1. Build React: `cd frontend && npm run build`
2. Copy `frontend/dist/` → `backend/frontend/dist/`
3. Set `NODE_ENV=production` in your server environment
4. Start: `cd backend && npm start`

---

### Option B — Separate Frontend & Backend (Recommended for scale)

```
Internet → [Nginx]
              ├── /api/* → proxy → Node.js :5000
              └── /*     → React static files (served by Nginx)
```

**Nginx config snippet:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/alumni-system/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Option C — Cloud Platforms

| Platform | Backend | Frontend |
|---|---|---|
| **Railway** | Deploy `backend/` as Node service | Deploy `frontend/` as static site |
| **Render** | Node.js Web Service (free tier) | Static Site |
| **Vercel** | — | Deploy React frontend |
| **Heroku** | Deploy `backend/` (add MySQL addon) | Serve from Express |
| **AWS EC2** | Node.js + PM2 | Nginx static serve |

**Environment variables to set on any cloud platform:**
```
PORT=5000
NODE_ENV=production
DB_HOST=<your-cloud-mysql-host>
DB_PORT=3306
DB_NAME=alumni_db
DB_USER=<db-user>
DB_PASSWORD=<db-password>
JWT_SECRET=<long-random-secret>
JWT_EXPIRE=7d
```

---

## 🌱 Future Enhancements

The following features are planned or recommended for future versions:

| Feature | Priority | Description |
|---|---|---|
| Email notifications | High | Notify users on new messages or events |
| Profile photo upload | High | Allow alumni to upload profile pictures |
| Alumni search filters | Medium | Filter by batch year, department, company |
| Pagination | Medium | Paginate alumni list, jobs, events |
| Real-time messaging | Medium | WebSocket-based live chat (Socket.io) |
| Password reset flow | High | Forgot password via email OTP |
| Alumni verification | Medium | Admin approval before alumni status |
| Export to Excel/PDF | Low | Download alumni directory reports |
| Mobile app | Low | React Native companion app |
| Rate limiting | High | Protect auth routes from brute force |
| Audit logs | Medium | Track admin actions |
| Two-factor auth (2FA) | Low | TOTP-based extra security |

---

## 📚 References & Resources

| Resource | Link |
|---|---|
| Node.js Documentation | [nodejs.org/docs](https://nodejs.org/en/docs/) |
| Express.js Guide | [expressjs.com](https://expressjs.com/) |
| MySQL2 Documentation | [github.com/sidorares/node-mysql2](https://github.com/sidorares/node-mysql2) |
| JSON Web Tokens (JWT) | [jwt.io](https://jwt.io/) |
| bcryptjs | [npmjs.com/package/bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| React Documentation | [react.dev](https://react.dev/) |
| React Router v7 | [reactrouter.com](https://reactrouter.com/) |
| Vite Documentation | [vitejs.dev](https://vitejs.dev/) |
| MySQL Documentation | [dev.mysql.com/doc](https://dev.mysql.com/doc/) |

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Alumni Information System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👨‍💻 Author

**Alumni Information System**  
Built as a full-stack Web Technologies academic project.

- 🏛️ Institution: University of Hyderabad (`@uohyd.ac.in`)
- 🛠️ Stack: Node.js · Express · MySQL · React · Vite
- 📅 Year: 2024–2026

---

> ⭐ If you found this project helpful, give it a star on GitHub!  
> 🐛 Found a bug? Open an [issue](https://github.com/your-username/alumni-system/issues).  
> 💡 Have an idea? Start a [discussion](https://github.com/your-username/alumni-system/discussions).
