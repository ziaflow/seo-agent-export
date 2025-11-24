
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const azureCloudTool = createTool({
  id: "azure-cloud",
  description: "Manage Azure Cloud resources and resource groups",
  inputSchema: z.object({
    action: z.enum(["list_resource_groups", "get_resource_status", "list_subscriptions"]),
    subscriptionId: z.string().optional(),
    resourceGroupName: z.string().optional(),
  }),
  outputSchema: z.object({
    data: z.any(),
    status: z.string(),
  }),
  execute: async ({ context }) => {
    const resourceGroups = [
      { name: "rg-marketing-prod", location: "eastus" },
      { name: "rg-engineering-dev", location: "westus2" },
    ];

    if (context.action === "list_resource_groups") {
      return {
        data: resourceGroups,
        status: "success"
      };
    }

    return {
      data: { message: "Simulated response" },
      status: "success"
    };
  },
});
