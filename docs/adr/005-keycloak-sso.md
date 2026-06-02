# ADR-005: Keycloak for Identity and Access Management

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP requires identity and access management for:
- Multi-tenant architecture (100+ organizations)
- Role-based access control (RBAC) with 50+ roles
- Single Sign-On (SSO) across all 14 applications
- SAML 2.0 and OIDC protocol support for enterprise integrations
- Fine-grained authorization (resource-level permissions)
- User federation and social login (for future customer portals)
- Session management across browsers and mobile apps
- Audit logging of all authentication events
- Vietnamese language support for user-facing flows

VietERP yêu cầu quản lý danh tính và truy cập cho:
- Kiến trúc đa thuê (100+ tổ chức)
- Kiểm soát truy cập dựa trên vai trò (RBAC) với 50+ vai trò
- Đăng nhập một lần (SSO) trên tất cả 14 ứng dụng
- Hỗ trợ giao thức SAML 2.0 và OIDC
- Ủy quyền chi tiết (quyền ở cấp tài nguyên)
- Liên kết người dùng và đăng nhập xã hội
- Quản lý phiên trên các trình duyệt và ứng dụng di động
- Ghi nhật ký kiểm toán tất cả các sự kiện xác thực
- Hỗ trợ tiếng Việt cho các luồng hướng đến người dùng

Keycloak provides self-hosted, flexible IAM with strong compliance and customization.

## Quyết định / Decision

**Adopt Keycloak** as the primary identity and access management system for VietERP.

Áp dụng **Keycloak** làm hệ thống quản lý danh tính và truy cập chính cho VietERP.

**Configuration**:
- Keycloak 24.x (latest stable)
- Deployed as Kubernetes StatefulSet with persistent PostgreSQL
- OIDC/OAuth2 as primary protocol
- SAML 2.0 support for enterprise customers
- JWT tokens with custom claims for authorization
- Admin UI for role/permission management
- Realm per organization (multi-tenancy)
- User Federation with LDAP/AD connectors

**Cấu hình**:
- Keycloak 24.x (mới nhất ổn định)
- Triển khai dưới dạng Kubernetes StatefulSet với PostgreSQL bền vững
- OIDC/OAuth2 làm giao thức chính
- Hỗ trợ SAML 2.0 cho khách hàng doanh nghiệp
- JWT tokens với yêu cầu tùy chỉnh cho ủy quyền
- Giao diện quản trị viên để quản lý vai trò/quyền
- Realm cho mỗi tổ chức (đa thuê)
- Liên kết người dùng với kết nối LDAP/AD

## Phương án thay thế / Alternatives Considered

### Auth0
- Pros: Managed service, excellent UX, global scale
- Cons: Vendor lock-in, higher cost, limited self-hosting
- **Rejected**: VietERP needs self-hosting flexibility and cost control

### Clerk
- Pros: Modern UX, embedded auth, fast setup
- Cons: Newer, limited compliance certifications, only cloud
- **Rejected**: VietERP enterprise needs require self-hosted, SAML support

### Okta
- Pros: Enterprise-grade, extensive integrations, compliance
- Cons: Extremely expensive, overkill for VietERP initially
- **Rejected**: Keycloak meets needs at fraction of cost

### Custom JWT Solution
- Pros: Maximum control, minimal complexity
- Cons: No SAML, LDAP federation, user management UI required
- **Rejected**: Keycloak provides battle-tested security and compliance

## Hệ quả / Consequences

### Tích cực / Positive

1. **Multi-Tenancy**: Realms support 100+ organizations with isolated credentials
   - Đa thuê: Realms hỗ trợ 100+ tổ chức với thông tin xác thực riêng lẻ
2. **Enterprise Protocols**: SAML 2.0, OIDC, OAuth2 for all customer types
   - Giao thức doanh nghiệp: SAML 2.0, OIDC, OAuth2
3. **Self-Hosted**: Full control over data, compliance, customization
   - Tự lưu trữ: Kiểm soát toàn bộ dữ liệu, tuân thủ, tùy chỉnh
4. **Fine-Grained Authorization**: Resource-level roles, client scopes, policies
   - Ủy quyền chi tiết: Vai trò ở cấp tài nguyên, phạm vi khách hàng
5. **Extensible**: Custom User Federation SPIs, authenticators, event listeners
   - Mở rộng được: SPIs liên kết người dùng tùy chỉnh, trình xác thực
6. **Audit Trail**: All login, logout, token events logged with timestamps
   - Dấu vết kiểm toán: Tất cả sự kiện đăng nhập, đăng xuất, mã thông báo được ghi lại

### Tiêu cực / Negative

1. **Operational Overhead**: Keycloak requires tuning, monitoring, backups
   - Overhead hoạt động: Keycloak yêu cầu điều chỉnh, giám sát, sao lưu
2. **Database Dependency**: Performance tied to PostgreSQL; schema updates can be slow
   - Phụ thuộc cơ sở dữ liệu: Hiệu suất liên quan đến PostgreSQL
3. **Scaling Complexity**: Horizontal scaling requires load balancing, clustering
   - Độ phức tạp mở rộng: Mở rộng ngang yêu cầu cân bằng tải
4. **Customization Learning Curve**: Theming, SPI extension development steep
   - Đường cong học tập tùy chỉnh: Phát triển tiện ích mở rộng SPI dốc
5. **Java Dependency**: Keycloak is Java-based; requires JVM overhead
   - Phụ thuộc Java: Keycloak dựa trên Java; yêu cầu overhead JVM

## Tham khảo / References

- [Keycloak Official Docs](https://www.keycloak.org/documentation.html)
- [Keycloak Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [OIDC/OAuth2 Configuration](https://www.keycloak.org/docs/latest/server_admin/#_client_credentials_grant_access_token_request)
- [Keycloak on Kubernetes](https://www.keycloak.org/operator/installation)
- VietERP Clients: `admin-dashboard`, `public-portal`, `mobile-app`, etc.

---

**Ảnh hưởng đến / Impacts**:
- Authentication and Authorization Architecture
- User Management Workflows
- Multi-Tenancy Implementation
- Compliance and Audit Requirements
