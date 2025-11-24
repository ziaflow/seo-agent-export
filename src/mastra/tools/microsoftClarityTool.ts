
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const microsoftClarityTool = createTool({
  id: "microsoft-clarity",
  description: "Retrieve user session recordings and heatmaps from Microsoft Clarity",
  inputSchema: z.object({
    projectId: z.string().optional(),
    action: z.enum(["get_recordings", "get_heatmap", "get_metrics"]),
    url: z.string().optional(),
  }),
  outputSchema: z.object({
    data: z.any(),
    status: z.string(),
  }),
  execute: async ({ context }) => {
    if (context.action === "get_heatmap") {
      return {
        data: {
          clicks: 150,
          scrollDepth: 75,
          hotspots: [{ x: 100, y: 200, intensity: 0.8 }]
        },
        status: "success"
      };
    }

    return {
      data: {
        sessions: 120,
        rageClicks: 5,
        deadClicks: 2
      },
      status: "success"
    };
  },
});
