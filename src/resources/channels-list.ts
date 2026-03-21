import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";

export function registerChannelsResource(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.registerResource(
    "mattermost-channels",
    "mattermost://channels",
    {
      description: "List of all Mattermost channels in the team",
      mimeType: "application/json",
    },
    async (uri: URL) => {
      try {
        const channels = await mattermostClient.getChannels();

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(channels, null, 2),
              mimeType: "application/json",
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching channels: ${error instanceof Error ? error.message : String(error)}`,
              mimeType: "text/plain",
            },
          ],
          isError: true,
        };
      }
    },
  );
}
