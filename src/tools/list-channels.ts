import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";
import { generateRequestId, MCPLogger } from "../shared/utils";

export function registerListChannelsTool(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.tool(
    "list_mattermost_channels",
    {
      limit: z
        .number()
        .min(1)
        .max(200)
        .optional()
        .describe("Maximum number of channels to return (default: 100)"),
      page: z
        .number()
        .min(0)
        .optional()
        .describe("Page number for pagination (default: 0)"),
    },
    async ({ limit, page }) => {
      const toolRequestId = generateRequestId();
      const toolLogger = new MCPLogger(toolRequestId);

      toolLogger.info("Tool invoked: list_mattermost_channels", {
        limit: limit || 100,
        page: page || 0,
      });

      try {
        const channels = await mattermostClient.getChannels(
          limit || 100,
          page || 0,
        );

        toolLogger.info("Successfully listed channels", {
          count: channels.channels.length,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(channels, null, 2),
            },
          ],
        };
      } catch (error) {
        toolLogger.error("Error listing channels", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing channels: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
