import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMessageTemplatePrompt(server: McpServer) {
  server.registerPrompt(
    "message_template",
    {
      description:
        "Helpful templates for crafting effective Mattermost messages",
    },
    () => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `## Mattermost Message Templates

### Announcement Template
\`\`\`
@channel 📢 **Announcement**

**What:** [Brief description]
**When:** [Date/Time]
**Who:** [Target audience]
**Action Required:** [What people need to do]

[Additional details]
\`\`\`

### Status Update Template
\`\`\`
**Status Update - [Project Name]**

**Completed:**
- [Item 1]
- [Item 2]

**In Progress:**
- [Item 1]

**Blockers:**
- [Any issues]

**Next Steps:**
- [What's coming up]
\`\`\`

### Question Template
\`\`\`
❓ **Question:** [Your question]

**Context:** [Background info]

**What I've tried:** [Steps already taken]

cc: @relevant-person
\`\`\`

### Meeting Summary Template
\`\`\`
📅 **Meeting Notes - [Meeting Name]**

**Date:** [Date]
**Attendees:** [Names]

**Key Points:**
- [Point 1]
- [Point 2]

**Action Items:**
- [ ] [Task 1] - @[assignee]
- [ ] [Task 2] - @[assignee]

**Next Meeting:** [Date/Time]
\`\`\`

Need help with a specific message? Let me know the context and I'll help you craft it!`,
            },
          },
        ],
      };
    },
  );
}
