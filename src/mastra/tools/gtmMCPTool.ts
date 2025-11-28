
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const gtmMCPTool = createTool({
  id: "gtm-mcp",
  description: "Manage Google Tag Manager (GTM). Create tags, list containers, and validate versions.",
  inputSchema: z.object({
    toolName: z.string().describe("The name of the tool to call (e.g., 'list_containers', 'create_tag')"),
    arguments: z.string().describe("JSON string of arguments for the tool"),
  }),
  outputSchema: z.object({
    result: z.any(),
  }),
  execute: async ({ context, mastra }) => {
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "github:neep305/mcp-for-gtm"], // Attempting to run from GitHub (hypothetical, based on user info)
      env: {
        ...process.env,
        PATH: process.env.PATH || "",
      },
    });

    const client = new Client(
      {
        name: "mastra-gtm-client",
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
      throw new Error(`GTM MCP Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await client.close();
    }
  },
});
