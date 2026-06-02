# ADR-001: Monorepo with npm Workspaces + Turborepo

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP is a complex, multi-module enterprise resource planning system with:
- 14 distinct applications (CRM, Accounting, HRM, Inventory, Ecommerce, etc.)
- Significant shared code (utilities, UI components, types, validations)
- Need for coordinated versioning and releases
- High dependency on internal packages
- Multiple development teams working in parallel

VietERP là một hệ thống lập kế hoạch tài nguyên doanh nghiệp phức tạp, đa mô-đun với:
- 14 ứng dụng riêng biệt (CRM, Kế toán, HRM, Quản lý tồn kho, Ecommerce, v.v.)
- Lượng lớn mã chia sẻ (tiện ích, thành phần UI, kiểu, xác thực)
- Cần phối hợp phiên bản và phát hành
- Phụ thuộc cao vào các gói nội bộ
- Nhiều đội phát triển làm việc song song

Monorepo structure enables unified dependency management and simplifies cross-module development.

## Quyết định / Decision

**Adopt npm Workspaces with Turborepo** as the monorepo strategy for VietERP.

Áp dụng **npm Workspaces với Turborepo** làm chiến lược monorepo cho VietERP.

**Configuration**:
- Root `package.json` with `"workspaces"` array
- Workspace structure: `apps/*`, `packages/*`, `tools/*`
- Turborepo for task orchestration and caching
- Shared `tsconfig.json`, `.eslintrc`, prettier config
- Unified CI pipeline with single source of truth

**Cấu hình**:
- Root `package.json` với mảng `"workspaces"`
- Cấu trúc workspace: `apps/*`, `packages/*`, `tools/*`
- Turborepo để điều phối nhiệm vụ và bộ nhớ đệm
- Cấu hình `tsconfig.json`, `.eslintrc`, prettier chia sẻ
- Đường dẫn CI thống nhất với một nguồn sự thật

## Phương án thay thế / Alternatives Considered

### Lerna
- Pros: Mature, fine-grained version control
- Cons: Higher complexity, slower builds without caching
- **Rejected**: Turborepo's caching outweighs Lerna's versioning flexibility

### Nx
- Pros: Powerful task graph, plugins for many frameworks
- Cons: Steep learning curve, opinionated constraints
- **Rejected**: Added complexity not justified for VietERP's needs; npm Workspaces simpler

### Separate Repositories (Polyrepo)
- Pros: Independent versioning, separate deploy cycles
- Cons: Code duplication, complex shared code management, harder cross-module testing
- **Rejected**: VietERP has too much shared code; monorepo needed for DRY principle

### pnpm Workspaces
- Pros: Faster disk usage, strict hoisting rules
- Cons: Less mature in 2025, npm compatibility edge cases
- **Rejected**: npm workspaces mature and standard

## Hệ quả / Consequences

### Tích cực / Positive

1. **Unified Dependency Management**: Single `package-lock.json`, no version conflicts across modules
   - Quản lý phụ thuộc thống nhất: `package-lock.json` duy nhất, không xung đột phiên bản
2. **Code Reuse**: Shared packages (UI, utils, types) avoid duplication
   - Tái sử dụng mã: Các gói chia sẻ tránh trùng lặp
3. **Atomic Commits**: Cross-module changes in single commit, easier to trace
   - Commit nguyên tử: Thay đổi đa mô-đun trong một commit, dễ dàng theo dõi
4. **Faster CI with Turborepo Caching**: Skip unchanged modules, build only affected apps
   - CI nhanh hơn: Bỏ qua mô-đun không thay đổi, chỉ xây dựng ứng dụng bị ảnh hưởng
5. **Simplified Onboarding**: New developers clone once, understand full system
   - Onboarding đơn giản: Các nhà phát triển mới sao chép một lần, hiểu hệ thống hoàn chỉnh
6. **Refactoring Safety**: Easy to refactor shared code across all consumers
   - An toàn tái cấu trúc: Dễ dàng tái cấu trúc mã chia sẻ trên tất cả người tiêu dùng

### Tiêu cực / Negative

1. **Larger Repository Size**: ~500MB with full history (mitigated by shallow clones)
   - Kích thước kho lớn hơn: ~500MB với toàn bộ lịch sử
2. **Complex CI Setup**: Must configure Turborepo carefully to avoid cache invalidation
   - Cài đặt CI phức tạp: Phải cấu hình Turborepo cẩn thận
3. **Slower `npm install` at Scale**: Symlink resolution can be slow with 50+ packages
   - `npm install` chậm hơn: Giải quyết symlink có thể chậm
4. **All-or-Nothing Release**: Can't independently release one app without touching others
   - Phát hành tất cả hoặc không: Không thể phát hành độc lập một ứng dụng
5. **Merge Conflicts**: High concurrency can cause conflicts in shared config files
   - Xung đột hợp nhất: Đồng thời cao có thể gây ra xung đột trong tệp cấu hình chia sẻ

## Tham khảo / References

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Turborepo Official Docs](https://turbo.build/repo/docs)
- [Monorepo Best Practices](https://turbo.build/repo/docs/handbook)
- VietERP Package Structure: `apps/`, `packages/`, `tools/`

---

**Ảnh hưởng đến / Impacts**:
- CI/CD Pipeline Configuration
- Developer Workflow
- Dependency Management Strategy
- Build and Test Scripts
