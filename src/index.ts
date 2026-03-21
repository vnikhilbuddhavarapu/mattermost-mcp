import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { MattermostClient } from "./mattermost-client";
import { generateRequestId, MCPLogger } from "./shared/utils";
import type { ExecutionContext } from "@cloudflare/workers-types";

interface Env {
  MATTERMOST_URL: string;
  MATTERMOST_TOKEN: string;
  MATTERMOST_TEAM_ID: string;
  MCP_OBJECT: DurableObjectNamespace<MattermostMCP>;
}

/**
 * Import all tools
 */
import {
  registerListChannelsTool,
  registerGetChannelHistoryTool,
  registerPostMessageTool,
  registerReplyToThreadTool,
  registerAddReactionTool,
  registerGetThreadRepliesTool,
  registerGetUsersTool,
  registerGetUserProfileTool,
  registerCreateDirectChannelTool,
} from "./tools";

/**
 * Import all prompts
 */
import {
  registerMattermostGuidePrompt,
  registerMessageTemplatePrompt,
} from "./prompts";

/**
 * Import all resources
 */
import { registerChannelsResource, registerUsersResource } from "./resources";

/**
 * MCP Agent for Mattermost integration
 * Provides tools, prompts, and resources for Mattermost integration
 */
export class MattermostMCP extends McpAgent<
  Env,
  Record<string, never>,
  Record<string, never>
> {
  server = new McpServer({
    name: "Mattermost MCP",
    version: "1.0.0",
  });

  async init() {
    const requestId = generateRequestId();
    const logger = new MCPLogger(requestId);

    /**
     * Validate environment configuration
     */
    const mattermostUrl = this.env.MATTERMOST_URL;
    const mattermostToken = this.env.MATTERMOST_TOKEN;
    const mattermostTeamId = this.env.MATTERMOST_TEAM_ID;

    if (!mattermostUrl || !mattermostToken || !mattermostTeamId) {
      logger.error("Missing required environment variables", {
        hasUrl: !!mattermostUrl,
        hasToken: !!mattermostToken,
        hasTeamId: !!mattermostTeamId,
      });
      throw new Error(
        "Missing required environment variables: MATTERMOST_URL, MATTERMOST_TOKEN, and MATTERMOST_TEAM_ID must be set",
      );
    }

    logger.info("Initializing Mattermost MCP", {
      mattermostUrl,
      hasToken: true,
      teamId: mattermostTeamId,
    });

    /**
     * Initialize Mattermost client
     */
    const mattermostClient = new MattermostClient(
      mattermostUrl,
      mattermostToken,
      mattermostTeamId,
      requestId,
    );

    /**
     * Register all 9 tools
     */
    logger.debug("Registering tools...");
    registerListChannelsTool(this.server, mattermostClient);
    registerGetChannelHistoryTool(this.server, mattermostClient);
    registerPostMessageTool(this.server, mattermostClient);
    registerReplyToThreadTool(this.server, mattermostClient);
    registerAddReactionTool(this.server, mattermostClient);
    registerGetThreadRepliesTool(this.server, mattermostClient);
    registerGetUsersTool(this.server, mattermostClient);
    registerGetUserProfileTool(this.server, mattermostClient);
    registerCreateDirectChannelTool(this.server, mattermostClient);

    /**
     * Register all 2 prompts
     */
    logger.debug("Registering prompts...");
    registerMattermostGuidePrompt(this.server);
    registerMessageTemplatePrompt(this.server);

    /**
     * Register all 2 resources
     */
    logger.debug("Registering resources...");
    registerChannelsResource(this.server, mattermostClient);
    registerUsersResource(this.server, mattermostClient);

    logger.info("Mattermost MCP initialization complete", {
      toolsRegistered: 9,
      promptsRegistered: 2,
      resourcesRegistered: 2,
    });
  }
}

/**
 * Main fetch handler
 * Routes MCP requests to the Durable Object
 */
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const requestId = generateRequestId();

    const logger = {
      info: (msg: string, ctx: Record<string, unknown>) =>
        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "INFO",
            requestId,
            message: msg,
            ...ctx,
          }),
        ),
    };

    logger.info("Request received", {
      pathname: url.pathname,
      method: request.method,
    });

    if (url.pathname === "/mcp") {
      return MattermostMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
