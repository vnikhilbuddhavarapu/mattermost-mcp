import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerGetChannelHistoryTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "get_mattermost_channel_history",
    {
      channelId: z
        .string()
        .describe("The ID of the channel to get history from"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of messages to return (default: 30)"),
      page: z
        .number()
        .min(0)
        .optional()
        .describe("Page number for pagination (default: 0)"),
    },
    async ({
      channelId,
      limit,
      page,
    }: {
      channelId: string;
      limit?: number;
      page?: number;
    }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: get_mattermost_channel_history", {
        channelId,
        limit: limit || 30,
        page: page || 0,
      });

      try {
        const posts = await mattermostClient.getPostsForChannel(
          channelId,
          limit || 30,
          page || 0,
        );

        toolLogger.info("Successfully retrieved channel history", {
          postCount: posts.order.length,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(posts, null, 2),
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error getting channel history", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting channel history: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
