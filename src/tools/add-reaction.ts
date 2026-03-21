import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerAddReactionTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "add_mattermost_reaction",
    {
      postId: z.string().describe("The ID of the post to react to"),
      emojiName: z
        .string()
        .describe("The emoji name (without colons, e.g., 'thumbsup', 'heart')"),
    },
    async ({ postId, emojiName }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: add_mattermost_reaction", {
        postId,
        emojiName,
      });

      try {
        const reaction = await mattermostClient.addReaction(postId, emojiName);

        toolLogger.info("Successfully added reaction", {
          emoji: reaction.emoji_name,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Reaction added successfully!\n\nEmoji: :${reaction.emoji_name}:\nPost ID: ${reaction.post_id}`,
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error adding reaction", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error adding reaction: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
