import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const microsoftLearnTool = createTool({
  id: "microsoft-learn",
  description: "Search and retrieve documentation from Microsoft Learn",
  inputSchema: z.object({
    query: z.string(),
    product: z.enum(["azure", "dotnet", "visual-studio", "windows", "all"]).optional()
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string()
    })),
    status: z.string()
  }),
  execute: async ({ context }) => {
    return {
      results: [
        {
          title: `Introduction to ${context.query} on Microsoft Learn`,
          url: "https://learn.microsoft.com/en-us/docs",
          snippet: "Learn how to build and deploy applications..."
        },
        {
          title: "Quickstart Guide",
          url: "https://learn.microsoft.com/en-us/training",
          snippet: "Step-by-step guide to getting started..."
        }
      ],
      status: "success"
    };
  }
});

export { microsoftLearnTool };
//# sourceMappingURL=b1bb2ec7-c268-4f6d-a8f0-5ec5e395a6e5.mjs.map
