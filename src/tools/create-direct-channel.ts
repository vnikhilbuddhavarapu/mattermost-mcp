import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerCreateDirectChannelTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "create_mattermost_direct_channel",
    {
      userId: z
        .string()
        .describe("The ID of the user to create a direct channel with"),
    },
    async ({ userId }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: create_mattermost_direct_channel", {
        userId,
      });

      try {
        const channel =
          await mattermostClient.createDirectMessageChannel(userId);

        toolLogger.info("Successfully created direct channel", {
          channelId: channel.id,
          channelName: channel.name,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Direct channel created successfully!\n\nChannel ID: ${channel.id}\nChannel Name: ${channel.display_name}\nType: Direct Message`,
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error creating direct channel", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating direct channel: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
