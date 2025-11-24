
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const playwrightTool = createTool({
  id: "playwright-browser",
  description: "Browser automation using Playwright for screenshots and scraping",
  inputSchema: z.object({
    url: z.string().url(),
    action: z.enum(["screenshot", "scrape_text", "get_html"]),
    selector: z.string().optional(),
  }),
  outputSchema: z.object({
    content: z.string().optional(),
    screenshotPath: z.string().optional(),
    status: z.string(),
  }),
  execute: async ({ context }) => {
    // Mock implementation - in production would require 'playwright' package
    console.log(`[Playwright] Visiting ${context.url} to perform ${context.action}`);

    if (context.action === "scrape_text") {
      return {
        content: "Simulated text content from " + context.url,
        status: "success"
      };
    }

    if (context.action === "screenshot") {
      return {
        screenshotPath: "/tmp/screenshot-mock.png",
        status: "success"
      };
    }

    return {
      content: "<html><body>Mock HTML</body></html>",
      status: "success"
    };
  },
});
