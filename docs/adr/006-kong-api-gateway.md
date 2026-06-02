# ADR-006: Kong Gateway for API Routing

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP backend services require a unified API gateway to:
- Route requests across 14+ internal services and external APIs
- Rate limiting (1000 req/min per API key, burst handling)
- Request authentication and token validation
- API versioning and backward compatibility
- Request/response transformation (header injection, payload wrapping)
- Request logging and distributed tracing
- API key management and quotas per customer tier
- GraphQL federation (future multi-service queries)
- WebSocket proxying for real-time features
- Traffic shaping and circuit breaking
- CORS and HTTPS termination

Các dịch vụ backend VietERP yêu cầu bộ điều phối API thống nhất:
- Định tuyến yêu cầu trên 14+ dịch vụ nội bộ và API bên ngoài
- Giới hạn tỷ lệ (1000 yêu cầu/phút cho mỗi khóa API)
- Xác thực yêu cầu và xác thực mã thông báo
- Phiên bản API và tương thích ngược
- Chuyển đổi yêu cầu/phản hồi (tiêm header, bao bọc tải trọng)
- Ghi nhật ký yêu cầu và theo dõi phân tán
- Quản lý khóa API và hạn ngạch trên mỗi cấp khách hàng
- Liên kết GraphQL (các truy vấn đa dịch vụ trong tương lai)
- Proxying WebSocket cho các tính năng thời gian thực
- Định hình lưu lượng và ngắt mạch
- CORS và kết thúc HTTPS

Kong provides extensible plugin ecosystem and performance at scale.

## Quyết định / Decision

**Adopt Kong Gateway** as the unified API gateway for VietERP backend services.

Áp dụng **Kong Gateway** làm bộ điều phối API thống nhất cho các dịch vụ backend VietERP.

**Configuration**:
- Kong 3.4+ (latest stable)
- PostgreSQL as Kong datastore
- Admin API for programmatic configuration
- Plugins: Authentication, Rate Limiting, CORS, Request/Response Transform, Logging
- Service mesh mode: Ready for Kubernetes (Kong Ingress Controller)
- Load balancing with health checks
- Upstream services registered per module
- API documentation via OpenAPI/Swagger

**Cấu hình**:
- Kong 3.4+ (mới nhất ổn định)
- PostgreSQL làm kho dữ liệu Kong
- API quản trị viên để cấu hình lập trình
- Plugins: Xác thực, Giới hạn tỷ lệ, CORS, Chuyển đổi Yêu cầu/Phản hồi, Ghi nhật ký
- Chế độ lưới dịch vụ: Sẵn sàng cho Kubernetes
- Cân bằng tải với kiểm tra sức khỏe
- Dịch vụ upstream đăng ký cho mỗi mô-đun
- Tài liệu API thông qua OpenAPI/Swagger

## Phương án thay thế / Alternatives Considered

### Traefik
- Pros: Cloud-native, simple config, lightweight
- Cons: Less plugin ecosystem, primarily for Kubernetes
- **Rejected**: Kong's plugin ecosystem more mature; works multi-cloud

### NGINX
- Pros: Battle-tested, fast, simple configuration
- Cons: Limited plugin system, manual config management
- **Rejected**: Kong provides richer feature set for modern APIs

### AWS API Gateway
- Pros: Managed, scalable, AWS integrations
- Cons: Vendor lock-in, cost per request, limited customization
- **Rejected**: VietERP multi-cloud strategy requires self-hosted

### Envoy / Service Mesh (Istio)
- Pros: Advanced traffic management, observability
- Cons: Complex, overkill without microservices patterns
- **Rejected**: Kong sufficient; Envoy more for mature service mesh

## Hệ quả / Consequences

### Tích cực / Positive

1. **Rich Plugin Ecosystem**: Auth, rate limiting, CORS, transform built-in
   - Hệ sinh thái plugin phong phú: Xác thực, giới hạn tỷ lệ, CORS tích hợp sẵn
2. **Service Registry**: Dynamic upstream registration; handle service scaling
   - Đăng ký dịch vụ: Đăng ký upstream động
3. **Request Transformation**: Rewrite URIs, inject headers, modify payloads
   - Biến đổi yêu cầu: Viết lại URI, tiêm header, sửa đổi tải trọng
4. **Rate Limiting & Quotas**: Per-API-key, per-consumer limits with shared quota pools
   - Giới hạn tỷ lệ & Hạn ngạch: Giới hạn cho mỗi khóa API
5. **Analytics & Logging**: Access logs, request/response timing, error tracking
   - Phân tích & Ghi nhật ký: Nhật ký truy cập, thời gian yêu cầu/phản hồi
6. **OpenAPI/Swagger Support**: Automatic documentation generation
   - Hỗ trợ OpenAPI/Swagger: Tạo tài liệu tự động

### Tiêu cực / Negative

1. **Another Service to Operate**: Kong requires monitoring, backups, upgrades
   - Dịch vụ khác để hoạt động: Kong yêu cầu giám sát, sao lưu, nâng cấp
2. **Latency Addition**: Extra hop adds ~5-10ms (acceptable for VietERP)
   - Độ trễ bổ sung: Hop thêm thêm ~5-10ms
3. **Plugin Complexity**: Custom plugins require Lua or JavaScript knowledge
   - Độ phức tạp của plugin: Plugin tùy chỉnh yêu cầu kiến thức Lua
4. **PostgreSQL Dependency**: Kong's datastore ties to database performance
   - Phụ thuộc PostgreSQL: Kho dữ liệu Kong liên quan đến hiệu suất cơ sở dữ liệu
5. **Learning Curve**: Kong concepts (Services, Routes, Consumers) require training
   - Đường cong học tập: Các khái niệm Kong yêu cầu đào tạo

## Tham khảo / References

- [Kong Official Docs](https://docs.konghq.com)
- [Kong Admin API](https://docs.konghq.com/gateway/latest/admin-api/)
- [Kong Plugins Hub](https://docs.konghq.com/hub)
- [Kong Kubernetes Ingress Controller](https://docs.konghq.com/kubernetes-ingress-controller)
- VietERP Services: `accounts-service`, `crm-service`, `inventory-service`, etc.

---

**Ảnh hưởng đến / Impacts**:
- API Gateway Architecture
- Service Routing Configuration
- Rate Limiting and Quota Management
- Authentication and Authorization Enforcement
- Observability and Logging Strategy
