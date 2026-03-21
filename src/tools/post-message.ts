import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerPostMessageTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "post_mattermost_message",
    {
      channelId: z.string().describe("The ID of the channel to post to"),
      message: z.string().describe("The message content to post"),
    },
    async ({ channelId, message }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: post_mattermost_message", {
        channelId,
        messageLength: message.length,
      });

      try {
        const post = await mattermostClient.createPost(channelId, message);

        toolLogger.info("Successfully posted message", {
          postId: post.id,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Message posted successfully!\n\nPost ID: ${post.id}\nChannel ID: ${post.channel_id}\nCreated: ${new Date(post.create_at).toISOString()}`,
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error posting message", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error posting message: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
