import type { OrderPlaced } from '../schemas/ecommerce.events';
import type { ProductionOrderCreated, InventoryUpdated } from '../schemas/mrp.events';
import type { BaseEvent } from '../types';
/**
 * Check if we need to create production order for ordered items
 * Kiểm tra xem có cần tạo lệnh sản xuất hay không
 *
 * Logic:
 * - For each line item in order
 * - Check current stock level
 * - If stock < minimum + ordered qty → trigger production order
 */
export declare function checkInventoryAndCreateProductionOrder(orderPlacedEvent: BaseEvent<OrderPlaced>): Promise<ProductionOrderCreated[]>;
/**
 * Map ProductionCompleted to InventoryUpdated
 * Chuyển đổi ProductionCompleted sang InventoryUpdated
 *
 * When production completes:
 * - Add produced quantity to warehouse stock
 * - Update stock valuation
 * - Trigger inventory events
 */
export declare function mapProductionCompletedToInventory(productionCompletedEvent: BaseEvent<any>): Promise<InventoryUpdated>;
/**
 * Event flow metadata for Ecommerce → MRP
 */
export declare const EcommerceToMRPFlows: ({
    triggers: string[];
    target: string;
    mapper: typeof checkInventoryAndCreateProductionOrder;
} | {
    triggers: string[];
    target: string;
    mapper: typeof mapProductionCompletedToInventory;
})[];
/**
 * Validate production order
 */
export declare function validateProductionOrder(order: ProductionOrderCreated): {
    valid: boolean;
    errors: string[];
};
/**
 * Validate inventory update
 */
export declare function validateInventoryUpdate(inventory: InventoryUpdated): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=ecommerce-to-mrp.d.ts.map