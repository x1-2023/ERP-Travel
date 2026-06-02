// Export types
export * from './types';

// Export client
export { SearchClient, createSearchClient } from './client';

// Export indexer
export { Indexer, createIndexer } from './indexer';

// Export sync
export { SearchSync, createSearchSync } from './sync';

// Export index configurations
export {
  customerIndexConfig,
  productIndexConfig,
  orderIndexConfig,
  invoiceIndexConfig,
  employeeIndexConfig,
  taskIndexConfig,
  allIndexConfigs,
  getAllIndexConfigs,
  getIndexConfig,
} from './indices';
