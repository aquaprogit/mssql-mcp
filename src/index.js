import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod";

import { runQuery } from "./tools/query.js";
import { getSchema } from "./tools/schema.js";

const serverName = process.env.MCP_SERVER_NAME?.trim() || "mssql-mcp";
const serverVersion = process.env.MCP_SERVER_VERSION?.trim() || "1.0.0";

const server = new McpServer({
  name: serverName,
  version: serverVersion,
});

server.registerTool(
  "query",
  {
    description:
      "Run a read-only SQL query (SELECT or WITH ... SELECT only). Returns rows as JSON.",
    inputSchema: {
      sql: z.string().describe("SQL SELECT statement"),
    },
  },
  async ({ sql }) => {
    const result = await runQuery({ sql });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "schema",
  {
    description:
      "List tables and columns from INFORMATION_SCHEMA (schema, name, type, nullability).",
  },
  async () => {
    const result = await getSchema();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("[mssql-mcp] server error:", error);
  process.exit(1);
});
