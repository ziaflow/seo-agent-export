
import "dotenv/config";
import { managerAgent } from "../src/mastra/agents/managerAgent";

async function main() {
  try {
    console.log("Starting Manager Agent Delegation Test...");
    const result = await managerAgent.generate("I noticed a drop in traffic on the pricing page. Can you analyze it and suggest improvements?");
    console.log("Manager Response:");
    console.log(result.text);
  } catch (error) {
    console.error("Error running manager agent:", error);
    if (error instanceof Error) {
        console.error("Message:", error.message);
        // @ts-ignore
        if (error.cause) console.error("Cause:", error.cause);
    }
  }
}

main();
