import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerGetUsersTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "get_mattermost_users",
    {
      limit: z
        .number()
        .min(1)
        .max(200)
        .optional()
        .describe("Maximum number of users to return (default: 100)"),
      page: z
        .number()
        .min(0)
        .optional()
        .describe("Page number for pagination (default: 0)"),
    },
    async ({ limit, page }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: get_mattermost_users", {
        limit: limit || 100,
        page: page || 0,
      });

      try {
        const users = await mattermostClient.getUsers(limit || 100, page || 0);

        toolLogger.info("Successfully retrieved users", {
          count: users.users.length,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(users, null, 2),
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error getting users", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting users: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
