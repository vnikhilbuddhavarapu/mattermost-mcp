# Mattermost MCP Server

A Model Context Protocol (MCP) server for interacting with Mattermost workspaces. This server provides tools for managing channels, messages, threads, reactions, and user profiles through Mattermost's REST API.

Built on [Cloudflare Workers](https://developers.cloudflare.com/workers/) using the [Agents SDK](https://developers.cloudflare.com/agents/).

**Important:** This is an MCP server without OAuth authentication, designed for trusted environments where the server runs with pre-configured API credentials.

## Features

### Tools (9 Total)

**Read Operations (6 tools):**
- `list_mattermost_channels` - List all channels in the team
- `get_mattermost_channel_history` - Get message history from a channel
- `get_mattermost_thread_replies` - Get all replies in a thread
- `get_mattermost_users` - List users in the workspace
- `get_mattermost_user_profile` - Get detailed profile for a specific user

**Write Operations (3 tools):**
- `post_mattermost_message` - Post a new message to a channel
- `reply_to_mattermost_thread` - Reply to an existing thread
- `add_mattermost_reaction` - Add emoji reactions to posts
- `create_mattermost_direct_channel` - Create a direct message channel with a user

### Prompts (2 Total)
- `mattermost_guide` - Comprehensive guide for using Mattermost effectively
- `message_template` - Helpful templates for crafting effective Mattermost messages

### Resources (2 Total)
- `mattermost://channels` - List of all channels in the team
- `mattermost://users` - List of all users in the workspace

## Architecture

This MCP server is built using:
- **Cloudflare Workers**: Serverless compute
- **Agents SDK**: Framework for building AI agents and [MCP Servers](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- **Durable Objects**: For persistent MCP session state
- **Mattermost REST API v4**: For workspace integration

## Prerequisites

- Node.js 18+
- A Mattermost instance (self-hosted or cloud)
- Personal Access Token from Mattermost (Profile → Security → Personal Access Tokens)
- Team ID from your Mattermost workspace

## Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/vnikhilbuddhavarapu/mattermost-mcp.git
cd mattermost-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your Mattermost credentials:
```
MATTERMOST_URL=https://mattermost.your-domain.com
MATTERMOST_TOKEN=your-personal-access-token
MATTERMOST_TEAM_ID=your-team-id
```

**Finding your Team ID:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://mattermost.your-domain.com/api/v4/teams | jq '.[].id'
```

4. Run locally:
```bash
npm run dev
```

### Deploy to Cloudflare Workers

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/vnikhilbuddhavarapu/mattermost-mcp)

1. Click the deploy button above or run:
```bash
npm run deploy
```

2. Set your secrets:
```bash
npx wrangler secret put MATTERMOST_URL
npx wrangler secret put MATTERMOST_TOKEN
npx wrangler secret put MATTERMOST_TEAM_ID
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MATTERMOST_URL` | Yes | Your Mattermost instance URL (e.g., `https://mattermost.example.com`) |
| `MATTERMOST_TOKEN` | Yes | Personal Access Token from Mattermost |
| `MATTERMOST_TEAM_ID` | Yes | Team ID (get via API, not team name) |

## Usage with MCP Clients

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mattermost": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mattermost-mcp.your-account.workers.dev/mcp"],
      "env": {
        "MATTERMOST_URL": "https://mattermost.your-domain.com",
        "MATTERMOST_TOKEN": "your-token-here",
        "MATTERMOST_TEAM_ID": "your-team-id"
      }
    }
  }
}
```

### Other MCP Clients

Connect to the MCP endpoint:
```
https://mattermost-mcp.your-account.workers.dev/mcp
```

## Project Structure

```
src/
├── index.ts                 # Main MCP server setup and Durable Object
├── mattermost-client.ts     # REST API client for Mattermost
├── shared/
│   └── utils.ts            # Logging utilities and request ID generation
├── tools/                   # MCP tool implementations
│   ├── list-channels.ts
│   ├── get-channel-history.ts
│   ├── post-message.ts
│   ├── reply-to-thread.ts
│   ├── get-thread-replies.ts
│   ├── add-reaction.ts
│   ├── get-users.ts
│   ├── get-user-profile.ts
│   ├── create-direct-channel.ts
│   └── index.ts            # Tool exports
├── prompts/                # MCP prompt templates
│   ├── mattermost-guide.ts
│   ├── message-template.ts
│   └── index.ts            # Prompt exports
└── resources/              # MCP resources
    ├── channels-list.ts
    ├── users-list.ts
    └── index.ts            # Resource exports

wrangler.jsonc              # Cloudflare Workers configuration
worker-configuration.d.ts  # TypeScript types for bindings
```

## API Reference

### Mattermost REST API v4

This server uses the [Mattermost REST API v4](https://api.mattermost.com/). Key endpoints used:

**Get Channels:**
```
GET /api/v4/teams/{team_id}/channels
```

**Get Posts:**
```
GET /api/v4/channels/{channel_id}/posts
```

**Create Post:**
```
POST /api/v4/posts
{
  "channel_id": "...",
  "message": "...",
  "root_id": "..."  // optional, for threads
}
```

**Add Reaction:**
```
POST /api/v4/reactions
{
  "post_id": "...",
  "emoji_name": "..."
}
```

## Documentation

- [Cloudflare Agents SDK - Remote MCP Server Guide](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare MCP Server Docs](https://developers.cloudflare.com/agents/mcp/)
- [Mattermost REST API Docs](https://api.mattermost.com/)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)

## License

MIT

## Connect to Cloudflare AI Playground

You can connect to your MCP server from the Cloudflare AI Playground, which is a remote MCP client:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`mattermost-mcp.<your-account>.workers.dev/mcp`)
3. You can now use your MCP tools directly from the playground!

## Connect Claude Desktop to your MCP server

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote).

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "mattermost": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mattermost-mcp.your-account.workers.dev/mcp"
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available.
