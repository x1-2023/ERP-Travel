# ADR-003: Prisma ORM for Data Access

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP requires a data access layer that:
- Handles 970+ database models spanning 14+ modules
- Supports multiple schema namespaces (accounting, crm, inventory, etc.)
- Provides type-safe queries without runtime errors
- Manages migrations across multi-tenant PostgreSQL instances
- Handles Vietnamese text search and collation
- Supports complex joins across 50,000+ daily transactions
- Enables rapid schema evolution with generated types

VietERP yêu cầu một lớp truy cập dữ liệu:
- Xử lý 970+ mô hình cơ sở dữ liệu trên 14+ mô-đun
- Hỗ trợ không gian tên lược đồ nhiều (kế toán, crm, hàng tồn kho, v.v.)
- Cung cấp các truy vấn an toàn kiểu mà không có lỗi runtime
- Quản lý di chuyển trên các phiên bản PostgreSQL đa thuê
- Xử lý tìm kiếm văn bản và đối chiếu tiếng Việt
- Hỗ trợ các phép nối phức tạp trên 50.000+ giao dịch hàng ngày
- Cho phép phát triển lược đồ nhanh chóng với các kiểu được tạo

Prisma offers schema-as-code, type generation, and powerful migrations.

## Quyết định / Decision

**Adopt Prisma ORM (v5.x)** as the primary data access and ORM solution for VietERP.

Áp dụng **Prisma ORM (v5.x)** làm giải pháp truy cập dữ liệu và ORM chính cho VietERP.

**Configuration**:
- Prisma schema per module (or shared schema with namespaces)
- PostgreSQL as primary database provider
- Prisma Client for type-safe queries
- Prisma Migrate for schema versioning
- Prisma Studio for local data inspection
- Generated TypeScript types for all models

**Cấu hình**:
- Lược đồ Prisma cho mỗi mô-đun (hoặc lược đồ chia sẻ với không gian tên)
- PostgreSQL làm nhà cung cấp cơ sở dữ liệu chính
- Prisma Client cho các truy vấn an toàn kiểu
- Prisma Migrate cho phiên bản lược đồ
- Prisma Studio để kiểm tra dữ liệu cục bộ
- Các kiểu TypeScript được tạo cho tất cả các mô hình

## Phương án thay thế / Alternatives Considered

### TypeORM
- Pros: Decorator-based, mature, flexible relations
- Cons: Heavier, requires `reflect-metadata`, less type-safe
- **Rejected**: Prisma's type generation superior; TypeORM verbosity not needed

### Drizzle
- Pros: Lightweight, SQL builder, emerging ecosystem
- Cons: Younger project, smaller community, fewer tools (no Studio equivalent)
- **Rejected**: Prisma maturity and migrations essential for VietERP scale

### Kysely
- Pros: Type-safe SQL, composable queries, lightweight
- Cons: Lower-level API, manual migration management
- **Rejected**: Prisma's schema-driven approach better for rapid development

### Raw SQL + Custom Query Builder
- Pros: Maximum control, minimal abstraction
- Cons: No type safety, SQL injection risk, manual migration tracking
- **Rejected**: VietERP scale demands ORM features

## Hệ quả / Consequences

### Tích cực / Positive

1. **Type-Safe Queries**: Prisma generates TypeScript types from schema; catch errors at build-time
   - Truy vấn an toàn kiểu: Prisma tạo kiểu TypeScript từ lược đồ
2. **Automatic Migrations**: Prisma Migrate handles schema changes with versions
   - Di chuyển tự động: Prisma Migrate xử lý các thay đổi lược đồ
3. **Generated Client**: `PrismaClient` with IntelliSense for all models and relations
   - Khách hàng được tạo: `PrismaClient` với IntelliSense
4. **Schema Namespacing**: Can organize 970+ models with prefixes or separate files
   - Không gian tên lược đồ: Tổ chức 970+ mô hình
5. **Developer Experience**: Prisma Studio, VS Code extension, excellent docs
   - Trải nghiệm nhà phát triển: Prisma Studio, phần mở rộng VS Code
6. **Relation Queries**: Nested selects, lazy loads, batch operations
   - Truy vấn quan hệ: Chọn lựa lồng nhau, tải lười biếng

### Tiêu cực / Negative

1. **Vendor Lock-in**: Prisma schema only works with Prisma (migration to raw SQL hard)
   - Khóa nhà cung cấp: Lược đồ Prisma chỉ hoạt động với Prisma
2. **Complex Queries**: Some advanced SQL patterns require `prisma.$queryRaw()`
   - Truy vấn phức tạp: Một số mẫu SQL nâng cao yêu cầu `$queryRaw()`
3. **Query Performance**: Lazy loading can cause N+1 queries (mitigated by `include`/`select`)
   - Hiệu suất truy vấn: Tải lười biếng có thể gây ra truy vấn N+1
4. **Schema Migration Merge Conflicts**: Multi-developer schema changes require conflict resolution
   - Xung đột hợp nhất di chuyển lược đồ: Thay đổi lược đồ đa nhà phát triển
5. **Deployment Complexity**: Migrations must run before app startup (or app fails)
   - Độ phức tạp triển khai: Di chuyển phải chạy trước khi ứng dụng khởi động

## Tham khảo / References

- [Prisma Official Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
- [PostgreSQL Full-Text Search with Prisma](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#fulltext-search)
- VietERP Models: `apps/accounting/prisma`, `apps/crm/prisma`, etc.

---

**Ảnh hưởng đến / Impacts**:
- Data Access Layer Architecture
- Database Migration Strategy
- Type Safety Across Modules
- Performance Optimization Techniques
