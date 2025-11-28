import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const storybookTool = createTool({
  id: "storybook-inspector",
  description: "Inspect Storybook stories and component documentation",
  inputSchema: z.object({
    storybookUrl: z.string(),
    action: z.enum(["list_stories", "get_story_args", "check_a11y"]),
    componentName: z.string().optional()
  }),
  outputSchema: z.object({
    stories: z.array(z.string()).optional(),
    args: z.any().optional(),
    status: z.string()
  }),
  execute: async ({ context }) => {
    if (context.action === "list_stories") {
      return {
        stories: ["Button", "Header", "Footer", "Card"],
        status: "success"
      };
    }
    return {
      status: "success",
      args: { primary: true, label: "Click Me" }
    };
  }
});

export { storybookTool };
//# sourceMappingURL=0da0bb56-3657-4e50-ae19-a974ac5c7b8d.mjs.map
