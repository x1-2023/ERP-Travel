import { z } from 'zod';
/**
 * ProductionOrderCreated - Lệnh sản xuất được tạo
 * Kích hoạt: MRP hệ thống tạo lệnh hoặc manual entry
 * Source: Ecommerce (OrderPlaced) nếu stock thấp
 */
export declare const ProductionOrderCreatedSchema: z.ZodObject<{
    productionOrderId: z.ZodString;
    productionOrderNumber: z.ZodString;
    productId: z.ZodString;
    productName: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    plannedStartDate: z.ZodString;
    plannedEndDate: z.ZodString;
    sourceOrder: z.ZodEnum<["sales_order", "ecommerce_order", "forecast", "replenishment"]>;
    sourceOrderId: z.ZodOptional<z.ZodString>;
    routingId: z.ZodOptional<z.ZodString>;
    bomVersion: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    costCenter: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    billOfMaterials: z.ZodOptional<z.ZodArray<z.ZodObject<{
        materialId: z.ZodString;
        materialName: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        wastagePercent: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        unit: string;
        quantity: number;
        materialId: string;
        materialName: string;
        wastagePercent?: number | undefined;
    }, {
        unit: string;
        quantity: number;
        materialId: string;
        materialName: string;
        wastagePercent?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    productName: string;
    productionOrderId: string;
    productionOrderNumber: string;
    plannedStartDate: string;
    plannedEndDate: string;
    sourceOrder: "sales_order" | "ecommerce_order" | "forecast" | "replenishment";
    priority: "low" | "normal" | "high" | "urgent";
    notes?: string | undefined;
    sku?: string | undefined;
    sourceOrderId?: string | undefined;
    routingId?: string | undefined;
    bomVersion?: string | undefined;
    costCenter?: string | undefined;
    billOfMaterials?: {
        unit: string;
        quantity: number;
        materialId: string;
        materialName: string;
        wastagePercent?: number | undefined;
    }[] | undefined;
}, {
    productId: string;
    quantity: number;
    productName: string;
    productionOrderId: string;
    productionOrderNumber: string;
    plannedStartDate: string;
    plannedEndDate: string;
    sourceOrder: "sales_order" | "ecommerce_order" | "forecast" | "replenishment";
    notes?: string | undefined;
    sku?: string | undefined;
    sourceOrderId?: string | undefined;
    routingId?: string | undefined;
    bomVersion?: string | undefined;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    costCenter?: string | undefined;
    billOfMaterials?: {
        unit: string;
        quantity: number;
        materialId: string;
        materialName: string;
        wastagePercent?: number | undefined;
    }[] | undefined;
}>;
export type ProductionOrderCreated = z.infer<typeof ProductionOrderCreatedSchema>;
/**
 * ProductionCompleted - Lệnh sản xuất hoàn tất
 * Kích hoạt: Sản xuất xác nhận hoàn tất lệnh
 * Flow: Trigger InventoryUpdated event
 */
export declare const ProductionCompletedSchema: z.ZodObject<{
    productionOrderId: z.ZodString;
    productionOrderNumber: z.ZodString;
    productId: z.ZodString;
    plannedQuantity: z.ZodNumber;
    producedQuantity: z.ZodNumber;
    scrapQuantity: z.ZodDefault<z.ZodNumber>;
    completedDate: z.ZodString;
    actualStartDate: z.ZodOptional<z.ZodString>;
    actualEndDate: z.ZodOptional<z.ZodString>;
    downtime: z.ZodOptional<z.ZodNumber>;
    qualityStatus: z.ZodDefault<z.ZodEnum<["passed", "failed", "pending_inspection"]>>;
    costActual: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    productionOrderId: string;
    productionOrderNumber: string;
    plannedQuantity: number;
    producedQuantity: number;
    scrapQuantity: number;
    completedDate: string;
    qualityStatus: "failed" | "passed" | "pending_inspection";
    notes?: string | undefined;
    actualStartDate?: string | undefined;
    actualEndDate?: string | undefined;
    downtime?: number | undefined;
    costActual?: number | undefined;
}, {
    productId: string;
    productionOrderId: string;
    productionOrderNumber: string;
    plannedQuantity: number;
    producedQuantity: number;
    completedDate: string;
    notes?: string | undefined;
    scrapQuantity?: number | undefined;
    actualStartDate?: string | undefined;
    actualEndDate?: string | undefined;
    downtime?: number | undefined;
    qualityStatus?: "failed" | "passed" | "pending_inspection" | undefined;
    costActual?: number | undefined;
}>;
export type ProductionCompleted = z.infer<typeof ProductionCompletedSchema>;
/**
 * InventoryUpdated - Tồn kho được cập nhật
 * Kích hoạt: Production completed, Sales, Adjustment
 * Broadcast: Notify accounting, ecommerce, crm
 */
export declare const InventoryUpdatedSchema: z.ZodObject<{
    inventoryId: z.ZodString;
    productId: z.ZodString;
    productName: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodString;
    warehouseName: z.ZodString;
    previousQuantity: z.ZodNumber;
    newQuantity: z.ZodNumber;
    quantityChanged: z.ZodNumber;
    updateType: z.ZodEnum<["production_complete", "sales_order", "purchase_order", "adjustment", "transfer", "count", "return"]>;
    referenceDocumentId: z.ZodOptional<z.ZodString>;
    updateDate: z.ZodString;
    costPerUnit: z.ZodOptional<z.ZodNumber>;
    totalValue: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    productName: string;
    inventoryId: string;
    warehouseId: string;
    warehouseName: string;
    previousQuantity: number;
    newQuantity: number;
    quantityChanged: number;
    updateType: "sales_order" | "production_complete" | "purchase_order" | "adjustment" | "transfer" | "count" | "return";
    updateDate: string;
    notes?: string | undefined;
    sku?: string | undefined;
    referenceDocumentId?: string | undefined;
    costPerUnit?: number | undefined;
    totalValue?: number | undefined;
}, {
    productId: string;
    productName: string;
    inventoryId: string;
    warehouseId: string;
    warehouseName: string;
    previousQuantity: number;
    newQuantity: number;
    quantityChanged: number;
    updateType: "sales_order" | "production_complete" | "purchase_order" | "adjustment" | "transfer" | "count" | "return";
    updateDate: string;
    notes?: string | undefined;
    sku?: string | undefined;
    referenceDocumentId?: string | undefined;
    costPerUnit?: number | undefined;
    totalValue?: number | undefined;
}>;
export type InventoryUpdated = z.infer<typeof InventoryUpdatedSchema>;
/**
 * StockLow - Tồn kho chạm ngưỡng tối thiểu
 * Kích hoạt: Hệ thống kiểm tra định kỳ
 * Flow: Alert → MRP → ProductionOrderCreated (auto-trigger hoặc manual)
 */
export declare const StockLowSchema: z.ZodObject<{
    alertId: z.ZodString;
    productId: z.ZodString;
    productName: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodString;
    warehouseName: z.ZodString;
    currentStock: z.ZodNumber;
    minimumStock: z.ZodNumber;
    reorderPoint: z.ZodNumber;
    reorderQuantity: z.ZodOptional<z.ZodNumber>;
    leadTimeDays: z.ZodOptional<z.ZodNumber>;
    alertDate: z.ZodString;
    forecasted30DayUsage: z.ZodOptional<z.ZodNumber>;
    supplierSuggested: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    productName: string;
    warehouseId: string;
    warehouseName: string;
    alertId: string;
    currentStock: number;
    minimumStock: number;
    reorderPoint: number;
    alertDate: string;
    sku?: string | undefined;
    reorderQuantity?: number | undefined;
    leadTimeDays?: number | undefined;
    forecasted30DayUsage?: number | undefined;
    supplierSuggested?: string | undefined;
}, {
    productId: string;
    productName: string;
    warehouseId: string;
    warehouseName: string;
    alertId: string;
    currentStock: number;
    minimumStock: number;
    reorderPoint: number;
    alertDate: string;
    sku?: string | undefined;
    reorderQuantity?: number | undefined;
    leadTimeDays?: number | undefined;
    forecasted30DayUsage?: number | undefined;
    supplierSuggested?: string | undefined;
}>;
export type StockLow = z.infer<typeof StockLowSchema>;
/**
 * QualityCheckPassed - Kiểm chất lượng sản phẩm đạt yêu cầu
 * Kích hoạt: QC xác nhận sản phẩm đạt chất lượng
 */
export declare const QualityCheckPassedSchema: z.ZodObject<{
    qualityCheckId: z.ZodString;
    productionOrderId: z.ZodString;
    batchId: z.ZodOptional<z.ZodString>;
    productId: z.ZodString;
    productName: z.ZodString;
    quantityInspected: z.ZodNumber;
    quantityApproved: z.ZodNumber;
    defectiveQuantity: z.ZodNumber;
    defectRate: z.ZodOptional<z.ZodNumber>;
    inspectionDate: z.ZodString;
    inspectorId: z.ZodOptional<z.ZodString>;
    inspectorName: z.ZodOptional<z.ZodString>;
    standards: z.ZodOptional<z.ZodArray<z.ZodObject<{
        standardName: z.ZodString;
        specification: z.ZodString;
        result: z.ZodEnum<["pass", "fail"]>;
    }, "strip", z.ZodTypeAny, {
        result: "pass" | "fail";
        standardName: string;
        specification: string;
    }, {
        result: "pass" | "fail";
        standardName: string;
        specification: string;
    }>, "many">>;
    certificateNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    productName: string;
    productionOrderId: string;
    qualityCheckId: string;
    quantityInspected: number;
    quantityApproved: number;
    defectiveQuantity: number;
    inspectionDate: string;
    notes?: string | undefined;
    batchId?: string | undefined;
    defectRate?: number | undefined;
    inspectorId?: string | undefined;
    inspectorName?: string | undefined;
    standards?: {
        result: "pass" | "fail";
        standardName: string;
        specification: string;
    }[] | undefined;
    certificateNumber?: string | undefined;
}, {
    productId: string;
    productName: string;
    productionOrderId: string;
    qualityCheckId: string;
    quantityInspected: number;
    quantityApproved: number;
    defectiveQuantity: number;
    inspectionDate: string;
    notes?: string | undefined;
    batchId?: string | undefined;
    defectRate?: number | undefined;
    inspectorId?: string | undefined;
    inspectorName?: string | undefined;
    standards?: {
        result: "pass" | "fail";
        standardName: string;
        specification: string;
    }[] | undefined;
    certificateNumber?: string | undefined;
}>;
export type QualityCheckPassed = z.infer<typeof QualityCheckPassedSchema>;
/**
 * Export all MRP event schemas
 */
export declare const MRPEventSchemas: {
    readonly 'mrp.production_order.created': z.ZodObject<{
        productionOrderId: z.ZodString;
        productionOrderNumber: z.ZodString;
        productId: z.ZodString;
        productName: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        plannedStartDate: z.ZodString;
        plannedEndDate: z.ZodString;
        sourceOrder: z.ZodEnum<["sales_order", "ecommerce_order", "forecast", "replenishment"]>;
        sourceOrderId: z.ZodOptional<z.ZodString>;
        routingId: z.ZodOptional<z.ZodString>;
        bomVersion: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
        costCenter: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        billOfMaterials: z.ZodOptional<z.ZodArray<z.ZodObject<{
            materialId: z.ZodString;
            materialName: z.ZodString;
            quantity: z.ZodNumber;
            unit: z.ZodString;
            wastagePercent: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            unit: string;
            quantity: number;
            materialId: string;
            materialName: string;
            wastagePercent?: number | undefined;
        }, {
            unit: string;
            quantity: number;
            materialId: string;
            materialName: string;
            wastagePercent?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        productName: string;
        productionOrderId: string;
        productionOrderNumber: string;
        plannedStartDate: string;
        plannedEndDate: string;
        sourceOrder: "sales_order" | "ecommerce_order" | "forecast" | "replenishment";
        priority: "low" | "normal" | "high" | "urgent";
        notes?: string | undefined;
        sku?: string | undefined;
        sourceOrderId?: string | undefined;
        routingId?: string | undefined;
        bomVersion?: string | undefined;
        costCenter?: string | undefined;
        billOfMaterials?: {
            unit: string;
            quantity: number;
            materialId: string;
            materialName: string;
            wastagePercent?: number | undefined;
        }[] | undefined;
    }, {
        productId: string;
        quantity: number;
        productName: string;
        productionOrderId: string;
        productionOrderNumber: string;
        plannedStartDate: string;
        plannedEndDate: string;
        sourceOrder: "sales_order" | "ecommerce_order" | "forecast" | "replenishment";
        notes?: string | undefined;
        sku?: string | undefined;
        sourceOrderId?: string | undefined;
        routingId?: string | undefined;
        bomVersion?: string | undefined;
        priority?: "low" | "normal" | "high" | "urgent" | undefined;
        costCenter?: string | undefined;
        billOfMaterials?: {
            unit: string;
            quantity: number;
            materialId: string;
            materialName: string;
            wastagePercent?: number | undefined;
        }[] | undefined;
    }>;
    readonly 'mrp.production.completed': z.ZodObject<{
        productionOrderId: z.ZodString;
        productionOrderNumber: z.ZodString;
        productId: z.ZodString;
        plannedQuantity: z.ZodNumber;
        producedQuantity: z.ZodNumber;
        scrapQuantity: z.ZodDefault<z.ZodNumber>;
        completedDate: z.ZodString;
        actualStartDate: z.ZodOptional<z.ZodString>;
        actualEndDate: z.ZodOptional<z.ZodString>;
        downtime: z.ZodOptional<z.ZodNumber>;
        qualityStatus: z.ZodDefault<z.ZodEnum<["passed", "failed", "pending_inspection"]>>;
        costActual: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        productionOrderId: string;
        productionOrderNumber: string;
        plannedQuantity: number;
        producedQuantity: number;
        scrapQuantity: number;
        completedDate: string;
        qualityStatus: "failed" | "passed" | "pending_inspection";
        notes?: string | undefined;
        actualStartDate?: string | undefined;
        actualEndDate?: string | undefined;
        downtime?: number | undefined;
        costActual?: number | undefined;
    }, {
        productId: string;
        productionOrderId: string;
        productionOrderNumber: string;
        plannedQuantity: number;
        producedQuantity: number;
        completedDate: string;
        notes?: string | undefined;
        scrapQuantity?: number | undefined;
        actualStartDate?: string | undefined;
        actualEndDate?: string | undefined;
        downtime?: number | undefined;
        qualityStatus?: "failed" | "passed" | "pending_inspection" | undefined;
        costActual?: number | undefined;
    }>;
    readonly 'mrp.inventory.updated': z.ZodObject<{
        inventoryId: z.ZodString;
        productId: z.ZodString;
        productName: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        warehouseId: z.ZodString;
        warehouseName: z.ZodString;
        previousQuantity: z.ZodNumber;
        newQuantity: z.ZodNumber;
        quantityChanged: z.ZodNumber;
        updateType: z.ZodEnum<["production_complete", "sales_order", "purchase_order", "adjustment", "transfer", "count", "return"]>;
        referenceDocumentId: z.ZodOptional<z.ZodString>;
        updateDate: z.ZodString;
        costPerUnit: z.ZodOptional<z.ZodNumber>;
        totalValue: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        productName: string;
        inventoryId: string;
        warehouseId: string;
        warehouseName: string;
        previousQuantity: number;
        newQuantity: number;
        quantityChanged: number;
        updateType: "sales_order" | "production_complete" | "purchase_order" | "adjustment" | "transfer" | "count" | "return";
        updateDate: string;
        notes?: string | undefined;
        sku?: string | undefined;
        referenceDocumentId?: string | undefined;
        costPerUnit?: number | undefined;
        totalValue?: number | undefined;
    }, {
        productId: string;
        productName: string;
        inventoryId: string;
        warehouseId: string;
        warehouseName: string;
        previousQuantity: number;
        newQuantity: number;
        quantityChanged: number;
        updateType: "sales_order" | "production_complete" | "purchase_order" | "adjustment" | "transfer" | "count" | "return";
        updateDate: string;
        notes?: string | undefined;
        sku?: string | undefined;
        referenceDocumentId?: string | undefined;
        costPerUnit?: number | undefined;
        totalValue?: number | undefined;
    }>;
    readonly 'mrp.stock.low': z.ZodObject<{
        alertId: z.ZodString;
        productId: z.ZodString;
        productName: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        warehouseId: z.ZodString;
        warehouseName: z.ZodString;
        currentStock: z.ZodNumber;
        minimumStock: z.ZodNumber;
        reorderPoint: z.ZodNumber;
        reorderQuantity: z.ZodOptional<z.ZodNumber>;
        leadTimeDays: z.ZodOptional<z.ZodNumber>;
        alertDate: z.ZodString;
        forecasted30DayUsage: z.ZodOptional<z.ZodNumber>;
        supplierSuggested: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        productName: string;
        warehouseId: string;
        warehouseName: string;
        alertId: string;
        currentStock: number;
        minimumStock: number;
        reorderPoint: number;
        alertDate: string;
        sku?: string | undefined;
        reorderQuantity?: number | undefined;
        leadTimeDays?: number | undefined;
        forecasted30DayUsage?: number | undefined;
        supplierSuggested?: string | undefined;
    }, {
        productId: string;
        productName: string;
        warehouseId: string;
        warehouseName: string;
        alertId: string;
        currentStock: number;
        minimumStock: number;
        reorderPoint: number;
        alertDate: string;
        sku?: string | undefined;
        reorderQuantity?: number | undefined;
        leadTimeDays?: number | undefined;
        forecasted30DayUsage?: number | undefined;
        supplierSuggested?: string | undefined;
    }>;
    readonly 'mrp.quality_check.passed': z.ZodObject<{
        qualityCheckId: z.ZodString;
        productionOrderId: z.ZodString;
        batchId: z.ZodOptional<z.ZodString>;
        productId: z.ZodString;
        productName: z.ZodString;
        quantityInspected: z.ZodNumber;
        quantityApproved: z.ZodNumber;
        defectiveQuantity: z.ZodNumber;
        defectRate: z.ZodOptional<z.ZodNumber>;
        inspectionDate: z.ZodString;
        inspectorId: z.ZodOptional<z.ZodString>;
        inspectorName: z.ZodOptional<z.ZodString>;
        standards: z.ZodOptional<z.ZodArray<z.ZodObject<{
            standardName: z.ZodString;
            specification: z.ZodString;
            result: z.ZodEnum<["pass", "fail"]>;
        }, "strip", z.ZodTypeAny, {
            result: "pass" | "fail";
            standardName: string;
            specification: string;
        }, {
            result: "pass" | "fail";
            standardName: string;
            specification: string;
        }>, "many">>;
        certificateNumber: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        productName: string;
        productionOrderId: string;
        qualityCheckId: string;
        quantityInspected: number;
        quantityApproved: number;
        defectiveQuantity: number;
        inspectionDate: string;
        notes?: string | undefined;
        batchId?: string | undefined;
        defectRate?: number | undefined;
        inspectorId?: string | undefined;
        inspectorName?: string | undefined;
        standards?: {
            result: "pass" | "fail";
            standardName: string;
            specification: string;
        }[] | undefined;
        certificateNumber?: string | undefined;
    }, {
        productId: string;
        productName: string;
        productionOrderId: string;
        qualityCheckId: string;
        quantityInspected: number;
        quantityApproved: number;
        defectiveQuantity: number;
        inspectionDate: string;
        notes?: string | undefined;
        batchId?: string | undefined;
        defectRate?: number | undefined;
        inspectorId?: string | undefined;
        inspectorName?: string | undefined;
        standards?: {
            result: "pass" | "fail";
            standardName: string;
            specification: string;
        }[] | undefined;
        certificateNumber?: string | undefined;
    }>;
};
//# sourceMappingURL=mrp.events.d.ts.map