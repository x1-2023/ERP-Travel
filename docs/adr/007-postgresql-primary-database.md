# ADR-007: PostgreSQL 16 as Primary Database

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP requires a primary relational database with:
- ACID compliance for financial transactions
- Support for 970+ models with complex relationships
- Vietnamese full-text search and proper collation
- JSON fields for semi-structured data (invoice items, custom fields)
- Computed columns and generated columns for derived data
- Row-level security for multi-tenant data isolation
- Jsonb operator support for nested document queries
- Materialized views for reporting and analytics
- Streaming replication for backups and failover
- Extensions: `uuid-ossp`, `unaccent`, `pgtrgm` for Vietnamese text handling

VietERP yêu cầu cơ sở dữ liệu quan hệ chính có:
- Tuân thủ ACID cho các giao dịch tài chính
- Hỗ trợ 970+ mô hình có quan hệ phức tạp
- Tìm kiếm toàn văn tiếng Việt và sắp xếp thích hợp
- Trường JSON cho dữ liệu bán cấu trúc
- Cột được tính toán và cột được tạo cho dữ liệu có nguồn gốc
- Bảo mật cấp hàng để cách ly dữ liệu đa thuê
- Hỗ trợ toán tử Jsonb cho các truy vấn tài liệu lồng nhau
- Chế độ xem được vật liệu hóa cho báo cáo và phân tích
- Sao chép luồng để sao lưu và chuyển đổi dự phòng

PostgreSQL provides all these with mature ecosystem and performance.

## Quyết định / Decision

**Adopt PostgreSQL 16** as the primary relational database for VietERP.

Áp dụng **PostgreSQL 16** làm cơ sở dữ liệu quan hệ chính cho VietERP.

**Configuration**:
- PostgreSQL 16.x (latest stable)
- `max_connections: 500` for multi-app cluster
- `shared_buffers: 25% RAM` for performance
- `effective_cache_size: 75% RAM`
- `random_page_cost: 1.1` (SSD tuning)
- Enable `ssl` for all connections
- WAL archiving for point-in-time recovery
- Streaming replication with 2+ standby replicas
- Schema per module or shared schema with role-based access
- Foreign keys, unique constraints, check constraints enforced
- Custom collation `vi_VN.UTF-8` for Vietnamese text
- Composite indexes on foreign keys and frequently filtered columns

**Cấu hình**:
- PostgreSQL 16.x (mới nhất ổn định)
- Kết nối SSL cho tất cả các kết nối
- Sao chép luồng với 2+ bản sao chờ
- Lược đồ cho mỗi mô-đun hoặc lược đồ chia sẻ
- Khoá ngoài, ràng buộc duy nhất, ràng buộc kiểm tra
- Sắp xếp tùy chỉnh `vi_VN.UTF-8` cho văn bản tiếng Việt

## Phương án thay thế / Alternatives Considered

### MySQL 8.0
- Pros: Fast, simpler setup, good JSON support
- Cons: Weaker ACID (before recent versions), less advanced features
- **Rejected**: PostgreSQL's row-level security, extensions essential for VietERP

### MongoDB
- Pros: Flexible schema, horizontal scaling, JSON-native
- Cons: No ACID transactions (limited), harder joins, not suited for relational data
- **Rejected**: VietERP's financial data requires strong ACID guarantees

### CockroachDB
- Pros: Distributed, ACID, PostgreSQL-compatible
- Cons: More complex operations, higher cost, overkill for initial single-region
- **Rejected**: Single-region PostgreSQL simpler; migrate to CockroachDB later if needed

### SQL Server
- Pros: Enterprise features, good ecosystem
- Cons: Windows-biased, licensing costs, less portable
- **Rejected**: PostgreSQL open-source, better multi-cloud support

## Hệ quả / Consequences

### Tích cực / Positive

1. **ACID Transactions**: Full compliance for financial consistency
   - Giao dịch ACID: Tuân thủ đầy đủ cho tính nhất quán tài chính
2. **Advanced Features**: CTEs, window functions, JSON operators, full-text search
   - Các tính năng nâng cao: CTE, hàm cửa sổ, toán tử JSON, tìm kiếm toàn văn
3. **Row-Level Security**: Multi-tenant data isolation without application logic
   - Bảo mật cấp hàng: Cách ly dữ liệu đa thuê
4. **Vietnamese Text Support**: `unaccent`, `pgtrgm` extensions for diacriticals
   - Hỗ trợ văn bản tiếng Việt: Tiện ích mở rộng cho dấu thanh
5. **Materialized Views**: Pre-computed reports, fast dashboards
   - Chế độ xem được vật liệu hóa: Báo cáo được tính toán trước
6. **Replication & HA**: Streaming replication, failover without downtime
   - Sao chép & HA: Sao chép luồng, chuyển đổi dự phòng không ngừng
7. **Cost**: Open source, no licensing fees
   - Chi phí: Mã nguồn mở, không có lệ phí cấp phép

### Tiêu cực / Negative

1. **Operational Complexity**: Requires DBA expertise for tuning, replication, backups
   - Độ phức tạp hoạt động: Yêu cầu kiến thức DBA
2. **Slower Writes at Scale**: Write-heavy workloads (100K+ writes/min) may need sharding
   - Ghi chậm hơn: Khối lượng công việc ghi nặng có thể cần phân chia
3. **Storage Overhead**: Table bloat from DELETE/UPDATE cycles (requires VACUUM)
   - Overhead lưu trữ: Bảng phình từ chu kỳ DELETE/UPDATE
4. **Learning Curve**: PostgreSQL-specific syntax, extensions, tuning parameters
   - Đường cong học tập: Cú pháp, tiện ích mở rộng cụ thể PostgreSQL
5. **Single Datacenter Limitations**: Streaming replication doesn't span distant regions
   - Hạn chế trung tâm dữ liệu duy nhất: Sao chép luồng không kéo dài các khu vực xa xôi

## Tham khảo / References

- [PostgreSQL Official Docs](https://www.postgresql.org/docs/16/)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/16/textsearch.html)
- [PostgreSQL JSON Types](https://www.postgresql.org/docs/16/datatype-json.html)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/16/ddl-rowsecurity.html)
- [PostgreSQL Replication Guide](https://www.postgresql.org/docs/16/warm-standby.html)
- VietERP Database: `viertp_prod`, `viertp_staging`

---

**Ảnh hưởng đến / Impacts**:
- Database Schema Design
- Query Optimization Strategy
- Backup and Recovery Procedures
- Multi-Tenancy Implementation
- Reporting and Analytics Architecture
