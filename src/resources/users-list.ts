import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattermostClient } from "../mattermost-client";

export function registerUsersResource(
  server: McpServer,
  mattermostClient: MattermostClient,
) {
  server.registerResource(
    "mattermost-users",
    "mattermost://users",
    {
      description: "List of all Mattermost users in the workspace",
      mimeType: "application/json",
    },
    async (uri: URL) => {
      try {
        const users = await mattermostClient.getUsers();

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(users, null, 2),
              mimeType: "application/json",
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching users: ${error instanceof Error ? error.message : String(error)}`,
              mimeType: "text/plain",
            },
          ],
          isError: true,
        };
      }
    },
  );
}
