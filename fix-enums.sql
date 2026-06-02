-- Fix: Convert VARCHAR+CHECK columns to PostgreSQL enum types (Prisma 7)
-- Run: docker exec -i vierp-postgres psql -U erp -d liphoco_dev < fix-enums.sql

-- Step 1: Drop defaults → convert type → re-add defaults

-- items.item_type
ALTER TABLE items ALTER COLUMN item_type DROP DEFAULT;
ALTER TABLE items ALTER COLUMN item_type TYPE "ItemType" USING item_type::"ItemType";
ALTER TABLE items ALTER COLUMN item_type SET DEFAULT 'raw_material'::"ItemType";

-- warehouses.warehouse_type
ALTER TABLE warehouses ALTER COLUMN warehouse_type DROP DEFAULT;
ALTER TABLE warehouses ALTER COLUMN warehouse_type TYPE "WarehouseType" USING warehouse_type::"WarehouseType";
ALTER TABLE warehouses ALTER COLUMN warehouse_type SET DEFAULT 'storage'::"WarehouseType";

-- work_orders.status
ALTER TABLE work_orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE work_orders ALTER COLUMN status TYPE "WorkOrderStatus" USING status::"WorkOrderStatus";
ALTER TABLE work_orders ALTER COLUMN status SET DEFAULT 'draft'::"WorkOrderStatus";

-- job_cards.status
ALTER TABLE job_cards ALTER COLUMN status DROP DEFAULT;
ALTER TABLE job_cards ALTER COLUMN status TYPE "JobCardStatus" USING status::"JobCardStatus";
ALTER TABLE job_cards ALTER COLUMN status SET DEFAULT 'open'::"JobCardStatus";

-- customers.pricing_profile
ALTER TABLE customers ALTER COLUMN pricing_profile DROP DEFAULT;
ALTER TABLE customers ALTER COLUMN pricing_profile TYPE "PricingProfile" USING pricing_profile::"PricingProfile";
ALTER TABLE customers ALTER COLUMN pricing_profile SET DEFAULT 'new_customer'::"PricingProfile";

-- customers.status
ALTER TABLE customers ALTER COLUMN status DROP DEFAULT;
ALTER TABLE customers ALTER COLUMN status TYPE "CustomerStatus" USING status::"CustomerStatus";
ALTER TABLE customers ALTER COLUMN status SET DEFAULT 'active'::"CustomerStatus";

-- quotations.status
ALTER TABLE quotations ALTER COLUMN status DROP DEFAULT;
ALTER TABLE quotations ALTER COLUMN status TYPE "QuotationStatus" USING status::"QuotationStatus";
ALTER TABLE quotations ALTER COLUMN status SET DEFAULT 'draft'::"QuotationStatus";

-- purchase_requests.status
ALTER TABLE purchase_requests ALTER COLUMN status DROP DEFAULT;
ALTER TABLE purchase_requests ALTER COLUMN status TYPE "PurchaseRequestStatus" USING status::"PurchaseRequestStatus";
ALTER TABLE purchase_requests ALTER COLUMN status SET DEFAULT 'draft'::"PurchaseRequestStatus";

-- purchase_request_items.status
ALTER TABLE purchase_request_items ALTER COLUMN status DROP DEFAULT;
ALTER TABLE purchase_request_items ALTER COLUMN status TYPE "PurchaseRequestItemStatus" USING status::"PurchaseRequestItemStatus";
ALTER TABLE purchase_request_items ALTER COLUMN status SET DEFAULT 'pending'::"PurchaseRequestItemStatus";

-- lark_sync_log.direction (no default)
ALTER TABLE lark_sync_log ALTER COLUMN direction TYPE "SyncDirection" USING direction::"SyncDirection";

-- lark_sync_log.status
ALTER TABLE lark_sync_log ALTER COLUMN status DROP DEFAULT;
ALTER TABLE lark_sync_log ALTER COLUMN status TYPE "SyncStatus" USING status::"SyncStatus";
ALTER TABLE lark_sync_log ALTER COLUMN status SET DEFAULT 'success'::"SyncStatus";

-- Done!
SELECT 'All enum types converted successfully!' AS result;
