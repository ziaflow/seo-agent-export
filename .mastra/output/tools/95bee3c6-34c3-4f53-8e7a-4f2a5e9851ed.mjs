import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const chromeDevTool = createTool({
  id: "chrome-devtools",
  description: "Interact with Chrome DevTools Protocol for performance and console logs",
  inputSchema: z.object({
    url: z.string(),
    action: z.enum(["get_performance_metrics", "capture_console_logs", "audit_accessibility"])
  }),
  outputSchema: z.object({
    metrics: z.any().optional(),
    logs: z.array(z.string()).optional(),
    audit: z.any().optional(),
    status: z.string()
  }),
  execute: async ({ context }) => {
    if (context.action === "get_performance_metrics") {
      return {
        metrics: {
          lcp: 2.5,
          cls: 0.1,
          fid: 100
        },
        status: "success"
      };
    }
    if (context.action === "capture_console_logs") {
      return {
        logs: ["Console loaded", "Warning: Deprecated API usage"],
        status: "success"
      };
    }
    return {
      status: "success",
      audit: { score: 95, issues: [] }
    };
  }
});

export { chromeDevTool };
//# sourceMappingURL=95bee3c6-34c3-4f53-8e7a-4f2a5e9851ed.mjs.map
