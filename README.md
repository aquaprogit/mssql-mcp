# mssql-mcp

Read-only [Model Context Protocol](https://modelcontextprotocol.io/) server for Microsoft SQL Server. Use it from [Cursor](https://cursor.com/), Claude Desktop, or any MCP client to explore schemas and run `SELECT` queries safely.

## Features

- **`query`** — run `SELECT` or `WITH ... SELECT` only (writes and DDL are rejected)
- **`schema`** — list tables and columns from `INFORMATION_SCHEMA`
- **LocalDB on Windows** — auto-switches to `msnodesqlv8` + ODBC when `(localdb)` is detected (the default `tedious` driver cannot reach LocalDB)
- **Flexible configuration** — connection string or discrete `DB_*` environment variables

## Requirements

- Node.js 18+
- A reachable SQL Server instance (local, Docker, Azure SQL, LocalDB, etc.)
- **Windows + LocalDB:** [ODBC Driver 17 or 18 for SQL Server](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server) (same stack as `sqlcmd`)

## Quick start

```bash
git clone https://github.com/YOUR_ORG/mssql-mcp.git
cd mssql-mcp
npm install
cp .env.example .env
# Edit .env with your connection details
npm run test:connection
npm start
```

## Configure Cursor

Add a server entry to your MCP config (see [Cursor MCP docs](https://docs.cursor.com/context/mcp)). Example:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["C:/path/to/mssql-mcp/src/index.js"],
      "env": {
        "DB_CONNECTION_STRING": "Server=localhost;Database=YourDatabase;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
      }
    }
  }
}
```

See [`mcp.example.json`](mcp.example.json) for a full template.

Use a **unique** `MCP_SERVER_NAME` when registering multiple databases (e.g. `mssql-analytics`, `mssql-app`).

After changing code or env vars, restart the MCP server in Cursor Settings.

## Connection options

| Variable | Description |
|----------|-------------|
| `DB_CONNECTION_STRING` | Full ADO.NET-style connection string (preferred for LocalDB) |
| `DB_SERVER` | Host or `(localdb)\InstanceName` |
| `DB_DATABASE` | Database name |
| `DB_USER` / `DB_PASSWORD` | SQL auth; omit both for Windows auth |
| `DB_PORT` | TCP port (default 1433); **do not set** for LocalDB |
| `DB_ENCRYPT` | `true` / `false` (tedious path) |
| `DB_TRUST_CERT` | `true` / `false` (default trusts cert) |
| `DB_DRIVER` | Force `msnodesqlv8` or `tedious` |
| `DB_ODBC_DRIVER` | ODBC driver name (default: `ODBC Driver 17 for SQL Server`) |
| `MCP_SERVER_NAME` | MCP server id shown to clients |
| `MCP_LOG_QUERIES` | Set to `true` to log SQL to stderr |

Copy [`.env.example`](.env.example) to `.env` for local development.

### LocalDB example

```env
DB_CONNECTION_STRING=Server=(localdb)\MSSQLLocalDB;Database=YourDatabase;Trusted_Connection=True;TrustServerCertificate=True;
```

Do not set `DB_PORT` for LocalDB.

## Security

This server is **read-only by design** but not a substitute for database permissions:

- Grant the login **only** `SELECT` (and optionally `VIEW DEFINITION`) on required objects.
- Prefer a dedicated read-only SQL user or Windows account.
- Query validation blocks obvious DML/DDL; treat it as a guardrail, not a security boundary.

## License

MIT — see [LICENSE](LICENSE).
