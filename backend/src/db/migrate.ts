import { readFileSync } from "fs";
import { join } from "path";
import { pool } from "../config/db";

async function migrate() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  await pool.query(sql);
  console.log("Migration completed successfully.");
  await pool.end();
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
