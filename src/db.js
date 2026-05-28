import { getSql } from "./sql-driver.js";
import { getSqlConfig } from "./config.js";

let pool;

export async function getPool() {
  if (pool) return pool;
  const sql = await getSql();
  pool = await sql.connect(getSqlConfig());
  return pool;
}

export async function closePool() {
  if (!pool) return;
  await pool.close();
  pool = undefined;
}
