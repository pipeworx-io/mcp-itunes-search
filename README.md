# @pipeworx/itunes-search

Apple iTunes Search MCP — search across the iTunes Store catalog: music, movies, podcasts, audiobooks, ebooks, software/apps. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(term, media?, entity?, attribute?, country?, limit?, lang?, explicit?)` — primary search
- `lookup(id?, bundle_id?, isbn?, upc?, amg_artist_id?, amg_album_id?, country?, entity?, limit?)` — exact-ID lookup
- `top_movies(country?, limit?)` — top-grossing movies (RSS-based)
- `top_podcasts(country?, limit?)` — top podcasts
- `top_books(country?, limit?, free_or_paid?)` — top ebooks

## Data source

- Search: `https://itunes.apple.com/search`
- Lookup: `https://itunes.apple.com/lookup`
- Charts: `https://rss.applemarketingtools.com/api/v2/<country>/...`

Rate limit ~20 req/min per IP for search/lookup; charts are static and cached.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
