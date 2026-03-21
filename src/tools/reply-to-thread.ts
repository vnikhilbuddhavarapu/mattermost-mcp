import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerReplyToThreadTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "reply_to_mattermost_thread",
    {
      channelId: z.string().describe("The ID of the channel"),
      rootPostId: z
        .string()
        .describe("The ID of the root post (thread parent)"),
      message: z.string().describe("The reply message content"),
    },
    async ({ channelId, rootPostId, message }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: reply_to_mattermost_thread", {
        channelId,
        rootPostId,
        messageLength: message.length,
      });

      try {
        const post = await mattermostClient.createPost(
          channelId,
          message,
          rootPostId,
        );

        toolLogger.info("Successfully replied to thread", {
          postId: post.id,
          rootId: post.root_id,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Reply posted successfully!\\n\\nPost ID: ${post.id}\\nThread Root ID: ${post.root_id}\\nChannel ID: ${post.channel_id}`,
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error replying to thread", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error replying to thread: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
