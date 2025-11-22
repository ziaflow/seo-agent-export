import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://jerem-md7wzrrg-eastus2.services.ai.azure.com/openai/v1/",
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is the capital of France?" },
    ],
    temperature: 0.7,
  });

  console.log(completion.choices[0].message.content);
}

main().catch((error) => {
  console.error("Azure Foundry request failed", error);
  process.exit(1);
});
