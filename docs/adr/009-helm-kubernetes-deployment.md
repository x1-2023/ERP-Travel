# ADR-009: Helm Charts for Kubernetes Deployment

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP backend services are containerized and deployed to Kubernetes:
- 14+ services with independent scaling requirements
- Environment-specific configs (dev, staging, production)
- ConfigMaps for application settings per environment
- Secrets for database credentials, API keys, JWT signing keys
- StatefulSets for databases and message brokers
- Deployments for stateless services
- HPA (Horizontal Pod Autoscaling) based on CPU/memory
- Multiple environments across different clouds
- Rollback capability for failed deployments
- GitOps workflow for declarative deployments
- Service mesh integration (future: Istio)

Các dịch vụ backend VietERP được container hóa và triển khai cho Kubernetes:
- 14+ dịch vụ có yêu cầu mở rộng độc lập
- Cấu hình cụ thể môi trường (dev, dàn dựng, sản xuất)
- ConfigMaps cho cài đặt ứng dụng cho mỗi môi trường
- Bí mật cho thông tin xác thực cơ sở dữ liệu, khóa API
- StatefulSets cho cơ sở dữ liệu và người môi giới tin nhắn
- Triển khai cho các dịch vụ không trạng thái
- HPA (Autoscaling Pod ngang) dựa trên CPU/bộ nhớ
- Nhiều môi trường trên các đám mây khác nhau
- Khả năng khôi phục cho các triển khai không thành công
- Quy trình GitOps cho các triển khai khai báo

Helm provides templating, versioning, and release management for Kubernetes.

## Quyết định / Decision

**Adopt Helm Charts** as the primary deployment mechanism for Kubernetes manifests.

Áp dụng **Helm Charts** làm cơ chế triển khai chính cho các bản kê khai Kubernetes.

**Configuration**:
- Helm 3.12+ (no Tiller)
- Chart per service or shared chart with value overrides
- Charts stored in Helm repository (ChartMuseum or Artifactory)
- values.yaml per environment: `values-dev.yaml`, `values-staging.yaml`, `values-prod.yaml`
- ConfigMaps injected from `configMap.yaml` template
- Secrets managed via Sealed Secrets or External Secrets Operator
- Chart testing with `helm lint`, `helm test`
- Rollback via `helm rollback` on failed deployments
- Release history tracked in `helm history`

**Cấu hình**:
- Helm 3.12+ (không có Tiller)
- Biểu đồ cho mỗi dịch vụ hoặc biểu đồ chia sẻ với ghi đè giá trị
- Biểu đồ được lưu trữ trong kho Helm (ChartMuseum hoặc Artifactory)
- values.yaml cho mỗi môi trường: `values-dev.yaml`, `values-prod.yaml`
- ConfigMaps được tiêm từ mẫu `configMap.yaml`
- Bí mật được quản lý qua Sealed Secrets hoặc External Secrets Operator
- Thử nghiệm biểu đồ với `helm lint`, `helm test`
- Khôi phục qua `helm rollback` khi triển khai không thành công
- Lịch sử phát hành được theo dõi trong `helm history`

## Phương án thay thế / Alternatives Considered

### Kustomize
- Pros: Simpler overlays, no templating, pure YAML
- Cons: Less powerful, no versioning/release management
- **Rejected**: Helm's versioning essential for release tracking

### ArgoCD (GitOps)
- Pros: Declarative Git-driven deployments, drift detection
- Cons: Requires ArgoCD management, added operational overhead
- **Rejected**: Helm sufficient; ArgoCD can layer on top later

### Raw Kubernetes Manifests
- Pros: Direct YAML, no abstraction
- Cons: Manual env variable substitution, no versioning, hard to maintain
- **Rejected**: Helm's templating and releases simplify management

### Skaffold
- Pros: Great for dev workflow, live reloading
- Cons: Development-focused, not for production deployments
- **Rejected**: Skaffold for dev; Helm for production

## Hệ quả / Consequences

### Tích cực / Positive

1. **Templating**: Values in `values.yaml` used in templates; single source of truth
   - Lập mẫu: Giá trị trong `values.yaml` được sử dụng trong các mẫu
2. **Environment Parity**: Same chart, different values per environment
   - Tính chẳn quy môi trường: Biểu đồ giống nhau, các giá trị khác nhau cho mỗi môi trường
3. **Release Management**: Helm tracks releases; rollback, history, upgrade
   - Quản lý phát hành: Helm theo dõi các phát hành
4. **Package Distribution**: Charts versioned, distributed via Helm repos
   - Phân phối gói: Biểu đồ được phiên bản, phân phối qua kho Helm
5. **Dependency Management**: Chart dependencies declared in `Chart.yaml`
   - Quản lý phụ thuộc: Các phụ thuộc biểu đồ được khai báo
6. **Hooks**: Pre/post deployment hooks for migrations, backups
   - Hooks: Pre/post triển khai cho di chuyển, sao lưu

### Tiêu cực / Negative

1. **Template Complexity**: Helm templating (Go templates) steep learning curve
   - Độ phức tạp mẫu: Lập mẫu Helm (Go templates) dốc
2. **Debugging Difficulty**: Hard to debug rendered manifests; `helm template` needed
   - Khó khăn gỡ lỗi: Khó gỡ lỗi các bản kê khai được kết xuất
3. **Values File Explosion**: Multiple values files for each env can become unwieldy
   - Phát nổ tệp giá trị: Nhiều tệp giá trị cho mỗi môi trường
4. **Conditional Logic**: Complex conditionals in templates become hard to maintain
   - Logic có điều kiện: Logic có điều kiện phức tạp trở nên khó bảo trì
5. **Secrets Management**: Helm doesn't encrypt secrets; needs external solution
   - Quản lý bí mật: Helm không mã hóa bí mật

## Tham khảo / References

- [Helm Official Docs](https://helm.sh/docs/)
- [Helm Chart Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Helm Template Reference](https://helm.sh/docs/chart_template_guide/)
- [Sealed Secrets for Secret Management](https://github.com/bitnami-labs/sealed-secrets)
- [External Secrets Operator](https://external-secrets.io/)
- VietERP Charts: `helm/charts/accounting-service/`, `helm/charts/crm-service/`, etc.

---

**Ảnh hưởng đến / Impacts**:
- Kubernetes Deployment Process
- Environment Configuration Management
- Release and Rollback Procedures
- Secret and ConfigMap Management
- CI/CD Pipeline Integration
