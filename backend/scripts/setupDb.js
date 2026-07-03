require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('  Setting up Alumni Information System database (MySQL)...\n');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '3092',
    multipleStatements: true,
  });

  try {
    const dbName = process.env.DB_NAME || 'alumni_db';
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await conn.query(`USE \`${dbName}\``);

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await conn.query(sql);

    console.log(' All tables created successfully.');
    console.log(' Default admin seeded: admin@alumni.com / Admin@123');
  } catch (err) {
    console.error(' Database setup failed:', err.message);
  } finally {
    await conn.end();
    console.log('\n Database connection closed.');
  }
}

setupDatabase();
