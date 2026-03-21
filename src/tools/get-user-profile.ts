import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerGetUserProfileTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "get_mattermost_user_profile",
    {
      userId: z.string().describe("The ID of the user to get profile for"),
    },
    async ({ userId }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: get_mattermost_user_profile", {
        userId,
      });

      try {
        const user = await mattermostClient.getUser(userId);

        toolLogger.info("Successfully retrieved user profile", {
          username: user.username,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(user, null, 2),
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error getting user profile", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting user profile: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
