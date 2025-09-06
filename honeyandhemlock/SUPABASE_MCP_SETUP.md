# Supabase MCP Setup Instructions

## Setup Complete! ✅

I've created the Supabase MCP configuration files for your project. Here's how to use them:

## Your Supabase Details
- **Project Reference:** `zknmzaowomihtrtqleon`
- **Access Token:** Already configured in the files
- **Mode:** Read-only (for safety)

## Configuration Files Created

### 1. For Claude Desktop
**File:** `claude_desktop_config.json`

To activate in Claude Desktop:
1. Open Claude Desktop
2. Go to Settings → Developer
3. Click "Edit Config"
4. Copy the contents from `claude_desktop_config.json`
5. Merge it with any existing configuration
6. Save and restart Claude Desktop

**Windows Path:** `%APPDATA%\Claude\claude_desktop_config.json`
(Usually: `C:\Users\Hafsa\AppData\Roaming\Claude\claude_desktop_config.json`)

### 2. For Cursor IDE
**File:** `.cursor/mcp.json`

To activate in Cursor:
1. Open Cursor IDE
2. Open the Command Palette (Ctrl+Shift+P)
3. Search for "MCP" or go to Settings
4. The configuration should be automatically detected
5. Restart Cursor if needed

### 3. For VS Code (if using Copilot)
Create `.vscode/mcp.json` with the same content as `.cursor/mcp.json`

## What This Enables

Once configured, your AI assistant can:
- Query your Supabase database directly
- View table schemas and relationships
- Help write SQL queries
- Access Supabase documentation
- Manage database operations (in read-only mode for safety)

## Testing the Connection

After setup, you can test by asking your AI assistant to:
- "Show me the tables in my Supabase database"
- "What columns are in the scripts table?"
- "Query the scripts table"

## Security Notes

- The configuration uses **read-only mode** to prevent accidental changes
- The access token is scoped to your specific project
- Never share your access token publicly
- Consider creating a separate token for MCP with limited permissions

## Troubleshooting

If MCP isn't working:
1. Make sure you've restarted your IDE/Claude Desktop after configuration
2. Check that the access token is valid (not expired)
3. Verify the project reference matches your Supabase URL
4. Try running: `npx -y @supabase/mcp-server-supabase@latest --version` to test installation

## Next Steps

Now you can directly interact with your Supabase database through your AI assistant without manually running SQL commands!