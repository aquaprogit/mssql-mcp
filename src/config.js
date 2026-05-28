import dotenv from "dotenv";
import { platform } from "node:os";

dotenv.config();

const DEFAULT_ODBC_DRIVER =
  process.env.DB_ODBC_DRIVER?.trim() || "ODBC Driver 17 for SQL Server";

function isLocalDb(target) {
  return typeof target === "string" && /\(localdb\)/i.test(target);
}

function usesWindowsAuth() {
  return !process.env.DB_USER?.trim();
}

function shouldUseNativeDriver(target) {
  if (process.env.DB_DRIVER === "msnodesqlv8") return true;
  if (process.env.DB_DRIVER === "tedious") return false;
  return platform() === "win32" && isLocalDb(target);
}

function normalizeAdoNetForOdbc(connectionString) {
  return connectionString
    .replace(/Trusted_Connection\s*=\s*True/gi, "Trusted_Connection=Yes")
    .replace(/TrustServerCertificate\s*=\s*True/gi, "TrustServerCertificate=Yes")
    .replace(/Encrypt\s*=\s*False/gi, "Encrypt=No");
}

export function toOdbcConnectionString(connectionString) {
  const trimmed = normalizeAdoNetForOdbc(connectionString.trim());
  if (/Driver\s*=/i.test(trimmed)) {
    return trimmed;
  }

  const separator = trimmed.endsWith(";") ? "" : ";";
  return `Driver={${DEFAULT_ODBC_DRIVER}};${trimmed}${separator}`;
}

function asNativePoolConfig(connectionString) {
  return {
    connectionString: toOdbcConnectionString(connectionString),
    driver: "msnodesqlv8",
  };
}

export function getSqlConfig() {
  const connectionString = process.env.DB_CONNECTION_STRING?.trim();
  if (connectionString) {
    if (shouldUseNativeDriver(connectionString)) {
      return asNativePoolConfig(connectionString);
    }
    return { connectionString };
  }

  const server = process.env.DB_SERVER?.trim();
  const database = process.env.DB_DATABASE?.trim();

  if (!server || !database) {
    throw new Error(
      "Set DB_CONNECTION_STRING or both DB_SERVER and DB_DATABASE (see .env.example)"
    );
  }

  if (shouldUseNativeDriver(server)) {
    const parts = [
      `Server=${server}`,
      `Database=${database}`,
      usesWindowsAuth()
        ? "Trusted_Connection=True"
        : `UID=${process.env.DB_USER};PWD=${process.env.DB_PASSWORD ?? ""}`,
      "TrustServerCertificate=True",
    ];
    return asNativePoolConfig(parts.join(";"));
  }

  const options = {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  };

  if (usesWindowsAuth()) {
    options.trustedConnection = true;
  }

  const config = {
    server,
    database,
    options,
  };

  if (!usesWindowsAuth()) {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD ?? "";
    delete options.trustedConnection;
  }

  if (process.env.DB_PORT) {
    config.port = parseInt(process.env.DB_PORT, 10);
  }

  return config;
}
