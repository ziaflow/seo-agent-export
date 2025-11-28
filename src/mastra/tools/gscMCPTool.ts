
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const gscMCPTool = createTool({
  id: "gsc-mcp",
  description: "Access Google Search Console (GSC) data. Check performance, URL indexing, and sitemaps.",
  inputSchema: z.object({
    toolName: z.string().describe("The name of the tool to call (e.g., 'performance_report', 'inspect_url')"),
    arguments: z.string().describe("JSON string of arguments for the tool"),
  }),
  outputSchema: z.object({
    result: z.any(),
  }),
  execute: async ({ context, mastra }) => {
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "github:AminForou/mcp-gsc"], // Attempting to run from GitHub
      env: {
        ...process.env,
        PATH: process.env.PATH || "",
      },
    });

    const client = new Client(
      {
        name: "mastra-gsc-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    try {
      await client.connect(transport);
      
      const args = JSON.parse(context.arguments);
      const result = await client.callTool({
        name: context.toolName,
        arguments: args,
      });

      return {
        result: result,
      };
    } catch (error) {
      throw new Error(`GSC MCP Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await client.close();
    }
  },
});
