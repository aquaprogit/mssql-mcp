import { getPool } from "../db.js";
import { assertReadOnlySql } from "../lib/read-only-sql.js";

const logQueries = process.env.MCP_LOG_QUERIES === "true";

export async function runQuery({ sql }) {
  const safeSql = assertReadOnlySql(sql);

  if (logQueries) {
    console.error("[mssql-mcp] query:", safeSql);
  }

  const pool = await getPool();
  const result = await pool.request().query(safeSql);

  return {
    recordset: result.recordset,
    rowsAffected: result.rowsAffected,
  };
}
