# ADR-008: Terraform for Multi-Cloud Infrastructure

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP customers may deploy infrastructure on different clouds:
- Some prefer AWS (largest market)
- Some require GCP (Google Cloud preferred for analytics)
- Some mandate Azure (Microsoft enterprise agreements)
- Some prefer on-premises or hybrid clouds
- Requires consistent infrastructure definitions across clouds
- Need for environment parity (staging, production)
- Disaster recovery with multi-region deployments
- Cost control and resource tagging across clouds
- Infrastructure as Code (IaC) for repeatability
- Version control of all infrastructure changes

Các khách hàng VietERP có thể triển khai cơ sở hạ tầng trên các đám mây khác nhau:
- Một số ưa thích AWS
- Một số yêu cầu GCP
- Một số bắt buộc Azure
- Một số ưa thích tại chỗ hoặc đám mây lai
- Yêu cầu các định nghĩa cơ sở hạ tầng nhất quán trên các đám mây
- Cần có tính chẳn quy cơ sở hạ tầng (dàn dựng, sản xuất)
- Khôi phục thảm họa với triển khai đa khu vực
- Kiểm soát chi phí và gắn thẻ tài nguyên trên các đám mây
- Cơ sở hạ tầng dưới dạng Mã (IaC) để có khả năng tái sử dụng

Terraform provides cloud-agnostic IaC with module-based abstractions.

## Quyết định / Decision

**Adopt Terraform** as the Infrastructure as Code tool for multi-cloud deployments.

Áp dụng **Terraform** làm công cụ Cơ sở hạ tầng dưới dạng Mã cho triển khai đa đám mây.

**Configuration**:
- Terraform 1.6+ with state management in S3 (AWS) or GCS (GCP)
- Provider modules per cloud: `aws/`, `gcp/`, `azure/`, `on-prem/`
- Shared modules for common patterns: `network/`, `kubernetes/`, `database/`, `cdn/`
- Workspaces per environment: `dev`, `staging`, `production`
- Remote state with state locking (Terraform Cloud or self-hosted)
- Variable validation and sensible defaults
- Outputs for cross-module consumption
- Automated drift detection and reporting
- Terraform plan approval in CI/CD before apply

**Cấu hình**:
- Terraform 1.6+ với quản lý trạng thái trong S3 hoặc GCS
- Mô-đun nhà cung cấp cho mỗi đám mây: `aws/`, `gcp/`, `azure/`
- Mô-đun chia sẻ cho các mẫu phổ biến: `network/`, `kubernetes/`, `database/`
- Không gian làm việc cho mỗi môi trường: `dev`, `staging`, `production`
- Trạng thái từ xa với khóa trạng thái
- Xác thực biến và giá trị mặc định hợp lý
- Đầu ra để tiêu thụ mô-đun chéo
- Phát hiện dịch chuyển tự động
- Phê duyệt kế hoạch Terraform trong CI/CD trước khi áp dụng

## Phương án thay thế / Alternatives Considered

### AWS CloudFormation
- Pros: AWS-native, integrated with AWS Console
- Cons: Only for AWS, YAML/JSON verbosity, poor DX
- **Rejected**: Multi-cloud requirement rules out CloudFormation

### Azure Resource Manager (ARM) Templates
- Pros: Azure-native, strong RBAC integration
- Cons: Only for Azure, JSON-heavy
- **Rejected**: Multi-cloud requirement rules out ARM

### Pulumi
- Pros: Programming language support (Python, Go, TypeScript)
- Cons: Less mature, smaller community than Terraform, state management complexity
- **Rejected**: Terraform's simpler mental model better for ops teams

### Helm (for Kubernetes only)
- Pros: Kubernetes-specific, templating focused
- Cons: Only for K8s, doesn't handle cloud infrastructure
- **Rejected**: Terraform + Helm together cover full stack

## Hệ quả / Consequences

### Tích cực / Positive

1. **Cloud Agnostic**: Single codebase for AWS, GCP, Azure, on-prem
   - Không phụ thuộc vào nhà cung cấp đám mây: Một cơ sở mã cho tất cả các đám mây
2. **Module Reusability**: Common patterns (VPC, RDS, K8s) organized as modules
   - Tái sử dụng mô-đun: Các mẫu phổ biến được tổ chức dưới dạng mô-đun
3. **Version Control**: All infrastructure in Git; history, diffs, blame tracking
   - Kiểm soát phiên bản: Tất cả cơ sở hạ tầng trong Git
4. **Consistency**: Same environment setup across all clouds
   - Tính nhất quán: Cài đặt môi trường giống nhau trên tất cả các đám mây
5. **Plan Before Apply**: `terraform plan` shows exact changes before execution
   - Kế hoạch trước khi áp dụng: Hiển thị các thay đổi chính xác
6. **State Management**: Remote state prevents conflicts, enables collaboration
   - Quản lý trạng thái: Trạng thái từ xa ngăn xung đột

### Tiêu cực / Negative

1. **Steep Learning Curve**: HCL syntax, provider-specific knowledge required
   - Đường cong học tập dốc: Cú pháp HCL, kiến thức cụ thể nhà cung cấp
2. **Provider Inconsistencies**: Same resource differs slightly between AWS/GCP/Azure
   - Sự không nhất quán của nhà cung cấp: Cùng tài nguyên khác biệt nhẹ
3. **State File Management**: Loss or corruption of state file = infrastructure chaos
   - Quản lý tệp trạng thái: Mất hoặc hỏng tệp trạng thái = hỗn loạn
4. **Module Versioning**: Managing module versions across multiple projects complex
   - Phiên bản mô-đun: Quản lý phiên bản mô-đun trên nhiều dự án
5. **Drift Detection**: No automatic rollback; manual remediation needed
   - Phát hiện dịch chuyển: Không có khôi phục tự động

## Tham khảo / References

- [Terraform Official Docs](https://www.terraform.io/docs)
- [Terraform Cloud Documentation](https://www.terraform.io/cloud-docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices)
- [AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- VietERP Infrastructure: `terraform/aws/`, `terraform/gcp/`, `terraform/modules/`

---

**Ảnh hưởng đến / Impacts**:
- Infrastructure Deployment Process
- Multi-Cloud Strategy
- CI/CD Pipeline Configuration
- Disaster Recovery Procedures
- Cost Management and Tagging
