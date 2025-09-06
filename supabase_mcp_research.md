# Supabase MCP Server Research Summary

_Generated: 2025-09-03 | Sources: Official Supabase Docs, GitHub, Community Forums_

## Quick Reference

<key-points>
- Installation: `npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=<project-ref>`
- Windows requires `cmd /c` prefix in configuration
- Requires Node.js and Supabase Personal Access Token (PAT)
- Configuration via `.mcp.json` file in project root
- Verification through MCP client green status indicator
</key-points>

## Overview

<summary>
The Supabase MCP (Model Context Protocol) server enables AI assistants like Claude Code to interact directly with Supabase projects. It allows database operations, schema management, and data queries through natural language commands while maintaining security through read-only modes and project scoping.
</summary>

## Implementation Details

<details>

### Prerequisites
- Node.js installed (verify with `node -v`)
- Supabase account with project
- Personal Access Token (PAT) from Supabase settings

### Installation Commands

#### Basic Installation
```bash
# Direct command (executed by MCP client)
npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=<project-ref>
```

#### Windows-Specific Setup
```bash
# Windows users need cmd /c prefix in configuration
cmd /c npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=<project-ref>
```

#### Alternative Python Installation
```bash
# Using pipx (isolated environment)
pipx install supabase-mcp-server

# Using uv
uv pip install supabase-mcp-server
```

### Configuration for Claude Code

#### Method 1: Project Configuration File
Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

#### Method 2: Windows Configuration
For Windows systems, modify the command:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

#### Method 3: Local-Scoped Server (Claude Code CLI)
```bash
claude mcp add supabase -s local -e SUPABASE_ACCESS_TOKEN=your_token_here -- npx -y @supabase/mcp-server-supabase@latest
```

### Getting Required Values

#### Personal Access Token (PAT)
1. Go to Supabase Dashboard → Settings → Access Tokens
2. Click "Create new token"
3. Give it a descriptive name (e.g., "Claude Code MCP Server")
4. Copy the generated token

#### Project Reference
1. Go to Supabase Dashboard → Settings → General
2. Find "Project ID" under "Reference ID"
3. Copy the project reference string

### Advanced Configuration Options

#### Feature Selection
```bash
npx -y @supabase/mcp-server-supabase@latest --features=database,docs --project-ref=<project-ref>
```

Available feature groups:
- `account`: Account management
- `docs`: Documentation access
- `database`: Database operations
- `debugging`: Debug tools
- `development`: Development utilities
- `functions`: Edge functions
- `storage`: File storage
- `branching`: Database branching

#### Security Modes
- `--read-only`: Restricts to read-only operations (recommended)
- `--project-ref=<ref>`: Scope to specific project (recommended)

</details>

## Verification Methods

### 1. Check MCP Client Status
- In Claude Code/Cursor: Go to Settings → MCP
- Look for green "Active" status next to Supabase server
- Green status = successful connection

### 2. Test Connection
```bash
# Test if Node.js is available
node -v

# Test if npx can access the package
npx -y @supabase/mcp-server-supabase@latest --help
```

### 3. Verify Environment Variables
Ensure your `.mcp.json` file contains:
- Correct `SUPABASE_ACCESS_TOKEN`
- Valid `project-ref` value
- Proper command structure for your OS

## Troubleshooting Common Issues

<warnings>

### Windows-Specific Issues
**Problem**: MCP server fails to start on Windows 10/11
**Solutions**:
- Add `cmd /c` prefix to command in configuration
- Ensure Node.js is in system PATH
- Try `cmd /k` instead of `cmd /c` if issues persist
- Use WSL if problems continue: prefix with `wsl`

### Authentication Errors
**Problem**: "Authentication failed" or "Invalid token"
**Solutions**:
- Verify PAT is correctly copied (no extra spaces)
- Ensure token has necessary permissions
- Regenerate token if it's expired
- Check environment variable name matches exactly

### Connection Failures
**Problem**: "Connection closed" or "Failed to reload client"
**Solutions**:
- Restart Claude Code/MCP client
- Verify Node.js version compatibility (use LTS version)
- Check if port conflicts exist
- Validate JSON syntax in configuration file

### Package Resolution Errors
**Problem**: "Cannot find package" or module resolution failures
**Solutions**:
- Update npm: `npm install -g npm@latest`
- Clear npm cache: `npm cache clean --force`
- Try installing globally first: `npm install -g @supabase/mcp-server-supabase`
- Use full path to npx if needed

### Project Reference Issues
**Problem**: "Project not found" or "Access denied"
**Solutions**:
- Double-check project reference ID from Supabase dashboard
- Ensure PAT has access to the specific project
- Verify project is not paused or deleted
- Try without `--project-ref` flag to test broader access

### Performance Issues
**Problem**: Slow responses or timeouts
**Solutions**:
- Use `--read-only` flag to reduce overhead
- Limit features with `--features` flag
- Check Supabase project region vs your location
- Monitor Supabase dashboard for API limits

</warnings>

## Windows Setup Commands

### Node.js PATH Configuration
```cmd
# Get npm prefix path
npm config get prefix

# Add to system PATH (replace <path-to-dir> with actual path)
setx PATH "%PATH%;<path-to-dir>"
```

### Verification Commands
```cmd
# Verify Node.js installation
node --version
npm --version

# Test MCP server package access
npx -y @supabase/mcp-server-supabase@latest --help

# Check current PATH
echo %PATH%
```

## Resources

<references>
- [Official Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp) - Main installation guide
- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp) - Source code and issues
- [Claude Code MCP Docs](https://docs.anthropic.com/en/docs/claude-code/mcp) - Claude Code integration
- [Supabase MCP Server Blog](https://supabase.com/blog/mcp-server) - Feature overview
- [Windows MCP Troubleshooting](https://forum.cursor.com/t/mcp-servers-on-windows-10-not-working-please-help-supabase-mcp-server/59427) - Community solutions
</references>

## Metadata

<meta>
research-date: 2025-09-03
confidence: high
version-checked: @supabase/mcp-server-supabase@latest (2025)
platform-focus: Windows with cross-platform coverage
</meta>