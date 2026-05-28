import { closePool, getPool } from "../src/db.js";

const pool = await getPool();
const result = await pool.request().query("SELECT @@VERSION AS version, DB_NAME() AS database_name");

console.log(JSON.stringify(result.recordset, null, 2));
await closePool();
