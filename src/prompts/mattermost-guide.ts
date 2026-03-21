import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMattermostGuidePrompt(server: McpServer) {
  server.registerPrompt(
    "mattermost_guide",
    {
      description: "A comprehensive guide for using Mattermost effectively",
    },
    () => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Welcome to the Mattermost Guide!

## Available Tools

### Channels
- **list_mattermost_channels**: View all channels in your team
- **get_mattermost_channel_history**: Read messages from a specific channel

### Messages
- **post_mattermost_message**: Send a message to any channel
- **reply_to_mattermost_thread**: Reply to a thread/conversation
- **get_mattermost_thread_replies**: View all replies in a thread

### Reactions
- **add_mattermost_reaction**: Add emoji reactions to messages

### Users
- **get_mattermost_users**: List all users in the workspace
- **get_mattermost_user_profile**: View detailed user information
- **create_mattermost_direct_channel**: Start a direct message with someone

## Tips
1. Use channel IDs (not names) when posting messages
2. Thread replies help keep conversations organized
3. Use the user list to find IDs for direct messages

How can I help you with Mattermost today?`,
            },
          },
        ],
      };
    },
  );
}
