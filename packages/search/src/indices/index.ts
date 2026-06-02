export * from './customers';
export * from './products';
export * from './orders';
export * from './invoices';
export * from './employees';
export * from './tasks';

import { IndexConfig, SearchableEntity } from '../types';
import { customerIndexConfig } from './customers';
import { productIndexConfig } from './products';
import { orderIndexConfig } from './orders';
import { invoiceIndexConfig } from './invoices';
import { employeeIndexConfig } from './employees';
import { taskIndexConfig } from './tasks';

/**
 * Complete index configuration map for all searchable entities
 */
export const allIndexConfigs: Map<SearchableEntity, IndexConfig> = new Map([
  [SearchableEntity.CUSTOMER, customerIndexConfig],
  [SearchableEntity.PRODUCT, productIndexConfig],
  [SearchableEntity.ORDER, orderIndexConfig],
  [SearchableEntity.INVOICE, invoiceIndexConfig],
  [SearchableEntity.EMPLOYEE, employeeIndexConfig],
  [SearchableEntity.TASK, taskIndexConfig],
]);

/**
 * Get all index configurations as an array
 */
export function getAllIndexConfigs(): IndexConfig[] {
  return Array.from(allIndexConfigs.values());
}

/**
 * Get index configuration for a specific entity
 */
export function getIndexConfig(entity: SearchableEntity): IndexConfig | undefined {
  return allIndexConfigs.get(entity);
}
