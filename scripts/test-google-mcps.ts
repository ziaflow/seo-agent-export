
import "dotenv/config";
import { ga4MCPTool } from "../src/mastra/tools/ga4MCPTool";
import { gscMCPTool } from "../src/mastra/tools/gscMCPTool";
import { gtmMCPTool } from "../src/mastra/tools/gtmMCPTool";

async function main() {
  console.log("Testing Google MCP Tools...");

  const mockContext = {
    machineId: "test-machine",
    suspend: () => {},
    stepId: "test-step",
    runId: "test-run",
    threadId: "test-thread",
    resourceId: "test-resource",
    agentName: "test-agent",
  };

  // Test GA4 Tool
  try {
    console.log("\nTesting GA4 Tool (expecting auth error, but NO schema error)...");
    await ga4MCPTool.execute({
      context: {
        ...mockContext,
        toolName: "list_properties",
        arguments: JSON.stringify({}), 
      },
      mastra: {} as any
    });
  } catch (error: any) {
    console.log("GA4 Result:", error.message);
  }

  // Test GSC Tool
  try {
    console.log("\nTesting GSC Tool (expecting auth error, but NO schema error)...");
    await gscMCPTool.execute({
      context: {
        ...mockContext,
        toolName: "list_sites",
        arguments: JSON.stringify({}),
      },
      mastra: {} as any
    });
  } catch (error: any) {
    console.log("GSC Result:", error.message);
  }

  // Test GTM Tool
  try {
    console.log("\nTesting GTM Tool (expecting auth error, but NO schema error)...");
    await gtmMCPTool.execute({
      context: {
        ...mockContext,
        toolName: "list_accounts",
        arguments: JSON.stringify({}),
      },
      mastra: {} as any
    });
  } catch (error: any) {
    console.log("GTM Result:", error.message);
  }
}

main();
