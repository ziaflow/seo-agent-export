
import "dotenv/config";
import { seoAnalysisTool } from "../src/mastra/tools/seoAnalysisTool";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Please provide a URL");
    process.exit(1);
  }

  console.log(`Analyzing ${url}...`);
  try {
      // @ts-ignore
    const result = await seoAnalysisTool.execute({
      context: {
        websiteUrl: url,
        analysisType: "all",
      },
      mastra: {
        // @ts-ignore
        getLogger: () => console,
      },
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
      console.error("Error analyzing URL:", error);
  }
}

main();
