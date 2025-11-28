
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const clarityMCPTool = createTool({
  id: "clarity-mcp",
  description: "Query Microsoft Clarity data using natural language. Ask for heatmaps, session recordings, or user behavior metrics.",
  inputSchema: z.object({
    query: z.string().describe("Natural language query for Clarity data (e.g., 'Show me heatmaps for the checkout page', 'Find sessions with dead clicks')"),
  }),
  outputSchema: z.object({
    result: z.any(),
  }),
  execute: async ({ context, mastra }) => {
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "@microsoft/clarity-mcp-server"],
      env: {
        CLARITY_API_TOKEN: process.env.MICROSOFT_CLARITY_API_KEY || "",
        PATH: process.env.PATH || "", // Ensure PATH is passed for npx
      },
    });

    const client = new Client(
      {
        name: "mastra-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    try {
      await client.connect(transport);

      // List tools to find the correct one (assuming 'query' based on inspection)
      // In a production tool we might cache this or hardcode 'query' if stable.
      // For now, we assume the tool is named 'query' or similar.
      // Based on typical MCP patterns for this server, it exposes a 'query' tool.
      
      const result = await client.callTool({
        name: "query-analytics-dashboard",
        arguments: {
          query: context.query,
        },
      });

      return {
        result: result,
      };
    } catch (error) {
      throw new Error(`Clarity MCP Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await client.close();
    }
  },
});
