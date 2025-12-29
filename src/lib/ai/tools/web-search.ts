import { tool } from 'ai';
import { z } from 'zod';

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  domain: string;
  favicon?: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  query: string;
}

// Tavily API search tool
export const webSearchTool = tool({
  description:
    'Search the web for current information. Use this when you need up-to-date information about current events, recent news, or when the user asks about something that may have changed recently.',
  parameters: z.object({
    query: z.string().describe('The search query to find relevant information'),
  }),
  execute: async ({ query }): Promise<WebSearchResponse> => {
    const apiKey = process.env['TAVILY_API_KEY'];

    if (!apiKey) {
      console.warn('TAVILY_API_KEY not configured');
      return { results: [], query };
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: 'basic',
          include_answer: false,
          include_raw_content: false,
          max_results: 5,
        }),
      });

      if (!response.ok) {
        console.error('Tavily API error:', response.statusText);
        return { results: [], query };
      }

      const data = await response.json();

      const results: WebSearchResult[] = (data.results || []).map(
        (result: any) => ({
          title: result.title || '',
          url: result.url || '',
          content: result.content || '',
          domain: extractDomain(result.url || ''),
          favicon: getFaviconUrl(result.url || ''),
        })
      );

      return { results, query };
    } catch (error) {
      console.error('Web search error:', error);
      return { results: [], query };
    }
  },
});

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return '';
  }
}
