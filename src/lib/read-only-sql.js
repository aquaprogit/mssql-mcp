const READ_ONLY_START = /^(with\b|select\b)/i;
const FORBIDDEN =
  /\b(insert|update|delete|merge|drop|alter|create|truncate|exec\b|execute\b)\b/i;

function stripComments(sql) {
  return sql
    .replace(/--[^\n\r]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

export function assertReadOnlySql(sql) {
  if (typeof sql !== "string" || !sql.trim()) {
    throw new Error("SQL query is required");
  }

  const normalized = stripComments(sql).trim();
  const firstStatement = normalized.split(";")[0].trim();

  if (!READ_ONLY_START.test(firstStatement)) {
    throw new Error("Only SELECT queries (or WITH ... SELECT) are allowed");
  }

  if (FORBIDDEN.test(normalized)) {
    throw new Error("Only read-only queries are allowed");
  }

  return normalized;
}
