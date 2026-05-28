import { getPool } from "../db.js";

const SCHEMA_SQL = `
  SELECT
    TABLE_SCHEMA,
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
  FROM INFORMATION_SCHEMA.COLUMNS
  ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION
`;

export async function getSchema() {
  const pool = await getPool();
  const result = await pool.request().query(SCHEMA_SQL);
  return result.recordset;
}
