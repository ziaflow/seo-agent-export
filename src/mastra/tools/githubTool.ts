
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const githubTool = createTool({
  id: "github-integration",
  description: "Interact with GitHub repositories, issues, and pull requests",
  inputSchema: z.object({
    action: z.enum(["get_repo", "list_issues", "get_pr", "search_code"]),
    owner: z.string(),
    repo: z.string(),
    number: z.number().optional(),
  }),
  outputSchema: z.object({
    data: z.any(),
    status: z.string(),
  }),
  execute: async ({ context }) => {
    // Mock GitHub API response
    const repoData = {
      full_name: `${context.owner}/${context.repo}`,
      stars: 120,
      forks: 30,
      open_issues: 5,
    };

    if (context.action === "get_repo") {
      return {
        data: repoData,
        status: "success"
      };
    }

    if (context.action === "list_issues") {
      return {
        data: [
          { number: 1, title: "Fix build", state: "open" },
          { number: 2, title: "Update documentation", state: "closed" }
        ],
        status: "success"
      };
    }

    return {
      data: { message: "Simulated GitHub response" },
      status: "success"
    };
  },
});
