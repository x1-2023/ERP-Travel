import { MeiliSearch, Index } from 'meilisearch';
import {
  SearchableEntity,
  IndexConfig,
  DocumentIndexPayload,
  IndexerConfig,
  SearchClientConfig,
} from './types';

export class Indexer {
  private client: MeiliSearch;
  private indices: Map<SearchableEntity, Index> = new Map();
  private indexConfigs: Map<SearchableEntity, IndexConfig> = new Map();

  constructor(
    clientConfig: SearchClientConfig,
    configs: IndexConfig[]
  ) {
    this.client = new MeiliSearch({
      host: clientConfig.host,
      apiKey: clientConfig.apiKey,
      timeout: clientConfig.timeout ?? 30000,
    });

    for (const config of configs) {
      const entity = this.getEntityFromIndexName(config.name);
      if (entity) {
        this.indexConfigs.set(entity, config);
      }
    }
  }

  /**
   * Create or update an index with Vietnamese-optimized settings
   */
  async createIndex(
    entity: SearchableEntity,
    config: IndexConfig,
    vietnameseSettings?: { enableDiacritics?: boolean; customStopWords?: string[] }
  ): Promise<Index> {
    const indexName = this.getIndexName(entity);

    try {
      const index = this.client.index(indexName);
      await index.getRawInfo();
      // Index already exists
      return index;
    } catch (error) {
      // Index doesn't exist, create it
    }

    const newIndex = await this.client.createIndex(indexName, {
      primaryKey: config.primaryKey,
    });

    // Configure Vietnamese settings
    const stopWords = vietnameseSettings?.customStopWords || [
      'và',
      'là',
      'cái',
      'được',
      'có',
      'của',
      'để',
      'từ',
      'với',
      'trong',
      'trên',
      'dưới',
      'một',
      'hai',
      'ba',
      'bốn',
      'năm',
      'sáu',
      'bảy',
      'tám',
      'chín',
      'mười',
    ];

    await (newIndex as any).updateSettings({
      searchableAttributes: config.searchableAttributes,
      filterableAttributes: config.filterableAttributes,
      sortableAttributes: config.sortableAttributes,
      displayedAttributes: config.displayedAttributes,
      stopWords,
      synonyms: config.synonyms || {},
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 5,
          twoTypos: 9,
        },
      },
      pagination: {
        maxTotalHits: 10000,
      },
    });

    this.indices.set(entity, newIndex as any);
    this.indexConfigs.set(entity, config);

    return newIndex as any;
  }

  /**
   * Index a single document or update an existing one
   */
  async indexDocument(
    entity: SearchableEntity,
    data: DocumentIndexPayload
  ): Promise<void> {
    const index = await this.getOrCreateIndex(entity);
    await index.addDocuments([data], { primaryKey: 'id' });
  }

  /**
   * Batch index multiple documents
   */
  async indexBatch(
    entity: SearchableEntity,
    documents: DocumentIndexPayload[]
  ): Promise<void> {
    if (documents.length === 0) {
      return;
    }

    const index = await this.getOrCreateIndex(entity);

    // Meilisearch handles large batches, but we'll chunk them for safety
    const chunkSize = 1000;
    for (let i = 0; i < documents.length; i += chunkSize) {
      const chunk = documents.slice(i, i + chunkSize);
      await index.addDocuments(chunk, { primaryKey: 'id' });
    }
  }

  /**
   * Remove a document from the index
   */
  async removeDocument(
    entity: SearchableEntity,
    documentId: string
  ): Promise<void> {
    const index = await this.getOrCreateIndex(entity);
    try {
      await index.deleteDocument(documentId);
    } catch (error) {
      // Document might not exist, which is fine
      console.error(
        `Failed to remove document ${documentId} from ${entity}:`,
        error
      );
    }
  }

  /**
   * Full reindex of an entity from a data source
   */
  async reindexAll(
    entity: SearchableEntity,
    dataSource: () => Promise<DocumentIndexPayload[]>
  ): Promise<void> {
    const indexName = this.getIndexName(entity);

    // Delete the existing index
    try {
      await this.client.deleteIndex(indexName);
    } catch (error) {
      // Index might not exist
    }

    // Get the config
    const config = this.indexConfigs.get(entity);
    if (!config) {
      throw new Error(`No config found for entity ${entity}`);
    }

    // Create new index
    const newIndex = await this.createIndex(entity, config);

    // Fetch and index all documents
    const documents = await dataSource();
    if (documents.length > 0) {
      await this.indexBatch(entity, documents);
    }

    this.indices.set(entity, newIndex);
  }

  /**
   * Clear all documents from an index without deleting it
   */
  async clearIndex(entity: SearchableEntity): Promise<void> {
    const index = await this.getOrCreateIndex(entity);
    const stats = await index.getStats();

    if (stats.numberOfDocuments > 0) {
      // Use a delete by filter approach or fetch and delete all
      await index.deleteAllDocuments();
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(entity: SearchableEntity): Promise<{
    numberOfDocuments: number;
    isIndexing: boolean;
    fieldDistribution: Record<string, number>;
  }> {
    const index = await this.getOrCreateIndex(entity);
    const stats = await index.getStats();
    return {
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
      fieldDistribution: stats.fieldDistribution || {},
    };
  }

  /**
   * Get or create an index, using cached instance if available
   */
  private async getOrCreateIndex(entity: SearchableEntity): Promise<Index> {
    if (this.indices.has(entity)) {
      return this.indices.get(entity)!;
    }

    const config = this.indexConfigs.get(entity);
    if (!config) {
      throw new Error(`No config found for entity ${entity}`);
    }

    const index = await this.createIndex(entity, config);
    this.indices.set(entity, index);
    return index;
  }

  /**
   * Convert entity to index name
   */
  private getIndexName(entity: SearchableEntity): string {
    return `index_${entity.toLowerCase()}`;
  }

  /**
   * Extract entity from index name
   */
  private getEntityFromIndexName(indexName: string): SearchableEntity | null {
    const match = indexName.match(/^index_(.+)$/);
    if (match) {
      const entityStr = match[1].toUpperCase();
      return (SearchableEntity as Record<string, SearchableEntity>)[entityStr] || null;
    }
    return null;
  }

  /**
   * Get the underlying Meilisearch client for advanced operations
   */
  getClient(): MeiliSearch {
    return this.client;
  }

  /**
   * Get all index configurations
   */
  getIndexConfigs(): Map<SearchableEntity, IndexConfig> {
    return new Map(this.indexConfigs);
  }
}

export function createIndexer(
  clientConfig: SearchClientConfig,
  configs: IndexConfig[]
): Indexer {
  return new Indexer(clientConfig, configs);
}
