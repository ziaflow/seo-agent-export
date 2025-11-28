import "dotenv/config";
import { seoAgent } from "../src/mastra/agents/seoAgent";
import * as fs from 'fs';

async function main() {
  try {
    console.log("Starting SEO Agent test...");
    const result = await seoAgent.generate("Analyze the SEO of https://ziaflow.com");
    console.log("Agent Response received.");
    console.log("Response length:", result.text.length);
    console.log(result.text);
    fs.writeFileSync('agent-output.txt', result.text);
    console.log("Output written to agent-output.txt");
  } catch (error) {
    console.error("Error running agent:", error);
    if (error instanceof Error) {
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        // @ts-ignore
        if (error.cause) console.error("Cause:", error.cause);
    }
  }
}

main();
