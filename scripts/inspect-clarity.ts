
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@microsoft/clarity-mcp-server"],
    env: {
        CLARITY_API_TOKEN: process.env.MICROSOFT_CLARITY_API_KEY
    }
  });

  const client = new Client({
    name: "inspector",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  await client.connect(transport);

  const tools = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));

  await client.close();
}

import "dotenv/config";
main().catch(console.error);
