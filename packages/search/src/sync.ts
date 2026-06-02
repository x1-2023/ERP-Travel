import { SearchableEntity, SearchSyncPayload, DocumentIndexPayload } from './types';
import { Indexer } from './indexer';

export class SearchSync {
  private indexer: Indexer;
  private syncQueue: Map<string, SearchSyncPayload> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private flushInterval: number;
  private isProcessing: boolean = false;

  constructor(indexer: Indexer, flushIntervalMs: number = 2000) {
    this.indexer = indexer;
    this.flushInterval = flushIntervalMs;
  }

  /**
   * Queue a sync operation (CREATE, UPDATE, or DELETE)
   */
  async queueSync(payload: SearchSyncPayload): Promise<void> {
    const key = `${payload.entity}_${payload.documentId}`;
    this.syncQueue.set(key, payload);

    // Reset the flush timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush().catch((error) => {
        console.error('SearchSync flush error:', error);
      });
    }, this.flushInterval);
  }

  /**
   * Process and apply all queued sync operations
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.syncQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const operations = Array.from(this.syncQueue.values());

      // Group operations by entity
      const byEntity = new Map<SearchableEntity, SearchSyncPayload[]>();
      for (const op of operations) {
        if (!byEntity.has(op.entity)) {
          byEntity.set(op.entity, []);
        }
        byEntity.get(op.entity)!.push(op);
      }

      // Process each entity group
      for (const [entity, ops] of byEntity) {
        await this.processEntityOperations(entity, ops);
      }

      // Clear the queue
      this.syncQueue.clear();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process all operations for a specific entity
   */
  private async processEntityOperations(
    entity: SearchableEntity,
    operations: SearchSyncPayload[]
  ): Promise<void> {
    // Separate operations by action type
    const creates: SearchSyncPayload[] = [];
    const updates: SearchSyncPayload[] = [];
    const deletes: SearchSyncPayload[] = [];

    for (const op of operations) {
      switch (op.action) {
        case 'CREATE':
          creates.push(op);
          break;
        case 'UPDATE':
          updates.push(op);
          break;
        case 'DELETE':
          deletes.push(op);
          break;
      }
    }

    // Process CREATEs and UPDATEs together (both are index operations)
    if (creates.length > 0 || updates.length > 0) {
      const documents = [...creates, ...updates]
        .map((op) => op.data)
        .filter((data): data is DocumentIndexPayload => data !== undefined);

      if (documents.length > 0) {
        try {
          await this.indexer.indexBatch(entity, documents);
        } catch (error) {
          console.error(
            `Failed to index documents for ${entity}:`,
            error
          );
        }
      }
    }

    // Process DELETEs
    for (const deleteOp of deletes) {
      try {
        await this.indexer.removeDocument(entity, deleteOp.documentId);
      } catch (error) {
        console.error(
          `Failed to delete document ${deleteOp.documentId} from ${entity}:`,
          error
        );
      }
    }
  }

  /**
   * Manually trigger a sync operation immediately
   */
  async syncImmediate(payload: SearchSyncPayload): Promise<void> {
    const key = `${payload.entity}_${payload.documentId}`;
    this.syncQueue.set(key, payload);
    await this.flush();
  }

  /**
   * Stop the sync service and flush any pending operations
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining operations
    await this.flush();
  }

  /**
   * Get the current queue size
   */
  getQueueSize(): number {
    return this.syncQueue.size;
  }

  /**
   * Clear the queue without flushing
   */
  clearQueue(): void {
    this.syncQueue.clear();
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Create a Prisma middleware function for automatic syncing on database changes
   *
   * Usage:
   * ```
   * const searchSync = new SearchSync(indexer);
   * prisma.$use(searchSync.getPrismaMiddleware());
   * ```
   */
  getPrismaMiddleware() {
    return async (
      params: {
        model?: string;
        action: string;
        args: Record<string, unknown>;
        [key: string]: unknown;
      },
      next: (params: unknown) => Promise<unknown>
    ): Promise<unknown> => {
      const result = await next(params);

      try {
        const entity = this.mapModelToEntity(params.model);
        if (!entity) {
          return result;
        }

        // Only sync on specific actions
        if (!['create', 'update', 'delete', 'upsert'].includes(params.action)) {
          return result;
        }

        // Extract document data from the result
        const payload = this.buildSyncPayload(
          entity,
          params.action,
          params.args,
          result
        );

        if (payload) {
          await this.queueSync(payload);
        }
      } catch (error) {
        console.error('Error in SearchSync Prisma middleware:', error);
      }

      return result;
    };
  }

  /**
   * Map Prisma model names to SearchableEntity
   */
  private mapModelToEntity(model: string | undefined): SearchableEntity | null {
    if (!model) return null;

    const mapping: Record<string, SearchableEntity> = {
      Customer: SearchableEntity.CUSTOMER,
      Product: SearchableEntity.PRODUCT,
      Order: SearchableEntity.ORDER,
      Invoice: SearchableEntity.INVOICE,
      Employee: SearchableEntity.EMPLOYEE,
      Project: SearchableEntity.PROJECT,
      Task: SearchableEntity.TASK,
      Lead: SearchableEntity.LEAD,
      ProductionOrder: SearchableEntity.PRODUCTION_ORDER,
      Document: SearchableEntity.DOCUMENT,
    };

    return mapping[model] || null;
  }

  /**
   * Build a sync payload from Prisma operation result
   */
  private buildSyncPayload(
    entity: SearchableEntity,
    action: string,
    args: Record<string, unknown>,
    result: unknown
  ): SearchSyncPayload | null {
    const resultData = result as Record<string, unknown>;
    const documentId = String(resultData?.id || (args?.data as any)?.id || (args?.where as any)?.id);

    if (!documentId) {
      console.warn(`No ID found for ${entity} sync operation`);
      return null;
    }

    if (action === 'delete') {
      return {
        entity,
        action: 'DELETE',
        documentId,
      };
    }

    // Extract document data for CREATE and UPDATE
    const data: DocumentIndexPayload = {
      id: documentId,
      entity,
      module: this.getModuleForEntity(entity) as any,
      title: String(resultData?.name || resultData?.title || ''),
      description: String(resultData?.description || ''),
      url: String(resultData?.url || `/${entity.toLowerCase()}/${documentId}`),
      metadata: this.extractMetadata(resultData),
      ...resultData,
    };

    return {
      entity,
      action: action === 'create' ? 'CREATE' : 'UPDATE',
      documentId,
      data,
    };
  }

  /**
   * Determine the module for an entity
   */
  private getModuleForEntity(entity: SearchableEntity): string {
    const mapping: Record<SearchableEntity, string> = {
      [SearchableEntity.CUSTOMER]: 'crm',
      [SearchableEntity.LEAD]: 'crm',
      [SearchableEntity.PRODUCT]: 'inventory',
      [SearchableEntity.ORDER]: 'sales',
      [SearchableEntity.INVOICE]: 'accounting',
      [SearchableEntity.EMPLOYEE]: 'hr',
      [SearchableEntity.PROJECT]: 'project_management',
      [SearchableEntity.TASK]: 'project_management',
      [SearchableEntity.PRODUCTION_ORDER]: 'production',
      [SearchableEntity.DOCUMENT]: 'document_management',
    };
    return mapping[entity] || 'general';
  }

  /**
   * Extract searchable metadata from result data
   */
  private extractMetadata(data: Record<string, unknown>): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

    for (const [key, value] of Object.entries(data)) {
      if (!sensitiveFields.includes(key) && value !== null && value !== undefined) {
        metadata[key] = value;
      }
    }

    return metadata;
  }
}

export function createSearchSync(
  indexer: Indexer,
  flushIntervalMs?: number
): SearchSync {
  return new SearchSync(indexer, flushIntervalMs);
}
