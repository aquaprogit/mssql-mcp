import { getSqlConfig } from "./config.js";

let sqlModule;

export async function getSql() {
  if (!sqlModule) {
    const config = getSqlConfig();
    const useNative =
      config.driver === "msnodesqlv8" ||
      /\(localdb\)/i.test(config.connectionString ?? config.server ?? "");

    sqlModule = useNative
      ? (await import("mssql/msnodesqlv8.js")).default
      : (await import("mssql")).default;
  }
  return sqlModule;
}
