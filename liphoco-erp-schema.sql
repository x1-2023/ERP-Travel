-- ============================================================
-- LIPHOCO ERP — PostgreSQL Database Schema
-- Package: master-data + MRP
-- Version: 1.0.0
-- Date: 2026-03-28
-- ============================================================
-- Chạy: psql -U erp -d liphoco_dev -f schema.sql
-- Hoặc trong VietERP: npm run db:push
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Full-text search tiếng Việt

-- ============================================================
-- 1. MASTER DATA — Danh mục nền tảng
-- ============================================================

-- ─── 1.1 Công ty ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,           -- 'LP'
    name VARCHAR(200) NOT NULL,                  -- 'LIPHOCO'
    legal_name VARCHAR(500),                     -- 'Công ty TNHH Cơ Khí Linh Phong'
    tax_code VARCHAR(20),                        -- MST
    currency VARCHAR(3) DEFAULT 'VND',
    country VARCHAR(50) DEFAULT 'Vietnam',
    domain VARCHAR(50) DEFAULT 'Manufacturing',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 1.2 Nhóm vật tư (Item Groups) ──────────────────────────
-- Cấu trúc cây: All → Raw Material → Thép ống, Thép tấm...
CREATE TABLE IF NOT EXISTS item_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,           -- 'Thép ống (Steel Tube)'
    parent_group VARCHAR(200),                   -- 'Raw Material'
    is_group BOOLEAN DEFAULT FALSE,              -- TRUE = có con
    level INTEGER DEFAULT 0,                     -- 0=root, 1=parent, 2=child
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Lark Base sync
    lark_record_id VARCHAR(50),
    lark_synced_at TIMESTAMPTZ
);

-- ─── 1.3 Đơn vị tính (UOM) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS uom (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,            -- 'Kg', 'Meter', 'Nos', 'Set'
    name_vi VARCHAR(100),                        -- 'Kilogram', 'Mét', 'Cái', 'Bộ'
    name_en VARCHAR(100)
);

-- ─── 1.4 Vật tư / Sản phẩm (Items) ──────────────────────────
-- Bảng chính: NVL + Bán thành phẩm + Thành phẩm
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) NOT NULL UNIQUE,       -- 'TUBE-S355-48.3x3.2'
    item_name VARCHAR(500) NOT NULL,             -- 'Ống thép S355 OD48.3x3.2mm'
    item_group VARCHAR(200) NOT NULL REFERENCES item_groups(name),
    uom VARCHAR(20) NOT NULL REFERENCES uom(code),
    description TEXT,
    
    -- Phân loại
    item_type VARCHAR(20) DEFAULT 'raw_material' 
        CHECK (item_type IN ('raw_material', 'sub_assembly', 'finished_good', 'consumable')),
    maintain_stock BOOLEAN DEFAULT TRUE,
    include_in_manufacturing BOOLEAN DEFAULT TRUE,
    
    -- Giá
    valuation_rate DECIMAL(15,2) DEFAULT 0,      -- VNĐ/UOM (giá nhập)
    standard_rate DECIMAL(15,2) DEFAULT 0,       -- VNĐ/UOM (giá bán)
    
    -- Kho mặc định
    default_warehouse UUID,
    
    -- ERP cũ (MISA) mapping
    erp_code VARCHAR(100),                       -- Mã NVL ERP MISA: 'THSS400-80X80X4X6000MM'
    erp_ref VARCHAR(100),                        -- Mã REF
    
    -- Thông số kỹ thuật (cho NVL thép)
    material_grade VARCHAR(50),                  -- 'S355', 'S235', 'Q235'
    thickness_mm DECIMAL(8,2),                   -- Dày (mm)
    outer_diameter_mm DECIMAL(8,2),              -- Đường kính ngoài (mm) - cho ống
    width_mm DECIMAL(8,2),                       -- Rộng (mm) - cho hộp/tấm
    height_mm DECIMAL(8,2),                      -- Cao (mm) - cho hộp
    length_mm DECIMAL(10,2),                     -- Dài tiêu chuẩn (mm)
    weight_per_meter DECIMAL(10,4),              -- kg/m (cho ống/hộp)
    weight_per_unit DECIMAL(10,4),               -- kg/cái (cho phụ kiện)
    
    -- Metadata
    hs_code VARCHAR(20),                         -- '7308.90.99'
    country_of_origin VARCHAR(50) DEFAULT 'Vietnam',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Lark Base sync
    lark_record_id VARCHAR(50),
    lark_synced_at TIMESTAMPTZ
);

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_items_code ON items(item_code);
CREATE INDEX idx_items_group ON items(item_group);
CREATE INDEX idx_items_type ON items(item_type);
CREATE INDEX idx_items_erp_code ON items(erp_code);
CREATE INDEX idx_items_search ON items USING gin(item_name gin_trgm_ops);

-- ============================================================
-- 2. WAREHOUSE — Quản lý kho
-- ============================================================

CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,           -- 'Kho NVL Xưởng 2'
    code VARCHAR(20),                            -- 'WH-NVL-X2'
    parent_warehouse UUID REFERENCES warehouses(id),
    is_group BOOLEAN DEFAULT FALSE,
    company_id UUID REFERENCES companies(id),
    warehouse_type VARCHAR(30) DEFAULT 'storage'
        CHECK (warehouse_type IN ('storage', 'wip', 'finished', 'shipping', 'scrap')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    lark_record_id VARCHAR(50)
);

-- ─── Tồn kho ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    posting_time TIME NOT NULL DEFAULT CURRENT_TIME,
    qty_change DECIMAL(15,4) NOT NULL,           -- +nhập / -xuất
    valuation_rate DECIMAL(15,2),
    voucher_type VARCHAR(50),                    -- 'purchase_receipt', 'work_order', 'delivery_note'
    voucher_no VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- View: Tồn kho hiện tại
CREATE OR REPLACE VIEW stock_balance AS
SELECT 
    i.item_code,
    i.item_name,
    w.name AS warehouse,
    SUM(sl.qty_change) AS actual_qty,
    i.valuation_rate,
    SUM(sl.qty_change) * i.valuation_rate AS stock_value
FROM stock_ledger sl
JOIN items i ON sl.item_id = i.id
JOIN warehouses w ON sl.warehouse_id = w.id
GROUP BY i.item_code, i.item_name, w.name, i.valuation_rate
HAVING SUM(sl.qty_change) != 0;

-- ============================================================
-- 3. MANUFACTURING — Sản xuất
-- ============================================================

-- ─── 3.1 Workstations (Trạm sản xuất) ───────────────────────
CREATE TABLE IF NOT EXISTS workstations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,           -- 'Máy cắt Laser CNC'
    description TEXT,
    hour_rate DECIMAL(12,2) DEFAULT 0,           -- VNĐ/giờ
    production_capacity INTEGER DEFAULT 1,        -- Số sản phẩm song song
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3.2 Operations (Công đoạn) ─────────────────────────────
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,           -- 'Cắt Laser'
    workstation_id UUID REFERENCES workstations(id),
    default_time_mins INTEGER DEFAULT 0,          -- Thời gian chuẩn (phút)
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3.3 BOM (Bill of Materials) ─────────────────────────────
CREATE TABLE IF NOT EXISTS bom (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_no VARCHAR(30) NOT NULL UNIQUE,          -- 'BOM-CB-FRAME-M2-001'
    item_id UUID NOT NULL REFERENCES items(id),  -- Sản phẩm đích
    quantity DECIMAL(10,4) DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    with_operations BOOLEAN DEFAULT TRUE,
    
    -- Tính toán
    total_material_cost DECIMAL(15,2) DEFAULT 0,
    total_operation_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    lark_record_id VARCHAR(50)
);

-- ─── 3.4 BOM Items (NVL trong BOM) ──────────────────────────
CREATE TABLE IF NOT EXISTS bom_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_id UUID NOT NULL REFERENCES bom(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id),
    qty DECIMAL(15,4) NOT NULL,
    uom VARCHAR(20) REFERENCES uom(code),
    rate DECIMAL(15,2) DEFAULT 0,                -- VNĐ/UOM
    amount DECIMAL(15,2) DEFAULT 0,              -- qty × rate
    sort_order INTEGER DEFAULT 0,
    is_scrap BOOLEAN DEFAULT FALSE,              -- TRUE = phế liệu
    scrap_pct DECIMAL(5,2) DEFAULT 0             -- % hao hụt
);

-- ─── 3.5 BOM Operations (Công đoạn trong BOM) ───────────────
CREATE TABLE IF NOT EXISTS bom_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_id UUID NOT NULL REFERENCES bom(id) ON DELETE CASCADE,
    operation_id UUID NOT NULL REFERENCES operations(id),
    workstation_id UUID REFERENCES workstations(id),
    time_in_mins DECIMAL(10,2) DEFAULT 0,
    hour_rate DECIMAL(12,2) DEFAULT 0,
    operating_cost DECIMAL(15,2) DEFAULT 0,      -- time × rate
    sort_order INTEGER DEFAULT 0
);

-- ─── 3.6 Work Orders (Lệnh sản xuất) ────────────────────────
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wo_no VARCHAR(30) NOT NULL UNIQUE,           -- 'WO-2026-0001'
    bom_id UUID NOT NULL REFERENCES bom(id),
    item_id UUID NOT NULL REFERENCES items(id),
    qty_to_produce DECIMAL(10,4) NOT NULL,
    qty_produced DECIMAL(10,4) DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'in_progress', 'completed', 'cancelled')),
    
    planned_start DATE,
    planned_end DATE,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    
    -- Kho
    source_warehouse_id UUID REFERENCES warehouses(id),  -- NVL
    wip_warehouse_id UUID REFERENCES warehouses(id),     -- Bán thành phẩm
    target_warehouse_id UUID REFERENCES warehouses(id),  -- Thành phẩm
    
    -- Đơn hàng liên kết
    sales_order_ref VARCHAR(50),
    customer_name VARCHAR(200),
    
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    lark_record_id VARCHAR(50)
);

CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_dates ON work_orders(planned_start, planned_end);

-- ─── 3.7 Job Cards (Phiếu công việc) ────────────────────────
CREATE TABLE IF NOT EXISTS job_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_no VARCHAR(30) NOT NULL UNIQUE,          -- 'JC-2026-0001'
    work_order_id UUID NOT NULL REFERENCES work_orders(id),
    operation_id UUID NOT NULL REFERENCES operations(id),
    workstation_id UUID REFERENCES workstations(id),
    
    qty_to_produce DECIMAL(10,4),
    qty_completed DECIMAL(10,4) DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_in_mins DECIMAL(10,2) DEFAULT 0,
    
    worker_name VARCHAR(200),                    -- Tên công nhân
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. CRM — Quản lý khách hàng
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,            -- 'BALL', 'MPO', 'VEST'
    name VARCHAR(500) NOT NULL,                  -- 'Ballymore Company Inc.'
    country VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Pricing profile
    pricing_profile VARCHAR(30) DEFAULT 'new_customer'
        CHECK (pricing_profile IN ('ballymore', 'new_customer', 'dario_homy', 'richmond')),
    overhead_pct DECIMAL(5,2) DEFAULT 20,
    profit_pct DECIMAL(5,2) DEFAULT 10,
    
    -- Contacts
    primary_contact VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    
    -- Pipeline
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('lead', 'prospect', 'active', 'dormant', 'churned')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    lark_record_id VARCHAR(50)
);

-- ─── Contacts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    full_name VARCHAR(200) NOT NULL,
    title VARCHAR(100),                          -- 'Purchasing Manager'
    email VARCHAR(200),
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Deals / Quotations ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_no VARCHAR(30) NOT NULL UNIQUE,        -- 'QT-2026-0042'
    customer_id UUID REFERENCES customers(id),
    
    -- Sản phẩm
    item_id UUID REFERENCES items(id),
    item_description TEXT,
    quantity DECIMAL(10,2),
    weight_per_unit DECIMAL(10,4),               -- kg/pc
    total_weight DECIMAL(12,4),                  -- kg
    
    -- Giá
    production_cost_vnd DECIMAL(15,2),
    sell_price_vnd DECIMAL(15,2),
    sell_price_usd DECIMAL(12,2),
    price_per_kg_vnd DECIMAL(12,2),
    price_per_kg_usd DECIMAL(10,2),
    
    -- Trạng thái
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'negotiating', 'won', 'lost', 'expired')),
    
    valid_until DATE,
    notes TEXT,
    
    -- Costing breakdown (JSON cho linh hoạt)
    cost_breakdown JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    lark_record_id VARCHAR(50)
);

-- ============================================================
-- 5. PURCHASING — Mua hàng (YCMH Tân → Lệ)
-- ============================================================

CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_no VARCHAR(30) NOT NULL UNIQUE,           -- 'YCMH-SX-MPO-032'
    requested_by VARCHAR(100),                   -- 'Tân'
    approved_by VARCHAR(100),                    -- 'Lệ'
    
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'approved', 'ordered', 'received', 'cancelled')),
    
    work_order_ref VARCHAR(50),                  -- Liên kết lệnh SX
    required_date DATE,
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    lark_record_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS purchase_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    item_code VARCHAR(50),                       -- Fallback nếu chưa có trong items
    item_name VARCHAR(500),
    qty DECIMAL(15,4) NOT NULL,
    uom VARCHAR(20),
    required_date DATE,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
    supplier VARCHAR(200),
    po_number VARCHAR(50),
    remarks TEXT
);

-- ============================================================
-- 6. COSTING — Lịch sử tính giá (AI Copilot output)
-- ============================================================

CREATE TABLE IF NOT EXISTS costing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name VARCHAR(200),
    customer_id UUID REFERENCES customers(id),
    item_description TEXT,
    
    -- Input
    drawing_file_path TEXT,
    total_weight_kg DECIMAL(12,4),
    quantity INTEGER,
    surface_finish VARCHAR(30),                  -- 'powder_coat', 'hdg', 'electro_zinc'
    
    -- Output
    material_cost DECIMAL(15,2),
    fabrication_cost DECIMAL(15,2),
    surface_cost DECIMAL(15,2),
    packaging_fob_cost DECIMAL(15,2),
    production_cost DECIMAL(15,2),
    overhead DECIMAL(15,2),
    profit DECIMAL(15,2),
    sell_price_vnd DECIMAL(15,2),
    sell_price_usd DECIMAL(12,2),
    price_per_kg DECIMAL(10,2),
    
    -- Full breakdown
    bom_data JSONB,                              -- BOM chi tiết
    cost_breakdown JSONB,                        -- Phân tích giá
    
    -- Pricing profile used
    pricing_profile VARCHAR(30),
    exchange_rate DECIMAL(10,2) DEFAULT 24500,
    
    calculated_by VARCHAR(50) DEFAULT 'ai_copilot',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lark_record_id VARCHAR(50)
);

-- ============================================================
-- 7. LARK SYNC — Bảng theo dõi đồng bộ
-- ============================================================

CREATE TABLE IF NOT EXISTS lark_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    lark_record_id VARCHAR(50),
    direction VARCHAR(10) NOT NULL               -- 'to_lark' hoặc 'from_lark'
        CHECK (direction IN ('to_lark', 'from_lark')),
    status VARCHAR(20) DEFAULT 'success'
        CHECK (status IN ('success', 'failed', 'pending')),
    payload JSONB,
    error_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_table ON lark_sync_log(table_name, record_id);

-- ============================================================
-- 8. SEED DATA — Dữ liệu khởi tạo từ CSV
-- ============================================================

-- 8.1 Company
INSERT INTO companies (code, name, legal_name, tax_code, currency, country, domain)
VALUES ('LP', 'LIPHOCO', 'Công ty TNHH Cơ Khí Linh Phong', '1101628380', 'VND', 'Vietnam', 'Manufacturing')
ON CONFLICT (code) DO NOTHING;

-- 8.2 UOM
INSERT INTO uom (code, name_vi, name_en) VALUES
    ('Kg', 'Kilogram', 'Kilogram'),
    ('Meter', 'Mét', 'Meter'),
    ('Nos', 'Cái', 'Number'),
    ('Set', 'Bộ', 'Set'),
    ('Liter', 'Lít', 'Liter'),
    ('Roll', 'Cuộn', 'Roll')
ON CONFLICT (code) DO NOTHING;

-- 8.3 Item Groups (from CSV 01a + 01b)
INSERT INTO item_groups (name, parent_group, is_group, level) VALUES
    -- Level 1 (parents)
    ('Raw Material', 'All Item Groups', TRUE, 1),
    ('Sub Assembly', 'All Item Groups', TRUE, 1),
    ('Finished Good', 'All Item Groups', TRUE, 1),
    ('Consumable', 'All Item Groups', TRUE, 1),
    -- Level 2 (children) - Raw Material
    ('Thép ống (Steel Tube)', 'Raw Material', FALSE, 2),
    ('Thép tấm (Steel Plate)', 'Raw Material', FALSE, 2),
    ('Thép hình (Steel Profile)', 'Raw Material', FALSE, 2),
    ('Kẽm (Zinc)', 'Raw Material', FALSE, 2),
    ('Sơn tĩnh điện (Powder Coat)', 'Raw Material', FALSE, 2),
    ('Phụ kiện (Hardware)', 'Raw Material', FALSE, 2),
    ('Nhựa (Plastic)', 'Raw Material', FALSE, 2),
    -- Level 2 (children) - Sub Assembly
    ('Cow Box Frame', 'Sub Assembly', FALSE, 2),
    ('Cow Box Gate', 'Sub Assembly', FALSE, 2),
    ('Cow Box Feeder', 'Sub Assembly', FALSE, 2),
    ('Cow Box Partition', 'Sub Assembly', FALSE, 2),
    -- Level 2 (children) - Finished Good
    ('Cow Box Complete', 'Finished Good', FALSE, 2),
    ('Scaffolding', 'Finished Good', FALSE, 2),
    ('Material Handling', 'Finished Good', FALSE, 2)
ON CONFLICT (name) DO NOTHING;

-- 8.4 Workstations (from 04_setup_manufacturing.sh)
INSERT INTO workstations (name, description, hour_rate, production_capacity) VALUES
    ('Máy cắt Laser CNC', 'Cắt thép tấm và ống theo bản vẽ DXF', 500000, 1),
    ('Máy uốn ống CNC', 'Uốn ống thép theo góc và bán kính', 300000, 1),
    ('Robot hàn', 'Hàn MIG/MAG tự động', 400000, 2),
    ('Trạm hàn tay', 'Hàn thủ công cho chi tiết phức tạp', 200000, 4),
    ('Dây chuyền mạ kẽm HDG', 'Hot-dip Galvanizing (HDG) theo ISO 1461', 600000, 1),
    ('Buồng sơn tĩnh điện', 'Powder coating line sấy 200°C', 350000, 1),
    ('Trạm lắp ráp', 'Lắp ráp thành phẩm', 150000, 3),
    ('Trạm đóng gói', 'Đóng gói xuất khẩu container', 100000, 2),
    ('Trạm QC', 'Kiểm tra chất lượng theo checklist', 150000, 2)
ON CONFLICT (name) DO NOTHING;

-- 8.5 Operations (from CSV 02)
INSERT INTO operations (name, workstation_id, default_time_mins, description)
SELECT v.name, w.id, v.time_mins, v.description
FROM (VALUES
    ('Cắt Laser', 'Máy cắt Laser CNC', 30, 'Cắt thép tấm theo bản vẽ DXF'),
    ('Cắt ống', 'Máy cắt Laser CNC', 15, 'Cắt ống thép theo chiều dài yêu cầu'),
    ('Uốn ống', 'Máy uốn ống CNC', 20, 'Uốn ống thép theo góc và bán kính thiết kế'),
    ('Hàn Robot', 'Robot hàn', 45, 'Hàn MIG/MAG tự động cho mối hàn chuẩn'),
    ('Hàn tay', 'Trạm hàn tay', 60, 'Hàn thủ công cho chi tiết phức tạp'),
    ('Mạ kẽm HDG', 'Dây chuyền mạ kẽm HDG', 120, 'Mạ kẽm nhúng nóng theo ISO 1461'),
    ('Sơn tĩnh điện', 'Buồng sơn tĩnh điện', 90, 'Phun sơn bột tĩnh điện sấy 200°C'),
    ('Lắp ráp', 'Trạm lắp ráp', 60, 'Lắp ráp cụm chi tiết thành sản phẩm'),
    ('Đóng gói', 'Trạm đóng gói', 30, 'Đóng gói xuất khẩu container'),
    ('QC kiểm tra', 'Trạm QC', 15, 'Kiểm tra chất lượng theo checklist')
) AS v(name, ws_name, time_mins, description)
JOIN workstations w ON w.name = v.ws_name
ON CONFLICT (name) DO NOTHING;

-- 8.6 Warehouses (Xưởng 2)
INSERT INTO warehouses (name, code, warehouse_type) VALUES
    ('Kho NVL Xưởng 2', 'WH-NVL-X2', 'storage'),
    ('Kho bán thành phẩm X2', 'WH-WIP-X2', 'wip'),
    ('Kho thành phẩm X2', 'WH-FG-X2', 'finished'),
    ('Kho xuất hàng X2', 'WH-SHIP-X2', 'shipping'),
    ('Kho phế liệu X2', 'WH-SCRAP-X2', 'scrap')
ON CONFLICT (name) DO NOTHING;

-- 8.7 Items (from CSV 03 — 37 items)
INSERT INTO items (item_code, item_name, item_group, uom, valuation_rate, description, item_type, include_in_manufacturing) VALUES
    -- Raw Materials - Thép ống
    ('TUBE-S355-48.3x3.2', 'Ống thép S355 OD48.3x3.2mm', 'Thép ống (Steel Tube)', 'Meter', 85000, 'Ống thép kết cấu S355 đường kính ngoài 48.3mm dày 3.2mm', 'raw_material', TRUE),
    ('TUBE-S355-60.3x3.2', 'Ống thép S355 OD60.3x3.2mm', 'Thép ống (Steel Tube)', 'Meter', 105000, 'Ống thép kết cấu S355 đường kính ngoài 60.3mm dày 3.2mm', 'raw_material', TRUE),
    ('TUBE-S355-76.1x3.6', 'Ống thép S355 OD76.1x3.6mm', 'Thép ống (Steel Tube)', 'Meter', 135000, 'Ống thép kết cấu S355 đường kính ngoài 76.1mm dày 3.6mm', 'raw_material', TRUE),
    ('TUBE-Q235-40x40x2.5', 'Ống vuông Q235 40x40x2.5mm', 'Thép ống (Steel Tube)', 'Meter', 55000, 'Ống thép vuông 40x40mm dày 2.5mm', 'raw_material', TRUE),
    ('TUBE-Q235-50x50x3', 'Ống vuông Q235 50x50x3mm', 'Thép ống (Steel Tube)', 'Meter', 72000, 'Ống thép vuông 50x50mm dày 3mm', 'raw_material', TRUE),
    -- Raw Materials - Thép tấm
    ('PLATE-S235-2mm', 'Thép tấm S235 dày 2mm', 'Thép tấm (Steel Plate)', 'Kg', 18000, 'Thép tấm cán nóng S235 dày 2mm', 'raw_material', TRUE),
    ('PLATE-S235-3mm', 'Thép tấm S235 dày 3mm', 'Thép tấm (Steel Plate)', 'Kg', 18000, 'Thép tấm cán nóng S235 dày 3mm', 'raw_material', TRUE),
    ('PLATE-S235-5mm', 'Thép tấm S235 dày 5mm', 'Thép tấm (Steel Plate)', 'Kg', 18000, 'Thép tấm cán nóng S235 dày 5mm', 'raw_material', TRUE),
    ('PLATE-S235-8mm', 'Thép tấm S235 dày 8mm', 'Thép tấm (Steel Plate)', 'Kg', 18500, 'Thép tấm cán nóng S235 dày 8mm', 'raw_material', TRUE),
    ('PLATE-GALV-2mm', 'Thép tấm mạ kẽm dày 2mm', 'Thép tấm (Steel Plate)', 'Kg', 20000, 'Thép tấm mạ kẽm dày 2mm', 'raw_material', TRUE),
    -- Raw Materials - Thép hình
    ('ANGLE-S235-50x50x5', 'Thép góc L50x50x5mm', 'Thép hình (Steel Profile)', 'Meter', 42000, 'Thép hình chữ L 50x50x5mm', 'raw_material', TRUE),
    ('CHANNEL-100', 'Thép chữ C 100mm', 'Thép hình (Steel Profile)', 'Meter', 68000, 'Thép hình chữ C cao 100mm', 'raw_material', TRUE),
    -- Raw Materials - Kẽm + Sơn
    ('ZINC-HDG', 'Kẽm mạ nhúng nóng', 'Kẽm (Zinc)', 'Kg', 65000, 'Kẽm nguyên liệu cho dây chuyền HDG', 'raw_material', TRUE),
    ('POWDER-RAL7016', 'Sơn tĩnh điện RAL7016 Anthracite', 'Sơn tĩnh điện (Powder Coat)', 'Kg', 80000, 'Bột sơn tĩnh điện màu xám anthracite RAL7016', 'raw_material', TRUE),
    ('POWDER-RAL9005', 'Sơn tĩnh điện RAL9005 Black', 'Sơn tĩnh điện (Powder Coat)', 'Kg', 80000, 'Bột sơn tĩnh điện màu đen RAL9005', 'raw_material', TRUE),
    ('POWDER-RAL6005', 'Sơn tĩnh điện RAL6005 Green', 'Sơn tĩnh điện (Powder Coat)', 'Kg', 80000, 'Bột sơn tĩnh điện màu xanh lá RAL6005', 'raw_material', TRUE),
    -- Raw Materials - Phụ kiện
    ('BOLT-M10x30-HDG', 'Bu lông M10x30 mạ kẽm', 'Phụ kiện (Hardware)', 'Nos', 3500, 'Bu lông lục giác M10 dài 30mm mạ kẽm', 'raw_material', TRUE),
    ('BOLT-M12x40-HDG', 'Bu lông M12x40 mạ kẽm', 'Phụ kiện (Hardware)', 'Nos', 5500, 'Bu lông lục giác M12 dài 40mm mạ kẽm', 'raw_material', TRUE),
    ('BOLT-M16x50-HDG', 'Bu lông M16x50 mạ kẽm', 'Phụ kiện (Hardware)', 'Nos', 8500, 'Bu lông lục giác M16 dài 50mm mạ kẽm', 'raw_material', TRUE),
    ('NUT-M10-HDG', 'Đai ốc M10 mạ kẽm', 'Phụ kiện (Hardware)', 'Nos', 1500, 'Đai ốc lục giác M10 mạ kẽm', 'raw_material', TRUE),
    ('NUT-M12-HDG', 'Đai ốc M12 mạ kẽm', 'Phụ kiện (Hardware)', 'Nos', 2000, 'Đai ốc lục giác M12 mạ kẽm', 'raw_material', TRUE),
    ('NUT-M16-HDG', 'Đai ốc M16 mạ kẽm', 'Phụ kiện (Hardware)', 'Nos', 3000, 'Đai ốc lục giác M16 mạ kẽm', 'raw_material', TRUE),
    ('WASHER-M12-HDG', 'Long đền M12 mạ kẽm', 'Phụ kiện (Hardware)', 'Nos', 800, 'Long đền phẳng M12 mạ kẽm', 'raw_material', TRUE),
    ('HINGE-HEAVY-150', 'Bản lề nặng 150mm', 'Phụ kiện (Hardware)', 'Nos', 25000, 'Bản lề công nghiệp nặng 150mm mạ kẽm', 'raw_material', TRUE),
    ('LATCH-GATE-STD', 'Chốt cửa chuồng tiêu chuẩn', 'Phụ kiện (Hardware)', 'Nos', 35000, 'Chốt khóa cửa chuồng bò tiêu chuẩn', 'raw_material', TRUE),
    -- Raw Materials - Nhựa
    ('RUBBER-PAD-50x50', 'Đệm cao su 50x50x10mm', 'Nhựa (Plastic)', 'Nos', 5000, 'Đệm cao su chống va đập 50x50x10mm', 'raw_material', TRUE),
    -- Sub Assemblies
    ('CB-FRAME-M1', 'Khung chính Cow Box M1', 'Cow Box Frame', 'Nos', 0, 'Khung chính chuồng bò model M1 (1.2m)', 'sub_assembly', TRUE),
    ('CB-FRAME-M2', 'Khung chính Cow Box M2', 'Cow Box Frame', 'Nos', 0, 'Khung chính chuồng bò model M2 (1.5m) - MPO standard', 'sub_assembly', TRUE),
    ('CB-FRAME-M3', 'Khung chính Cow Box M3', 'Cow Box Frame', 'Nos', 0, 'Khung chính chuồng bò model M3 (1.8m)', 'sub_assembly', TRUE),
    ('CB-GATE-STD', 'Cửa Cow Box tiêu chuẩn', 'Cow Box Gate', 'Nos', 0, 'Cửa chuồng bò loại tiêu chuẩn có chốt khóa', 'sub_assembly', TRUE),
    ('CB-GATE-SWING', 'Cửa Cow Box xoay', 'Cow Box Gate', 'Nos', 0, 'Cửa chuồng bò loại xoay 2 chiều', 'sub_assembly', TRUE),
    ('CB-FEEDER-1.2M', 'Máng ăn Cow Box 1.2m', 'Cow Box Feeder', 'Nos', 0, 'Máng ăn thép mạ kẽm dài 1.2m', 'sub_assembly', TRUE),
    ('CB-FEEDER-1.5M', 'Máng ăn Cow Box 1.5m', 'Cow Box Feeder', 'Nos', 0, 'Máng ăn thép mạ kẽm dài 1.5m', 'sub_assembly', TRUE),
    ('CB-PARTITION-STD', 'Vách ngăn Cow Box tiêu chuẩn', 'Cow Box Partition', 'Nos', 0, 'Vách ngăn giữa các ô chuồng', 'sub_assembly', TRUE),
    -- Finished Goods
    ('CB-M1-COMPLETE', 'Cow Box M1 Complete Set (1.2m)', 'Cow Box Complete', 'Set', 0, 'Bộ chuồng bò hoàn chỉnh model M1', 'finished_good', TRUE),
    ('CB-M2-COMPLETE', 'Cow Box M2 Complete Set (1.5m)', 'Cow Box Complete', 'Set', 0, 'Bộ chuồng bò hoàn chỉnh model M2 - C22 order MPO B.V.', 'finished_good', TRUE),
    ('CB-M3-COMPLETE', 'Cow Box M3 Complete Set (1.8m)', 'Cow Box Complete', 'Set', 0, 'Bộ chuồng bò hoàn chỉnh model M3', 'finished_good', TRUE)
ON CONFLICT (item_code) DO NOTHING;

-- 8.8 Customers (key accounts)
INSERT INTO customers (code, name, country, currency, pricing_profile, overhead_pct, profit_pct, primary_contact, email) VALUES
    ('BALL', 'Ballymore Company Inc.', 'United States', 'USD', 'ballymore', 15, 5, 'Liz Williams', 'liz@ballymore.com'),
    ('MPO', 'MPO B.V.', 'Netherlands', 'EUR', 'new_customer', 20, 10, 'Mr. Eddy', 'eddy@mpo.nl'),
    ('VEST', 'Vestil Manufacturing', 'United States', 'USD', 'new_customer', 20, 10, NULL, NULL),
    ('RICH', 'Richmond Wheel & Castor', 'Australia', 'AUD', 'richmond', 25, 0, 'Chris Schulz', 'chris@richmond.com.au'),
    ('DARI', 'Dario / Homy.build', 'EU/Mexico', 'USD', 'dario_homy', 0, 0, 'Dario', NULL),
    ('EART', 'Earthwise', 'United States', 'USD', 'new_customer', 20, 10, NULL, NULL),
    ('CLAS', 'Clas Ohlson', 'Sweden', 'EUR', 'new_customer', 20, 10, NULL, NULL),
    ('TABG', 'TabGulf', 'UAE', 'USD', 'new_customer', 20, 10, NULL, NULL),
    ('UBT', 'UBT Australia', 'Australia', 'AUD', 'new_customer', 20, 10, NULL, NULL)
ON CONFLICT (code) DO NOTHING;

-- 8.9 Sample BOM: CB-FRAME-M2
INSERT INTO bom (bom_no, item_id, quantity, is_active, is_default, with_operations, company_id)
SELECT 'BOM-CB-FRAME-M2-001', i.id, 1, TRUE, TRUE, TRUE, c.id
FROM items i, companies c
WHERE i.item_code = 'CB-FRAME-M2' AND c.code = 'LP'
ON CONFLICT (bom_no) DO NOTHING;

-- ============================================================
-- DONE! Verify:
-- SELECT COUNT(*) FROM items;         -- 37
-- SELECT COUNT(*) FROM item_groups;   -- 18
-- SELECT COUNT(*) FROM operations;    -- 10
-- SELECT COUNT(*) FROM workstations;  -- 9
-- SELECT COUNT(*) FROM warehouses;    -- 5
-- SELECT COUNT(*) FROM customers;     -- 9
-- ============================================================
