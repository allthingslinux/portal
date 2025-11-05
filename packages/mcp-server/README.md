# Portal MCP Server

The Portal MCP Server provides tools to AI Agents for working with the codebase.

## Build MCP Server

Run the command:

```bash
pnpm --filter "@portal/mcp-server" build
```

The command will build the MCP Server at `packages/mcp-server/build/index.js`.

## Adding MCP Servers to AI Coding tools

Before getting started, retrieve the absolute path to the `index.js` file created above. You can normally do this in your IDE by right-clicking the `index.js` file and selecting `Copy Path`.

I will reference this as `<full-path>` in the steps below: please replace it with the full path to your `index.js`.

### Claude Code

Run the command below:

```bash
claude mcp add makerkit node <full-path>
```

Restart Claude Code. If no errors appear, the MCP should be correctly configured.

### Codex

Open the Codex YAML config and add the following:

```
[mcp_servers.makerkit]
command = "node"
args = ["<full-path>"]
```

### Cursor

Open the `mcp.json` config in Cursor and add the following config:

```json
{
  "mcpServers": {
    "makerkit": {
      "command": "node",
      "args": ["<full-path>"]
    }
  }
}
```

## Additional MCP Servers

I strongly suggest using [the Postgres MCP Server](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres) that allows AI Agents to understand the structure of your Database.
