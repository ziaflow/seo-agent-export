
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const ga4MCPTool = createTool({
  id: "ga4-mcp",
  description: "Access Google Analytics 4 (GA4) data. Run reports, check metadata, and analyze metrics.",
  inputSchema: z.object({
    toolName: z.string().describe("The name of the tool to call (e.g., 'run_report', 'list_properties')"),
    arguments: z.string().describe("JSON string of arguments for the tool"),
  }),
  outputSchema: z.object({
    result: z.any(),
  }),
  execute: async ({ context, mastra }) => {
    // Note: This requires credentials to be set in the environment or passed to the server.
    // Usually GOOGLE_APPLICATION_CREDENTIALS pointing to a JSON file.
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "github:googleanalytics/google-analytics-mcp"], // Attempting to run from GitHub
      env: {
        ...process.env,
        PATH: process.env.PATH || "",
      },
    });

    const client = new Client(
      {
        name: "mastra-ga4-client",
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
      throw new Error(`GA4 MCP Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await client.close();
    }
  },
});
