--  Alumni Information System – MySQL Database Schema

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS alumni_profiles;
DROP TABLE IF EXISTS users;

-- ── 1. USERS ─────────────────────────────────────────────────
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  password   VARCHAR(255)        NOT NULL,
  role       ENUM('admin','student','alumni') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. ALUMNI PROFILES ───────────────────────────────────────
CREATE TABLE alumni_profiles (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT,
  graduation_year INT,
  department      VARCHAR(100),
  company         VARCHAR(150),
  designation     VARCHAR(150),
  location        VARCHAR(150),
  linkedin        VARCHAR(255),
  bio             TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 3. EVENTS ────────────────────────────────────────────────
CREATE TABLE events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  event_date  DATE         NOT NULL,
  location    VARCHAR(200),
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── 4. JOBS ──────────────────────────────────────────────────
CREATE TABLE jobs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  company     VARCHAR(150) NOT NULL,
  role        VARCHAR(150) NOT NULL,
  description TEXT,
  type        ENUM('full-time','part-time','internship','contract') DEFAULT 'full-time',
  location    VARCHAR(150),
  deadline    DATE,
  job_link    VARCHAR(500),
  posted_by   INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── 5. MESSAGES ──────────────────────────────────────────────
CREATE TABLE messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT,
  receiver_id INT,
  message     TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_users_email           ON users(email);
CREATE INDEX idx_users_role            ON users(role);
CREATE INDEX idx_alumni_profiles_uid   ON alumni_profiles(user_id);
CREATE INDEX idx_alumni_grad_year      ON alumni_profiles(graduation_year);
CREATE INDEX idx_alumni_department     ON alumni_profiles(department);
CREATE INDEX idx_messages_sender       ON messages(sender_id);
CREATE INDEX idx_messages_receiver     ON messages(receiver_id);
CREATE INDEX idx_jobs_deadline         ON jobs(deadline);
CREATE INDEX idx_events_date           ON events(event_date);

-- ── SEED: Default Admin Account ───────────────────────────────
-- Password: Admin@123  (bcrypt hash)
INSERT INTO users (name, email, password, role) VALUES
  ('System Admin', 'admin@alumni.com',
   '$2a$12$kJ9lTxrSxrQustMELlWHHOUdodBdHMbu6XSZQRfND117iUzbFxi6S', 'admin');
