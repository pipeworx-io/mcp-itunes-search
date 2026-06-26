interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * iTunes Search MCP — Apple's public catalog search
 *
 * Auth: none. ~20 req/min/IP for search/lookup.
 * Docs: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
 */


const SEARCH = 'https://itunes.apple.com/search';
const LOOKUP = 'https://itunes.apple.com/lookup';
const RSS_BASE = 'https://rss.applemarketingtools.com/api/v2';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search the Apple iTunes catalog by keyword across music, movies, podcasts, TV shows, apps, ebooks, and more; filterable by media type, entity, country, and explicit flag; returns up to 200 matching items with metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: 'Search query' },
        media: {
          type: 'string',
          description: 'music | movie | podcast | musicVideo | audiobook | shortFilm | tvShow | software | ebook | all (default all)',
        },
        entity: { type: 'string', description: 'Refines media — e.g. "song", "album", "movieArtist", "tvSeason"' },
        attribute: { type: 'string', description: 'Restrict matching field — e.g. "artistTerm", "albumTerm", "movieTerm"' },
        country: { type: 'string', description: 'ISO 3166-1 alpha-2 (default us)' },
        limit: { type: 'number', description: '1-200 (default 50)' },
        lang: { type: 'string', description: 'en_us | ja_jp (default en_us)' },
        explicit: { type: 'string', description: 'Yes (default) | No — exclude explicit content' },
      },
      required: ['term'],
    },
  },
  {
    name: 'lookup',
    description: 'Exact-ID lookup. Provide any one of id / bundle_id / isbn / upc / amg_artist_id / amg_album_id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Apple ID(s), comma-separated' },
        bundle_id: { type: 'string', description: 'iOS / macOS app bundle id' },
        isbn: { type: 'string', description: 'ISBN-13 of a book' },
        upc: { type: 'string', description: 'UPC of an album/movie' },
        amg_artist_id: { type: 'string', description: 'All Music Guide artist id' },
        amg_album_id: { type: 'string', description: 'All Music Guide album id' },
        country: { type: 'string' },
        entity: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'top_movies',
    description: 'DEPRECATED — Apple discontinued the iTunes movies chart (permanent 404). For popular, trending, or current movies use the tmdb pack instead: tmdb_trending, discover_movie, or get_movie.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'ISO alpha-2 (default us)' },
        limit: { type: 'number', description: '1-100 (default 25)' },
      },
    },
  },
  {
    name: 'top_podcasts',
    description: 'Top podcasts chart.',
    inputSchema: {
      type: 'object',
      properties: { country: { type: 'string' }, limit: { type: 'number' } },
    },
  },
  {
    name: 'top_books',
    description: 'Top ebooks chart.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        limit: { type: 'number' },
        free_or_paid: { type: 'string', description: 'top-free-books | top-paid-books (default top-free-books)' },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search': {
      const params = new URLSearchParams({
        term: reqStr(args, 'term', '"taylor swift"'),
        media: String(args.media ?? 'all'),
        country: String(args.country ?? 'us'),
        limit: String(Math.min(200, Math.max(1, (args.limit as number) ?? 50))),
        lang: String(args.lang ?? 'en_us'),
        explicit: String(args.explicit ?? 'Yes'),
      });
      if (args.entity) params.set('entity', String(args.entity));
      if (args.attribute) params.set('attribute', String(args.attribute));
      return itunesGet(`${SEARCH}?${params}`);
    }
    case 'lookup': {
      const params = new URLSearchParams();
      if (args.id) params.set('id', String(args.id));
      if (args.bundle_id) params.set('bundleId', String(args.bundle_id));
      if (args.isbn) params.set('isbn', String(args.isbn));
      if (args.upc) params.set('upc', String(args.upc));
      if (args.amg_artist_id) params.set('amgArtistId', String(args.amg_artist_id));
      if (args.amg_album_id) params.set('amgAlbumId', String(args.amg_album_id));
      if (!params.toString()) throw new Error('Provide at least one id field for lookup.');
      if (args.country) params.set('country', String(args.country));
      if (args.entity) params.set('entity', String(args.entity));
      if (args.limit !== undefined) params.set('limit', String(args.limit));
      return itunesGet(`${LOOKUP}?${params}`);
    }
    case 'top_movies':
      // Apple discontinued the iTunes movies chart on the RSS feed generator
      // (music/podcasts/books still publish; movies/TV do not) — the endpoint
      // returns a permanent 404. Surface an actionable sibling hint instead of a
      // raw 404 so callers (and ask_pipeworx routing) move to tmdb.
      throw new Error('upstream_down: Apple discontinued the iTunes movies chart feed (permanent 404). For popular or current movies use the tmdb pack: tmdb_trending, discover_movie, or get_movie.');
    case 'top_podcasts':
      return rss('podcasts', (args.country as string) ?? 'us', 'top', (args.limit as number) ?? 25);
    case 'top_books':
      return rss('books', (args.country as string) ?? 'us', String(args.free_or_paid ?? 'top-free-books'), (args.limit as number) ?? 25);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function rss(media: string, country: string, chart: string, limit: number) {
  const url = `${RSS_BASE}/${country.toLowerCase()}/${media}/${chart}/${Math.min(100, Math.max(1, limit))}/explicit.json`;
  return itunesGet(url);
}

async function itunesGet(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-itunes-search/1.0 (+https://pipeworx.io)',
    },
  });
  if (res.status === 429) throw new Error('iTunes Search: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`iTunes Search error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
