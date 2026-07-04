require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function setupDatabase() {
  console.log("🚀 Starting TiDB database setup...");
  console.log(`   Host     : ${process.env.DB_HOST}`);
  console.log(`   Port     : ${process.env.DB_PORT}`);
  console.log(`   Database : ${process.env.DB_DATABASE}`);
  console.log(`   User     : ${process.env.DB_USERNAME}`);

  let conn;
  try {
    // ✅ Connect directly to the target database (TiDB Cloud doesn't allow
    //    CREATE DATABASE / USE via client on shared-tier clusters)
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 4000,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,   // <-- connect directly to DB
      // Do NOT use multipleStatements:true — we split manually below
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: false,
      },
      connectTimeout: 30000,
    });

    console.log("✅ Connected to TiDB successfully.");

    // Read schema file
    const sqlFile = path.join(__dirname, "schema.sql");
    const rawSql = fs.readFileSync(sqlFile, "utf8");

    // Split into individual statements (handles multi-line statements)
    const statements = rawSql
      .split(";")
      .map((s) => s.replace(/--.*$/gm, "").trim())  // strip comments
      .filter((s) => s.length > 0);                 // remove empty lines

    console.log(`📄 Found ${statements.length} SQL statements to execute.`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await conn.query(stmt);
        console.log(`   ✔ [${i + 1}/${statements.length}] OK`);
      } catch (stmtErr) {
        // Log the error but continue — e.g. index already exists is non-fatal
        console.warn(`   ⚠ [${i + 1}/${statements.length}] WARN: ${stmtErr.message}`);
        console.warn(`     Statement: ${stmt.substring(0, 80)}...`);
      }
    }

    console.log("🎉 Database setup completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal error during DB setup:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

setupDatabase();
