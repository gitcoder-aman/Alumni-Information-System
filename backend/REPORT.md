# 📘 Alumni Information System — Full Technical Report
> **Purpose:** PPT-ready, in-depth documentation of every aspect of the system.

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

### What the System Offers
- 👤 **Alumni Directory** — searchable profiles of all alumni
- 📅 **Event Management** — college events, reunions, seminars
- 💼 **Job Board** — alumni post opportunities for students
- 💬 **Messaging** — direct chat between any registered users
- 🔐 **Role-Based Access** — Admin, Alumni, Student with different permissions
- 📊 **Admin Dashboard** — live system statistics and user management

---

## 2. 🛠️ Tech Stack (Complete Breakdown)

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | Runtime | JavaScript server-side execution |
| **Express.js** | `^4.18.2` | HTTP web framework, routing, middleware |
| **pg (node-postgres)** | `^8.11.3` | PostgreSQL driver — connection pool |
| **bcryptjs** | `^2.4.3` | Password hashing (salt rounds = 10) |
| **jsonwebtoken** | `^9.0.2` | JWT generation & verification |
| **dotenv** | `^16.4.5` | Environment variable management |
| **cors** | `^2.8.5` | Cross-Origin Resource Sharing |
| **nodemon** | `^3.0.3` | Auto-restart during development |

### Database
| Technology | Detail |
|---|---|
| **PostgreSQL** | Relational DBMS (runs on port `5432`) |
| **Database Name** | `alumni_db` |
| **Connection** | Connection Pool via `pg.Pool` |
| **Schema Setup** | `node scripts/setupDb.js` (reads `schema.sql`) |

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Page structure (9 pages) |
| **Bootstrap 5.3** | CDN — responsive layout, components |
| **Vanilla CSS** | Custom styles (`public/css/style.css`) |
| **Vanilla JavaScript** | DOM manipulation, API calls, auth logic |
| **Google Fonts (Roboto)** | Typography |
| **Fetch API** | Async HTTP requests to the backend |
| **localStorage** | JWT token + user object persistence |

### Dev Environment
| Item | Value |
|---|---|
| **OS** | Windows |
| **Editor** | VS Code |
| **API Testing** | Postman |
| **Package Manager** | npm |

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
                         │  SQL queries (pg.Pool)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database (alumni_db)             │
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
│   └── db.js               ← PostgreSQL Pool connection
│
├── middleware/
│   └── auth.js             ← JWT protect() + Role authorise()
│
├── controllers/            ← Business logic
│   ├── authController.js   ← register, login, getMe
│   ├── alumniController.js ← getAllAlumni, getById, updateProfile, getMyProfile
│   ├── eventController.js  ← CRUD events
│   ├── jobController.js    ← CRUD jobs
│   ├── messageController.js← send, inbox, sent, conversation, delete
│   └── adminController.js  ← dashboard stats, user CRUD
│
├── routes/                 ← URL → Controller mapping
│   ├── auth.js
│   ├── alumni.js
│   ├── events.js
│   ├── jobs.js
│   ├── messages.js
│   └── admin.js
│
├── scripts/
│   ├── schema.sql          ← Full DB schema + seed admin
│   └── setupDb.js          ← Runs schema.sql once to init DB
│
└── public/                 ← Frontend (static files served by Express)
    ├── index.html          ← Landing page
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── alumni.html
    ├── events.html
    ├── jobs.html
    ├── messages.html
    ├── admin.html
    ├── css/
    │   └── style.css       ← Custom CSS (Roboto font, cards, chat UI)
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
| `id` | SERIAL PK | Auto-increment |
| `name` | VARCHAR(100) | Required |
| `email` | VARCHAR(150) UNIQUE | University email enforced |
| `password` | VARCHAR(255) | bcrypt hashed |
| `role` | VARCHAR(20) | CHECK: `admin`, `student`, `alumni` |
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
| `type` | VARCHAR(50) | `full-time`, `part-time`, `internship`, `contract` |
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
| `is_read` | BOOLEAN | Default `FALSE` |

### Database Indexes (Performance)
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

#### 🔑 Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register as student or alumni |
| POST | `/login` | Public | Login, returns JWT token |
| GET | `/me` | 🔒 Any | Get current user's profile |

#### 👥 Alumni — `/api/alumni`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List all alumni (filter: name, batch, department) |
| GET | `/:id` | Public | View single alumni profile |
| GET | `/profile/me` | 🔒 Any | Get own profile |
| PUT | `/profile` | 🔒 Alumni | Update own profile |

**Query Params for GET /api/alumni:**
```
?name=Aman          → case-insensitive search
?batch=2022         → filter by graduation year
?department=CS      → case-insensitive department filter
```

#### 📅 Events — `/api/events`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List all events (ordered by date ASC) |
| GET | `/:id` | Public | View a single event |
| POST | `/` | 🔒 Admin | Create a new event |
| PUT | `/:id` | 🔒 Admin | Update an event |
| DELETE | `/:id` | 🔒 Admin | Delete an event |

#### 💼 Jobs — `/api/jobs`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List all jobs (filter: type, company) |
| GET | `/:id` | Public | View a single job |
| POST | `/` | 🔒 Admin/Alumni | Post a new job |
| PUT | `/:id` | 🔒 Admin/Alumni (poster only) | Update job |
| DELETE | `/:id` | 🔒 Admin | Delete a job |

**Query Params for GET /api/jobs:**
```
?type=internship    → filter by job type
?company=Infosys    → case-insensitive company search
```

#### 💬 Messages — `/api/messages`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔒 Any | Send a message |
| GET | `/inbox` | 🔒 Any | All received messages |
| GET | `/sent` | 🔒 Any | All sent messages |
| GET | `/conversation/:userId` | 🔒 Any | Full thread with a user (marks as read) |
| DELETE | `/:id` | 🔒 Any | Delete own message |

#### ⚙️ Admin — `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | 🔒 Admin | Live stats (users, alumni, students, events, jobs, messages) |
| GET | `/users` | 🔒 Admin | All users list |
| PUT | `/users/:id/role` | 🔒 Admin | Change a user's role |
| DELETE | `/users/:id` | 🔒 Admin | Delete a user |

---

## 8. 🖥️ Frontend Pages (Module by Module)

### 1. Landing Page (`index.html`)
- Public page — no login required
- Shows **6 feature cards**: Profiles, Events, Jobs, Messaging, Search, Role-Based Access
- If already logged in → auto-redirects to dashboard
- CTA buttons: "Get Started" (register) and "Login"

### 2. Login Page (`login.html`)
- **Client-side validation**: checks `@uohyd.ac.in` domain before sending request
- Shows error alerts inline below the form
- On success: stores JWT + user object in `localStorage`, redirects to `/dashboard.html`
- Demo admin credentials shown on page: `admin@alumni.com / Admin@123`

### 3. Register Page (`register.html`)
- Fields: Name, Email, Password, Role (Student / Alumni)
- Domain enforced: only `@uohyd.ac.in` emails allowed
- On alumni registration: empty `alumni_profiles` row auto-created by server
- On success: token saved, redirected to dashboard

### 4. Dashboard (`dashboard.html`)
- **Greeting**: "Welcome, [Name]" + Role display
- **4 stat cards**: Total Alumni, Total Students, Events, Job Postings
  - Admin: fetches from `/api/admin/dashboard` (real DB counts)
  - Others: fetches public lists and counts array length
- **Upcoming Events**: top 4 events rendered as list
- **Latest Jobs**: top 4 job postings rendered as list
- **My Profile (alumni only)**: shows Department, Batch, Company, Designation, Location

### 5. Alumni Directory (`alumni.html`)
- Search bar: filter by name, graduation batch, department
- Renders alumni as **cards with avatar circle** (initials)
- Shows: Name, Designation, Company, Department, Batch, Location, LinkedIn
- "Message" button links to `/messages.html?to=ID&name=NAME`
- Alumni can edit their own profile via a form modal/section

### 6. Events Page (`events.html`)
- Public read — all logged-in users see all events
- Admin sees **Create Event** button
- Events shown as cards: title, date, location, description, creator name
- Admin can **Edit** (pre-filled form) or **Delete** any event

### 7. Jobs & Internships (`jobs.html`)
- Filter bar: by company name (text) and type (dropdown)
- Table columns: #, Company, Role, Type, Location, Deadline, Apply, Actions
- **Apply ↗** button links to external job portal (`job_link`)
- **Post Job** button shown for Admin and Alumni roles
- **Edit** button: only shown to the user who posted the job
- **Delete** button: only shown to Admin
- Inline form slides open to post or edit a job

### 8. Messages (`messages.html`)
- **Two-panel chat layout**:
  - Left panel: Inbox list (unique senders)
  - Right panel: Chat bubbles (sent = blue right, received = white left)
- "Send New Message" form at top (requires recipient User ID + message)
- Opening a conversation auto-marks messages as `is_read = TRUE`
- Enter key sends message in chat input
- Deep-link support: `/messages.html?to=5&name=Ravi` opens conversation directly

### 9. Admin Panel (`admin.html`)
- Access: Admin role only (guarded by `requireAuth(['admin'])`)
- **User Table**: shows all users (Name, Email, Role badge, Join Date)
- **Search bar**: client-side filter by name or email
- **Role Change**: inline dropdown per user + Save button
- **Delete User**: confirmation dialog, cannot delete self
- Auto-creates `alumni_profiles` row when a user is promoted to Alumni role

---

## 9. 🔄 Key Data Flows

### Registration Flow
```
User fills form → POST /api/auth/register
  → Validate domain (@uohyd.ac.in)
  → Check email uniqueness in DB
  → bcrypt.hash(password, 10)
  → INSERT INTO users
  → IF role='alumni': INSERT INTO alumni_profiles(user_id)
  → jwt.sign() → return token + user
  → Client: localStorage → redirect to /dashboard.html
```

### Login Flow
```
User fills form → Client domain check → POST /api/auth/login
  → SELECT * FROM users WHERE email = $1
  → Server domain check (non-admin must use uohyd.ac.in)
  → bcrypt.compare(password, hash)
  → jwt.sign({ id, name, email, role }, JWT_SECRET, '7d')
  → return token + user → Client localStorage
```

### Protected API Call Flow
```
Client: apiFetch('/events') 
  → Fetch with headers: { Authorization: 'Bearer <token>' }
  → protect() middleware: jwt.verify(token, JWT_SECRET)
  → req.user = { id, name, email, role }
  → authorise('admin') [if needed]: check req.user.role
  → Controller: pool.query(SQL) → res.json(data)
```

### Messaging Flow
```
User A opens Messages → GET /messages/inbox → list of senders
Click on User B → GET /messages/conversation/:B_id
  → Fetch all messages between A & B (both directions)
  → UPDATE messages SET is_read=TRUE WHERE receiver=A, sender=B
  → Render as chat bubbles
User A types → Enter/Send → POST /messages { receiver_id: B, message }
  → INSERT INTO messages → reload conversation
```

---

## 10. 🔧 Environment Configuration (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alumni_db
DB_USER=postgres
DB_PASSWORD=****

# JWT
JWT_SECRET=alumni_system_super_secret_jwt_key_2024
JWT_EXPIRE=7d
```

---

## 11. 🚀 Setup & Deployment

### Local Setup Steps
```bash
# 1. Install dependencies
npm install

# 2. Create PostgreSQL database
createdb alumni_db   # or via pgAdmin

# 3. Set up environment variables
# Edit .env with your DB credentials

# 4. Initialize database (creates tables + seeds admin)
npm run db:setup

# 5. Start development server
npm run dev

# 6. Open browser
http://localhost:5000
```

### npm Scripts
| Script | Command | Purpose |
|---|---|---|
| `npm start` | `node server.js` | Production start |
| `npm run dev` | `nodemon server.js` | Development (auto-restart) |
| `npm run db:setup` | `node scripts/setupDb.js` | Init DB tables + admin seed |

---

## 12. 📊 System Statistics Summary

| Metric | Count |
|---|---|
| **Total Backend Files** | 13 JS files |
| **Frontend Pages** | 9 HTML pages |
| **API Endpoints** | 22 REST endpoints |
| **Database Tables** | 5 |
| **Database Indexes** | 9 |
| **npm Packages** | 6 production + 1 dev |
| **User Roles** | 3 (Admin, Alumni, Student) |
| **Lines of CSS** | 313 lines |
| **Lines of Custom JS (frontend)** | 89 lines (api.js) + inline per page |

---

## 13. 💡 Key Design Decisions & Highlights

1. **University Email Restriction** — Both backend and frontend validate `@uohyd.ac.in`, making it an institution-exclusive platform.

2. **Auto Alumni Profile Creation** — When a user registers as alumni OR admin promotes a user to alumni role, a blank `alumni_profiles` row is auto-created (no orphan profiles).

3. **Job Ownership Model** — Only the **original poster** can edit a job. Admin can only **delete** (not edit). This is enforced at both DB query level (compare `posted_by === req.user.id`) and the UI (Edit button only shown to the poster).

4. **Parameterized Queries** — All SQL uses `$1, $2` placeholders via `pg` driver — fully protected against SQL injection.

5. **Connection Pool** — `pg.Pool` is used instead of a single client, allowing multiple concurrent requests efficiently.

6. **Shared api.js** — All 9 pages share one `api.js` file which provides: `apiFetch()`, `requireAuth()`, `renderNavbar()`, `showToast()`, `saveAuth()`, `clearAuth()`. This avoids code duplication.

7. **Dynamic Navbar** — The navbar is rendered dynamically from `api.js` based on the user's role. The Admin link only appears for admins.

8. **Read Receipts** — The messaging system marks messages as `is_read=TRUE` automatically when a conversation is opened.

9. **Catch-All Route** — `app.get('*', ...)` serves `index.html` for any unknown URL, enabling client-side page navigation without 404 errors.

10. **Self-Protection for Admin** — The admin panel prevents an admin from changing or deleting their own account from the UI (shows "(You)" instead of action buttons).

---

## 14. 🗂️ PPT Slide Suggestions

| Slide # | Title | Key Points |
|---|---|---|
| 1 | Title Slide | Alumni Information System — Mini Project |
| 2 | Problem Statement | Need for alumni-student networking platform |
| 3 | Objectives | 5-6 bullet goals |
| 4 | Tech Stack | Table of all technologies with logos |
| 5 | System Architecture | The layered diagram (Client → Server → DB) |
| 6 | Database Design | ER diagram / table list with relationships |
| 7 | Security Model | Auth flow diagram, RBAC table |
| 8 | API Endpoints | Table of all 22 endpoints |
| 9 | Module: Auth | Register & Login flow |
| 10 | Module: Alumni Directory | Search, profiles, avatars |
| 11 | Module: Events | CRUD, admin-only creation |
| 12 | Module: Jobs Board | Posting, ownership, Apply link |
| 13 | Module: Messaging | Two-panel chat, inbox, read receipts |
| 14 | Module: Admin Panel | Dashboard stats, user management |
| 15 | Frontend Pages | Screenshot list of all 9 pages |
| 16 | Key Design Decisions | 5 highlights |
| 17 | Setup & Deployment | Step-by-step |
| 18 | Future Enhancements | File uploads, real-time chat (Socket.io), notifications |
| 19 | Conclusion | Summary + learning outcomes |
| 20 | Q & A | Thank you slide |
