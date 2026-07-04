require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function setupDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,

    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const dbName = process.env.DB_DATABASE;

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await conn.query(`USE \`${dbName}\``);

    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

    await conn.query(sql);

    console.log("Database setup completed.");
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}

setupDatabase();
