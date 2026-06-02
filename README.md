# mcp-itunes-search

iTunes Search MCP — Apple's public catalog search

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search iTunes catalog. |
| `lookup` | Exact-ID lookup. Provide any one of id / bundle_id / isbn / upc / amg_artist_id / amg_album_id. |
| `top_movies` | Top-grossing movies chart. |
| `top_podcasts` | Top podcasts chart. |
| `top_books` | Top ebooks chart. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "itunes-search": {
      "url": "https://gateway.pipeworx.io/itunes-search/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Itunes Search data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
