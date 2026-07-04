// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT) || 3306,
//   database: process.env.DB_NAME || 'alumni_db',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '3092',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // TiDB Cloud requires SSL — rejectUnauthorized: false works safely
  // because TiDB Cloud enforces TLS on their end
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ TiDB (MySQL) connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL/TiDB connection error:", err.message);
    // Do NOT exit — let Render keep the server alive; DB may reconnect
  }
})();

module.exports = pool;
