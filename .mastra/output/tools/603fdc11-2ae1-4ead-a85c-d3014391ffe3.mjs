import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const googleAnalyticsTool = createTool({
  id: "google-analytics-4",
  description: "Run reports and retrieve metrics from Google Analytics 4",
  inputSchema: z.object({
    propertyId: z.string().optional(),
    dateRange: z.enum(["last_7_days", "last_28_days", "last_30_days", "yesterday"]),
    metrics: z.array(z.string()),
    dimensions: z.array(z.string()).optional()
  }),
  outputSchema: z.object({
    report: z.any(),
    status: z.string()
  }),
  execute: async ({ context }) => {
    return {
      report: {
        rows: [
          { dimensionValues: [{ value: "Direct" }], metricValues: [{ value: "500" }] },
          { dimensionValues: [{ value: "Organic Search" }], metricValues: [{ value: "300" }] }
        ],
        totals: { sessions: 800 }
      },
      status: "success"
    };
  }
});

export { googleAnalyticsTool };
//# sourceMappingURL=603fdc11-2ae1-4ead-a85c-d3014391ffe3.mjs.map
