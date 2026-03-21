import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerGetThreadRepliesTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "get_mattermost_thread_replies",
    {
      postId: z
        .string()
        .describe("The ID of the root post to get thread replies for"),
    },
    async ({ postId }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: get_mattermost_thread_replies", {
        postId,
      });

      try {
        const thread = await mattermostClient.getPostThread(postId);

        toolLogger.info("Successfully retrieved thread replies", {
          replyCount: thread.order.length - 1, // Excluding root post
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(thread, null, 2),
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error getting thread replies", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting thread replies: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
