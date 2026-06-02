import { MeiliSearch, SearchResponse } from 'meilisearch';
import {
  SearchableEntity,
  SearchModule,
  SearchOptions,
  SearchResult,
  SearchHighlight,
  SuggestOption,
  SearchClientConfig,
} from './types';

export class SearchClient {
  private client: MeiliSearch;
  private host: string;
  private apiKey: string;

  constructor(config: SearchClientConfig) {
    this.host = config.host;
    this.apiKey = config.apiKey;
    this.client = new MeiliSearch({
      host: this.host,
      apiKey: this.apiKey,
      timeout: config.timeout ?? 30000,
    });
  }

  /**
   * Perform a cross-index federated search across all entities
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const {
      query,
      entities = Object.values(SearchableEntity),
      modules,
      filters = [],
      sort = [],
      limit = 20,
      offset = 0,
      highlightPreTag = '<mark>',
      highlightPostTag = '</mark>',
      attributesToHighlight = ['title', 'description'],
    } = options;

    const results: SearchResult[] = [];

    for (const entity of entities) {
      try {
        const indexName = this.getIndexName(entity);
        const index = this.client.index(indexName);

        const searchParams: Record<string, unknown> = {
          limit,
          offset,
          highlightPreTag,
          highlightPostTag,
          attributesToHighlight,
        };

        if (sort.length > 0) {
          searchParams.sort = sort;
        }

        if (filters.length > 0) {
          const filterExpressions = filters.map((f) => {
            if (Array.isArray(f.value)) {
              const values = f.value.map((v) =>
                typeof v === 'string' ? `"${v}"` : v
              );
              return `${f.field} IN [${values.join(', ')}]`;
            }
            const value =
              typeof f.value === 'string' ? `"${f.value}"` : f.value;
            return `${f.field} = ${value}`;
          });
          searchParams.filter = filterExpressions;
        }

        const response = (await index.search(query, searchParams)) as SearchResponse<Record<string, unknown>>;

        for (const hit of response.hits) {
          const highlights: SearchHighlight[] = [];

          if (hit._formatted) {
            for (const attr of attributesToHighlight) {
              const formatted = hit._formatted as Record<string, unknown>;
              if (formatted[attr]) {
                highlights.push({
                  field: attr,
                  snippet: String(formatted[attr]),
                });
              }
            }
          }

          results.push({
            id: String(hit.id),
            entity,
            module: hit.module as SearchModule,
            title: String(hit.title || ''),
            description: String(hit.description || ''),
            highlights,
            score: (hit as any)._score ?? 0,
            url: String(hit.url || ''),
            metadata: {
              ...hit,
              _score: undefined,
              _formatted: undefined,
            } as Record<string, unknown>,
          });
        }
      } catch (error) {
        console.error(`Search error for entity ${entity}:`, error);
        // Continue with other entities on error
      }
    }

    // Sort combined results by score and return
    return results
      .sort((a, b) => b.score - a.score)
      .slice(offset, offset + limit);
  }

  /**
   * Search within a specific module
   */
  async searchModule(
    module: SearchModule,
    query: string,
    options?: Partial<SearchOptions>
  ): Promise<SearchResult[]> {
    const moduleToEntities: Record<SearchModule, SearchableEntity[]> = {
      [SearchModule.CRM]: [
        SearchableEntity.CUSTOMER,
        SearchableEntity.LEAD,
      ],
      [SearchModule.INVENTORY]: [SearchableEntity.PRODUCT],
      [SearchModule.SALES]: [SearchableEntity.ORDER],
      [SearchModule.ACCOUNTING]: [SearchableEntity.INVOICE],
      [SearchModule.HR]: [SearchableEntity.EMPLOYEE],
      [SearchModule.PROJECT_MANAGEMENT]: [
        SearchableEntity.PROJECT,
        SearchableEntity.TASK,
      ],
      [SearchModule.PRODUCTION]: [
        SearchableEntity.PRODUCTION_ORDER,
      ],
      [SearchModule.DOCUMENT_MANAGEMENT]: [
        SearchableEntity.DOCUMENT,
      ],
    };

    const entities = moduleToEntities[module] || [];

    return this.search({
      query,
      entities,
      limit: 20,
      offset: 0,
      ...options,
    });
  }

  /**
   * Get autocomplete suggestions for a query
   */
  async suggest(
    query: string,
    limit: number = 10
  ): Promise<SuggestOption[]> {
    const suggestions: SuggestOption[] = [];

    for (const entity of Object.values(SearchableEntity)) {
      try {
        const indexName = this.getIndexName(entity);
        const index = this.client.index(indexName);

        const response = (await index.search(query, {
          limit,
          attributesToHighlight: [],
        })) as SearchResponse<Record<string, unknown>>;

        for (const hit of response.hits) {
          const title = String(hit.title || hit.name || '');
          if (title) {
            suggestions.push({
              query: title,
              entity,
              module: hit.module as SearchModule,
              count: response.estimatedTotalHits || 0,
            });
          }
        }
      } catch (error) {
        console.error(`Suggest error for entity ${entity}:`, error);
      }
    }

    return suggestions
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get the Meilisearch client instance for advanced operations
   */
  getClient(): MeiliSearch {
    return this.client;
  }

  /**
   * Convert entity to index name
   */
  private getIndexName(entity: SearchableEntity): string {
    return `index_${entity.toLowerCase()}`;
  }
}

export function createSearchClient(
  host: string,
  apiKey: string
): SearchClient {
  return new SearchClient({ host, apiKey });
}
