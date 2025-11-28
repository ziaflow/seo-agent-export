
import "dotenv/config";
import { clarityMCPTool } from "../src/mastra/tools/clarityMCPTool";

async function main() {
  try {
    console.log("Testing Clarity MCP Tool...");
    const result = await clarityMCPTool.execute({
      context: { query: "Show me heatmaps for the homepage for the last 7 days" },
      mastra: { getLogger: () => console },
    });
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
