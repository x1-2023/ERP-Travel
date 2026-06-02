# Changelog / Nhật ký Thay đổi

All notable changes to VietERP Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Database documentation structure
- Migration guide for Prisma
- Enhanced CONTRIBUTING guide with detailed workflow
- Comprehensive SECURITY policy with responsible disclosure process
- Entity-Relationship diagram in Mermaid format
- Database schema documentation by module

### Changed
- Updated CONTRIBUTING.md with community-focused guidance
- Improved SECURITY.md with detailed response timeline and severity levels

### Fixed
- None yet

### Security
- Documented security measures and best practices
- Added severity classification for vulnerability reports
- Defined responsible disclosure process

---

## [2.0.0] - 2026-03-29

### Added - Phase 1-5 Integration

**Infrastructure & DevOps**
- ✅ Complete CI/CD pipeline (GitHub Actions)
- ✅ Multi-environment deployment (Dev, Staging, Prod)
- ✅ Docker & Kubernetes support with Helm charts
- ✅ Infrastructure as Code with Terraform
- ✅ Automated monitoring and alerting

**Database & ORM**
- ✅ PostgreSQL 16 with multi-schema architecture
- ✅ Prisma 5.0+ ORM with full type safety
- ✅ 14+ database schemas (one per module)
- ✅ Migration system with version control
- ✅ Audit logging and change tracking

**Testing & Quality**
- ✅ E2E tests with Playwright
- ✅ Unit tests with Vitest
- ✅ Integration tests
- ✅ Code coverage reporting (80%+ target)
- ✅ Performance testing

**Security**
- ✅ Keycloak SSO / OIDC integration
- ✅ Role-Based Access Control (RBAC)
- ✅ Row-Level Security (RLS)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS and security headers
- ✅ Input validation and sanitization
- ✅ Audit trail for all changes
- ✅ Multi-tenant data isolation
- ✅ Encryption at rest and in transit

**Monitoring & Observability**
- ✅ Centralized logging (ELK Stack)
- ✅ APM with New Relic
- ✅ Real-time alerting
- ✅ Performance metrics dashboard
- ✅ Error tracking (Sentry integration)

**Microservices & API**
- ✅ 14 independent modules
- ✅ Event-driven architecture with RabbitMQ
- ✅ Event sourcing for data consistency
- ✅ API versioning support
- ✅ GraphQL and REST API options
- ✅ Rate limiting and throttling
- ✅ Request validation middleware

### Module Implementations (Phase 1-5)

**Phase 1: Accounting Module**
- Chart of Accounts (VAS compliant)
- Journal Entries & Posting
- AR & AP Invoice Management
- Fiscal Year & Period Management
- Tax Calculations (TT200, TT133)
- Financial Reporting

**Phase 2: CRM Module**
- Lead Management
- Contact & Account Management
- Opportunity Pipeline
- Activity Tracking
- Campaign Management
- Sales Forecasting

**Phase 3: HRM Module**
- Employee Management
- Department & Position Structure
- Attendance Tracking
- Payroll Processing
- Leave Management
- Performance Reviews

**Phase 4: Ecommerce Module**
- Product Catalog
- Order Management
- Shopping Cart
- Payment Processing
- Shipping Integration
- Inventory Management

**Phase 5: MRP Module**
- Bill of Materials (BOM)
- Production Orders
- Quality Control
- Inventory Management
- Machine Maintenance
- Capacity Planning

### Shared Infrastructure

**Master Data Management**
- Centralized customer database
- Product catalog
- Employee master data
- Supplier management
- Warehouse management
- Units of measure

**Framework & Libraries**
- 20+ shared packages
- Common utilities and helpers
- Shared UI components
- Design system (Tailwind CSS)
- Internationalization (i18n)
- Error handling and logging

### Developer Experience

- TypeScript strict mode throughout
- Hot module reloading (HMR)
- Pre-commit hooks (Husky)
- Code formatting (Prettier)
- Linting (ESLint)
- Git conventional commits
- Automated changelog generation

### Documentation

- Architecture decision records (ADRs)
- API documentation
- Database schema documentation
- Deployment guides
- Development setup guides
- User guides
- Admin guides

### Changed

- Migrated from monolithic to modular architecture
- Upgraded to TypeScript 5.x
- Updated all dependencies to latest stable versions
- Refactored authentication to Keycloak
- Implemented Prisma as ORM across all modules
- Restructured database schemas for multi-tenancy

### Deprecated

- Legacy REST-only APIs (GraphQL now preferred for complex queries)
- Old authentication system (use Keycloak)

### Removed

- Legacy monolithic codebase
- Direct database access without ORM
- Hardcoded configurations
- Non-containerized deployment

### Fixed

- Fixed race conditions in event processing
- Fixed decimal precision in financial calculations
- Fixed timezone handling across regions
- Fixed multi-tenant data isolation issues
- Fixed memory leaks in long-running processes

### Security

- Added dependency scanning
- Implemented CORS properly
- Added rate limiting
- Implemented RBAC
- Added audit logging
- Encrypted sensitive data
- Documented security practices

---

## [1.0.0] - 2026-03-28

Initial open-source release of VietERP Platform.

### Initial Release Includes

**Project Statistics**
- 📊 14 fully functional modules
- 📦 20+ shared packages
- 🗂️ ~738,518 lines of code
- 🗄️ Multi-schema PostgreSQL architecture
- 🔐 Enterprise-grade security

**Core Modules (Production Ready)**
1. Accounting (VAS-compliant)
2. CRM (Lead, Contact, Opportunity management)
3. Human Resource Management
4. E-commerce (Products, Orders, Payments)
5. Manufacturing Resource Planning
6. Order-to-Bill (OTB)
7. Total Project Management (TPM)
8. Project Management Core
9. Event Management
10. Authentication & Authorization
11. Branding & UI Components
12. Audit & Logging
13. Master Data Management
14. API Gateway

**Technology Stack**
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** NestJS, Express.js, Node.js
- **Database:** PostgreSQL 16, Prisma ORM
- **Message Queue:** RabbitMQ
- **Authentication:** Keycloak
- **Containerization:** Docker, Kubernetes
- **Infrastructure:** Terraform, Helm
- **Monitoring:** ELK Stack, New Relic, Sentry
- **Testing:** Playwright, Vitest, Jest

**Key Features**
- ✅ Multi-tenant architecture
- ✅ Role-based access control
- ✅ Event-driven architecture
- ✅ Audit logging
- ✅ API versioning
- ✅ Internationalization (Vietnamese & English)
- ✅ Responsive UI
- ✅ Dark mode support
- ✅ Database migrations
- ✅ CI/CD pipeline

**Documentation**
- ✅ Architecture documentation
- ✅ API documentation
- ✅ Database schema documentation
- ✅ Deployment guides
- ✅ Developer guides
- ✅ User guides

**Community**
- ✅ Open source license (TBD)
- ✅ Contribution guidelines
- ✅ Code of conduct
- ✅ Issue templates
- ✅ PR templates

---

## Version Naming Convention

- **Major (X.0.0)**: Breaking changes or significant new capabilities
- **Minor (x.Y.0)**: New features (backward compatible)
- **Patch (x.y.Z)**: Bug fixes and patches

## Release Schedule

- **Major releases**: Quarterly (Mar, Jun, Sep, Dec)
- **Minor releases**: Monthly
- **Patch releases**: As needed for security/critical bugs

## Upgrade Path

See [UPGRADE.md](./UPGRADE.md) for detailed upgrade instructions.

## Security Policy

See [SECURITY.md](./SECURITY.md) for vulnerability reporting and security practices.

## License

See [LICENSE](./LICENSE) for license information.

---

### Contributors

This changelog was generated from git commits using conventional commits format.

All contributors are listed in [CONTRIBUTORS.md](./CONTRIBUTORS.md).

---

**Last Updated:** 2026-03-29
**Next Review:** 2026-06-29
