# Architecture Decision Records (ADR) / Hồ sơ Quyết định Kiến trúc

This directory contains the Architecture Decision Records for VietERP, documenting critical technical decisions and their trade-offs.

Thư mục này chứa các Hồ sơ Quyết định Kiến trúc cho VietERP, ghi lại các quyết định kỹ thuật quan trọng và sự cân bằng của chúng.

## Index / Mục lục

| ADR | Title / Tiêu đề | Status / Trạng thái | Date / Ngày |
|-----|-----------------|-------------------|-----------|
| [001](001-monorepo-with-npm-workspaces.md) | Monorepo with npm Workspaces + Turborepo | Accepted | 2026-03-29 |
| [002](002-nextjs-for-web-apps.md) | Next.js 14+ for Web Applications | Accepted | 2026-03-29 |
| [003](003-prisma-orm.md) | Prisma ORM for Data Access | Accepted | 2026-03-29 |
| [004](004-nats-jetstream-events.md) | NATS JetStream for Event Streaming | Accepted | 2026-03-29 |
| [005](005-keycloak-sso.md) | Keycloak for Identity and Access Management | Accepted | 2026-03-29 |
| [006](006-kong-api-gateway.md) | Kong Gateway for API Routing | Accepted | 2026-03-29 |
| [007](007-postgresql-primary-database.md) | PostgreSQL 16 as Primary Database | Accepted | 2026-03-29 |
| [008](008-terraform-multi-cloud.md) | Terraform for Multi-Cloud Infrastructure | Accepted | 2026-03-29 |
| [009](009-helm-kubernetes-deployment.md) | Helm Charts for Kubernetes Deployment | Accepted | 2026-03-29 |
| [010](010-vietnamese-market-compliance.md) | Vietnamese Market Compliance Built-In | Accepted | 2026-03-29 |

## ADR Process / Quy trình ADR

1. **Initiation / Khởi tạo**: Identify architectural decision and create ADR draft
2. **Discussion / Thảo luận**: Present to core team for feedback
3. **Decision / Quyết định**: Core team votes and reaches consensus
4. **Documentation / Tài liệu hóa**: Record decision with context and consequences
5. **Communication / Giao tiếp**: Communicate to team and stakeholders

## How to Add a New ADR / Cách thêm ADR mới

1. Create new file: `NNN-title-in-kebab-case.md`
2. Use template from any existing ADR
3. Assign next sequential number
4. Add entry to table above
5. Open pull request for review
6. Record decision date once accepted

---

**Người phụ trách / Owner**: VietERP Core Team
**Lần cập nhật cuối / Last Updated**: 2026-03-29
