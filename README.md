# mcp-itunes-search

iTunes Search MCP — Apple's public catalog search

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 965+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search the Apple iTunes catalog by keyword across music, movies, podcasts, TV shows, apps, ebooks, and more; filterable by media type, entity, country, and explicit flag; returns up to 200 matching items with metadata. |
| `lookup` | Exact-ID lookup. Provide any one of id / bundle_id / isbn / upc / amg_artist_id / amg_album_id. |
| `top_movies` | DEPRECATED — Apple discontinued the iTunes movies chart (permanent 404). For popular, trending, or current movies use the tmdb pack instead: tmdb_trending, discover_movie, or get_movie. |
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

Or connect to the full Pipeworx gateway for access to all 965+ data sources:

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
