
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const azureFoundryTool = createTool({
  id: "azure-foundry",
  description: "Interact with Azure AI Foundry projects and deployments",
  inputSchema: z.object({
    action: z.enum(["list_projects", "get_deployment", "list_models"]),
    resourceGroup: z.string().optional(),
    projectName: z.string().optional(),
  }),
  outputSchema: z.object({
    data: z.any(),
    status: z.string(),
  }),
  execute: async ({ context }) => {
    // Mock implementation simulating Azure AI Foundry interactions
    const projects = [
      { name: "foundry-prod", region: "eastus2", status: "Active" },
      { name: "foundry-dev", region: "westus", status: "Active" },
    ];

    const models = [
      { name: "gpt-4", version: "0613", deployment: "foundry-prod-gpt4" },
      { name: "gpt-35-turbo", version: "0613", deployment: "foundry-dev-gpt35" },
    ];

    if (context.action === "list_projects") {
      return {
        data: projects,
        status: "success"
      };
    }

    if (context.action === "list_models") {
      return {
        data: models,
        status: "success"
      };
    }

    return {
      data: { message: "Action not simulated in mock" },
      status: "unknown"
    };
  },
});
