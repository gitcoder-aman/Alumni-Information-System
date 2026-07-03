# 📘 Alumni Information System — README

> A full-stack web application connecting **students**, **alumni**, and **administrators** of the University of Hyderabad.

---

## 1. 🎯 Project Overview

| Field | Detail |
|---|---|
| **Project Name** | Alumni Information System (AIS) |
| **Type** | Full-Stack Web Application |
| **Purpose** | A dedicated platform connecting **alumni, students, and institution administrators** of the University of Hyderabad |
| **Domain Restriction** | Only `@uohyd.ac.in` email addresses can register (admin accounts are exempt) |
| **Default Admin** | `admin@alumni.com` / `Admin@123` |
| **Server Port** | `5000` (configurable via `.env`) |
| **Run Command** | `npm run dev` (nodemon) or `npm start` |
| **Database** | MySQL — `alumni_db` |
| **License** | MIT |

### What the System Offers
- 👤 **Alumni Directory** — searchable profiles of all alumni
- 📅 **Event Management** — college events, reunions, seminars
- 💼 **Job Board** — alumni post opportunities for students
- 💬 **Messaging** — direct chat between any registered users
- 🔐 **Role-Based Access** — Admin, Alumni, Student with different permissions
- 📊 **Admin Dashboard** — live system statistics and user management
- 🛠️ **Admin Helpdesk** — admin can initiate or reply to conversations with any user
- 🧩 **Floating Widget** — contact admin chat overlay on all user pages

---

## 2. 🛠️ Tech Stack (Complete Breakdown)

| Layer | Technology | Version / Detail | Purpose |
|---|---|---|---|
| **Backend** | Node.js | Runtime | JavaScript server-side execution |
| **Backend** | Express.js | `^4.18.2` | HTTP web framework, routing, middleware |
| **Backend** | mysql2 | `^3.22.3` | MySQL driver — async connection pool |
| **Backend** | bcryptjs | `^2.4.3` | Password hashing (salt rounds = 10) |
| **Backend** | jsonwebtoken | `^9.0.2` | JWT generation & verification |
| **Backend** | dotenv | `^16.4.5` | Environment variable management |
| **Backend** | cors | `^2.8.5` | Cross-Origin Resource Sharing |
| **Backend** | nodemon | `^3.0.3` | Auto-restart during development |
| **Database** | MySQL | v8+ / port `3306` | Relational DBMS |
| **Database** | Database Name | `alumni_db` | Target database |
| **Database** | Connection | Pool limit: 10 | `mysql2.createPool` |
| **Database** | Schema Setup | `schema.sql` | `node scripts/setupDb.js` |
| **Frontend** | HTML5 | — | Page structure (9 pages) |
| **Frontend** | Bootstrap 5.3 | CDN | Responsive layout, components |
| **Frontend** | Vanilla CSS | `style.css` | Custom styles (cards, chat UI, layout) |
| **Frontend** | Vanilla JavaScript | `api.js` | DOM manipulation, API calls, auth logic |
| **Frontend** | Fetch API | — | Async HTTP requests to the backend |
| **Frontend** | localStorage | — | JWT token + user object persistence |
| **Dev Environment** | OS | Windows | Development platform |
| **Dev Environment** | Editor | VS Code | Code editor |
| **Dev Environment** | API Testing | Postman | REST API testing tool |
| **Dev Environment** | Package Manager | npm | Dependency management |

---

## 3. 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                      │
│  HTML Pages  →  api.js (Fetch + localStorage)           │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP/REST (JSON)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (server.js :5000)            │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  CORS    │  │  JSON    │  │  Static  │  Middleware   │
│  │  Enabled │  │  Parser  │  │  Files   │               │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │              ROUTE LAYER                      │       │
│  │  /api/auth  /api/alumni  /api/events          │       │
│  │  /api/jobs  /api/messages  /api/admin         │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │           MIDDLEWARE (auth.js)                │       │
│  │   protect() — JWT verify                     │       │
│  │   authorise() — Role guard                   │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │           CONTROLLER LAYER                    │       │
│  │  authController  alumniController             │       │
│  │  eventController jobController                │       │
│  │  messageController adminController            │       │
│  └──────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────┘
                         │  SQL queries (mysql2.Pool)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              MySQL Database (alumni_db)                  │
│   users | alumni_profiles | events | jobs | messages    │
└─────────────────────────────────────────────────────────┘
```

### Architecture Pattern
- **MVC-like**: Routes → Middleware → Controllers → Database
- **REST API** with JSON responses
- **SPA-style Frontend**: Single-page navigation, catch-all serves `index.html`
- **Stateless Auth**: JWT stored in `localStorage`, sent as `Bearer` header

---

## 4. 📁 Project Folder Structure

```
alumni-system/
│
├── server.js               ← App entry point
├── package.json            ← Dependencies & scripts
├── .env                    ← Environment variables (secret)
├── .gitignore
│
├── config/
│   └── db.js               ← MySQL Pool connection
│
├── middleware/
│   └── auth.js             ← JWT protect() + Role authorise()
│
├── controllers/            ← Business logic
│   ├── authController.js   ← register, login, getMe, getAdminId
│   ├── alumniController.js ← getAllAlumni, getById, updateProfile, getMyProfile
│   ├── eventController.js  ← CRUD events
│   ├── jobController.js    ← CRUD jobs (with ownership check)
│   ├── messageController.js← send, inbox, conversation, mark-read
│   └── adminController.js  ← dashboard stats, user CRUD, helpdesk
│
├── routes/                 ← URL → Controller mapping
│   ├── auth.js             ← /api/auth/*
│   ├── alumni.js           ← /api/alumni/*
│   ├── events.js           ← /api/events/*
│   ├── jobs.js             ← /api/jobs/*
│   ├── messages.js         ← /api/messages/*
│   └── admin.js            ← /api/admin/*
│
├── scripts/
│   ├── schema.sql          ← Full DB schema + seed admin
│   └── setupDb.js          ← Runs schema.sql once to init DB
│
└── public/                 ← Frontend (static files served by Express)
    ├── index.html          ← Landing page (redirects by auth)
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── alumni.html
    ├── events.html
    ├── jobs.html
    ├── messages.html
    ├── admin.html
    ├── css/
    │   └── style.css       ← Custom CSS (cards, chat UI, layout)
    └── js/
        └── api.js          ← Shared: apiFetch(), auth helpers, navbar renderer
```

---

## 5. 🗄️ Database Design

### Tables Overview

```
users            ←─────────────────────────────────────────────┐
  id (PK)                                                       │
  name                                                          │
  email (UNIQUE)                                                │
  password (bcrypt hash)                                        │
  role: admin | student | alumni                                │
  created_at                                                    │
       │                                                        │
       ├──► alumni_profiles (user_id FK)                        │
       │      graduation_year, department, company              │
       │      designation, location, linkedin, bio              │
       │                                                        │
       ├──► events (created_by FK)                              │
       │      title, description, event_date, location          │
       │                                                        │
       ├──► jobs (posted_by FK)                                 │
       │      company, role, description, type, location        │
       │      deadline, job_link                                │
       │                                                        │
       └──► messages (sender_id FK, receiver_id FK)             │
              message, is_read, created_at ─────────────────────┘
```

### Table Details

#### `users` — Core user table
| Column | Type | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT PK | Unique user ID |
| `name` | VARCHAR(100) | Required |
| `email` | VARCHAR(150) UNIQUE | University email enforced |
| `password` | VARCHAR(255) | bcrypt hashed |
| `role` | ENUM(`admin`,`student`,`alumni`) | Default: `student` |
| `created_at` | TIMESTAMP | Default `NOW()` |

#### `alumni_profiles` — Extended alumni info
| Column | Type | Notes |
|---|---|---|
| `user_id` | FK → users | CASCADE delete |
| `graduation_year` | INT | Batch year |
| `department` | VARCHAR(100) | e.g., Computer Science |
| `company` | VARCHAR(150) | Current employer |
| `designation` | VARCHAR(150) | Job title |
| `location` | VARCHAR(150) | City/Country |
| `linkedin` | VARCHAR(255) | Profile URL |
| `bio` | TEXT | Free text |

#### `events` — College events
| Column | Type | Notes |
|---|---|---|
| `title` | VARCHAR(200) | Required |
| `description` | TEXT | Optional |
| `event_date` | DATE | Required |
| `location` | VARCHAR(200) | Venue |
| `created_by` | FK → users | SET NULL on delete |

#### `jobs` — Job postings
| Column | Type | Notes |
|---|---|---|
| `company` | VARCHAR(150) | Required |
| `role` | VARCHAR(150) | Job title, Required |
| `type` | ENUM | `full-time`, `part-time`, `internship`, `contract` |
| `location` | VARCHAR(150) | City/Remote |
| `deadline` | DATE | Application deadline |
| `job_link` | VARCHAR(500) | External application URL |
| `posted_by` | FK → users | SET NULL on delete |

#### `messages` — Direct messages
| Column | Type | Notes |
|---|---|---|
| `sender_id` | FK → users | CASCADE delete |
| `receiver_id` | FK → users | CASCADE delete |
| `message` | TEXT | Required |
| `is_read` | TINYINT(1) | Default `0` (unread) |
| `created_at` | TIMESTAMP | Sent at |

### Database Indexes
```sql
idx_users_email          → users(email)
idx_users_role           → users(role)
idx_alumni_profiles_uid  → alumni_profiles(user_id)
idx_alumni_grad_year     → alumni_profiles(graduation_year)
idx_alumni_department    → alumni_profiles(department)
idx_messages_sender      → messages(sender_id)
idx_messages_receiver    → messages(receiver_id)
idx_jobs_deadline        → jobs(deadline)
idx_events_date          → events(event_date)
```

---

## 6. 🔐 Security & Authentication System

### Authentication Flow
```
1. User fills login form (email + password)
2. Frontend: client-side domain check (@uohyd.ac.in)
3. POST /api/auth/login → authController.login()
4. Server: fetch user by email from DB
5. Server: bcrypt.compare(password, hashed_password)
6. If match → jwt.sign({ id, name, email, role }, JWT_SECRET, { expiresIn: '7d' })
7. Token + user object returned to client
8. Client: localStorage.setItem('ais_token', token)
9. Every subsequent API call: Authorization: Bearer <token>
10. protect() middleware: jwt.verify(token, JWT_SECRET) → req.user
```

### JWT Token Payload
```json
{
  "id": 1,
  "name": "Aman",
  "email": "aman@uohyd.ac.in",
  "role": "alumni",
  "iat": 1234567890,
  "exp": 1235172690
}
```

### Role-Based Access Control (RBAC)

| Feature | Student | Alumni | Admin |
|---|:---:|:---:|:---:|
| View alumni list | ✅ | ✅ | ✅ |
| View events | ✅ | ✅ | ✅ |
| View jobs | ✅ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ |
| Update own alumni profile | ❌ | ✅ | ❌ |
| Post jobs | ❌ | ✅ | ✅ |
| Edit own posted job | ❌ | ✅ | ✅ (if posted) |
| Delete any job | ❌ | ❌ | ✅ |
| Create/Edit/Delete events | ❌ | ❌ | ✅ |
| View admin dashboard stats | ❌ | ❌ | ✅ |
| Manage users (role/delete) | ❌ | ❌ | ✅ |
| Helpdesk — initiate chat | ❌ | ❌ | ✅ |
| Helpdesk — reply to admin | ✅ | ✅ | ✅ |

### Security Features
- **bcrypt** password hashing (salt rounds = 10)
- **JWT** tokens expire in **7 days**
- **University email enforcement** (`@uohyd.ac.in`) at both register + login
- **Ownership checks** on job edits (only the original poster can edit)
- **Admin self-protection** (admin cannot delete or change their own account from the UI)
- **Parameterized SQL queries** everywhere (prevents SQL injection)

---

## 7. 🔌 Complete API Reference

### Base URL: `http://localhost:5000/api`

| Group | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| **Auth** | POST | `/auth/register` | ❌ | Register new student or alumni account |
| **Auth** | POST | `/auth/login` | ❌ | Login — returns JWT token + user object |
| **Auth** | GET | `/auth/me` | ✅ Any | Get authenticated user's profile |
| **Auth** | GET | `/auth/admin-id` | ❌ | Get first admin's ID & name (helpdesk widget) |
| **Alumni** | GET | `/alumni/` | ✅ Any | List all alumni (`?name=`, `?batch=`, `?department=`) |
| **Alumni** | GET | `/alumni/:id` | ✅ Any | Get single alumni's full profile |
| **Alumni** | GET | `/alumni/profile/me` | ✅ Alumni | Get own alumni profile |
| **Alumni** | PUT | `/alumni/profile` | ✅ Alumni | Update own alumni profile |
| **Events** | GET | `/events/` | ✅ Any | List all events |
| **Events** | POST | `/events/` | ✅ Admin | Create new event |
| **Events** | PUT | `/events/:id` | ✅ Admin | Update event |
| **Events** | DELETE | `/events/:id` | ✅ Admin | Delete event |
| **Jobs** | GET | `/jobs/` | ✅ Any | List all jobs |
| **Jobs** | POST | `/jobs/` | ✅ Alumni / Admin | Post a new job |
| **Jobs** | PUT | `/jobs/:id` | ✅ Owner / Admin | Update job (ownership enforced) |
| **Jobs** | DELETE | `/jobs/:id` | ✅ Owner / Admin | Delete job (ownership enforced) |
| **Messages** | POST | `/messages/` | ✅ Any | Send a message `{ receiver_id, message }` |
| **Messages** | GET | `/messages/inbox` | ✅ Any | Get inbox grouped by sender, latest first |
| **Messages** | GET | `/messages/conversation/:userId` | ✅ Any | Get full thread + mark messages as read |
| **Admin** | GET | `/admin/dashboard` | ✅ Admin | System-wide stats (users, events, jobs, messages) |
| **Admin** | GET | `/admin/users` | ✅ Admin | List all registered users |
| **Admin** | PUT | `/admin/users/:id/role` | ✅ Admin | Change a user's role |
| **Admin** | DELETE | `/admin/users/:id` | ✅ Admin | Permanently delete a user |
| **Admin** | GET | `/admin/helpdesk` | ✅ Admin | List users who messaged admin (with unread count) |
| **Admin** | GET | `/admin/helpdesk/:userId` | ✅ Admin | Full conversation between admin and a specific user |

---

## 8. 🖥️ Frontend Pages

| Page | File | Access | Description |
|---|---|---|---|
| Landing | `index.html` | All | Auto-redirects to dashboard (logged in) or login |
| Login | `login.html` | Public | JWT login form with validation |
| Register | `register.html` | Public | Student / alumni registration (domain restricted) |
| Dashboard | `dashboard.html` | All | Personal greeting, role badge, quick nav links |
| Alumni Directory | `alumni.html` | All | Filterable table + profile modal + inline profile edit (alumni) |
| Events | `events.html` | All | Event cards; admin form appears for create/edit |
| Job Board | `jobs.html` | All | Job cards with type badge, deadline, apply link; post/edit for alumni |
| Messages | `messages.html` | All | Split-pane: inbox list + chat thread; smart recipient pre-fill |
| Admin Panel | `admin.html` | Admin only | Stats cards + user table + helpdesk chat panel |

---

## 9. ✨ Key Features Detail

| Module | Feature | Detail |
|---|---|---|
| **Alumni Directory** | Search | Filter by name, batch year, department |
| **Alumni Directory** | Profile Modal | View company, designation, location, LinkedIn, bio |
| **Alumni Directory** | Message Button | One-click redirect to Messages with pre-filled recipient |
| **Alumni Directory** | Profile Edit | Alumni can update their own profile inline |
| **Messaging System** | Recipient Field | Read-only when accessed via Alumni Directory redirect |
| **Messaging System** | Recipient Banner | Shows `💬 Sending message to: <Name>` for context |
| **Messaging System** | Auto-focus | Message input auto-focused on redirect from alumni page |
| **Messaging System** | Chat UI | Split-pane inbox + bubble-style conversation thread |
| **Messaging System** | Read Status | `is_read` flag updated when conversation is opened |
| **Admin Helpdesk** | Inbox | Lists all users who have messaged the admin |
| **Admin Helpdesk** | Unread Badge | Shows count of unread messages per user |
| **Admin Helpdesk** | ＋ New Button | Admin can start a conversation with any student/alumni first |
| **Admin Helpdesk** | User Picker | Search dropdown with name, role, email of all non-admin users |
| **Admin Helpdesk** | Auto Refresh | Helpdesk sidebar refreshes every 30 seconds |
| **Admin Helpdesk** | Empty State | Friendly prompt when admin opens a user with no messages yet |
| **Job Board** | Post | Alumni and admin can post with company, role, type, location, deadline |
| **Job Board** | Job Link | External URL — redirects to actual application portal |
| **Job Board** | Ownership | Edit/Delete only visible to original poster or admin |
| **Job Board** | Type Badge | `Full-Time` · `Part-Time` · `Internship` · `Contract` |

---

## 10. 🚀 Getting Started

### Prerequisites

| Requirement | Minimum Version |
|---|---|
| **Node.js** | v16+ |
| **MySQL** | v8+ |
| **npm** | v8+ |

### Step 1 — Clone the Repository
```bash
git clone <repository-url>
cd alumni-system
```

### Step 2 — Install Dependencies
```bash
npm install
```

### Step 3 — Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alumni_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
```

### Step 4 — Set Up the Database
```bash
npm run db:setup
```

This will:
- Create the `alumni_db` database (if not exists)
- Run `schema.sql` — create all 5 tables + 9 indexes
- Seed the default admin account

### Step 5 — Start the Server
```bash
# Development mode (auto-restarts on changes)
npm run dev

# Production mode
npm start
```

### Step 6 — Open in Browser
```
http://localhost:5000
```

---

## 11. 🔑 Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `DB_HOST` | `localhost` | ✅ | MySQL server hostname |
| `DB_PORT` | `3306` | ✅ | MySQL server port |
| `DB_NAME` | `alumni_db` | ✅ | Target database name |
| `DB_USER` | `root` | ✅ | MySQL username |
| `DB_PASSWORD` | *(empty)* | ✅ | MySQL password |
| `JWT_SECRET` | — | ✅ | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | `7d` | ❌ | Token expiry (`7d`, `24h`, etc.) |
| `PORT` | `5000` | ❌ | HTTP server port |
| `NODE_ENV` | `development` | ❌ | Environment mode |

---

## 12. 🔐 Default Credentials

| Field | Value |
|---|---|
| **Email** | `admin@alumni.com` |
| **Password** | `Admin@123` |
| **Role** | `admin` |

> ⚠️ Change the admin password after first login in any production environment.

---

## 13. 📦 NPM Scripts

| Script | Command | Description |
|---|---|---|
| `npm start` | `node server.js` | Start production server |
| `npm run dev` | `nodemon server.js` | Start dev server with auto-reload |
| `npm run db:setup` | `node scripts/setupDb.js` | Create DB schema + seed admin |

---

## 14. 📝 Important Notes

| Topic | Detail |
|---|---|
| **Email Domain** | Self-registration is restricted to `@uohyd.ac.in`. Admins bypass this on login. |
| **Alumni Profile** | Auto-created on registration (alumni) or when admin promotes a student → alumni. |
| **Message Read Status** | Marked `is_read = 1` automatically when conversation thread is opened. |
| **Helpdesk Refresh** | Admin helpdesk sidebar polls every **30 seconds** for new messages. |
| **Job Ownership** | Edit/Delete rendered only if `posted_by === currentUser.id` or role is `admin`. |
| **Admin Initiate Chat** | Admin can open a conversation with any student/alumni first via **＋ New** picker. |
| **Recipient Lock** | When navigating to Messages via Alumni Directory, recipient ID is `readonly`. |
| **Connection Pool** | MySQL pool is set to **10 connections** with unlimited queue. |
| **Static Hosting** | The `public/` folder is served directly by Express — no separate frontend build. |
| **Admin Self-Guard** | Admin cannot delete/modify their own account via the UI. |

---

## 📄 License

MIT License — free to use and modify for educational purposes.
