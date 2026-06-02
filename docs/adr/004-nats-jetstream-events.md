# ADR-004: NATS JetStream for Event Streaming

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP modules must communicate asynchronously across:
- CRM → Accounting (invoice creation triggers ledger entries)
- Ecommerce → MRP (order placement triggers inventory updates)
- HRM → Accounting (payroll events trigger journal entries)
- Multiple subscribers to same event (audit log, notification, analytics)
- Guaranteed delivery with persistent storage
- At-least-once semantics to prevent data loss
- High throughput: 10,000+ events/day
- Event replay capability for debugging and reprocessing

Các mô-đun VietERP phải giao tiếp không đồng bộ trên:
- CRM → Kế toán (tạo hóa đơn kích hoạt các mục sổ cái)
- Ecommerce → MRP (đặt hàng kích hoạt cập nhật tồn kho)
- HRM → Kế toán (sự kiện lương kích hoạt các mục tạp chí)
- Nhiều người đăng ký cùng một sự kiện (nhật ký kiểm toán, thông báo, phân tích)
- Giao hàng được đảm bảo với lưu trữ bền vững
- Ngữ nghĩa ít nhất một lần để ngăn mất dữ liệu
- Thông lượng cao: 10.000+ sự kiện/ngày

NATS JetStream provides lightweight, distributed event streaming with persistence.

## Quyết định / Decision

**Adopt NATS JetStream** as the event streaming and inter-module communication backbone.

Áp dụng **NATS JetStream** làm xương sống phát trực tuyến sự kiện và giao tiếp giữa các mô-đun.

**Configuration**:
- NATS Server 2.10+ with JetStream enabled
- Subjects organized by domain: `crm.invoice.created`, `erp.order.placed`, `hrm.payroll.processed`
- Consumer groups per subscriber (durable consumers)
- Retention policy: 30 days or max 100MB per stream
- Replication factor: 3 in production (HA)
- Client libraries: `nats.js` for Node.js/TypeScript

**Cấu hình**:
- NATS Server 2.10+ với JetStream được bật
- Chủ đề được tổ chức theo miền: `crm.invoice.created`, `erp.order.placed`
- Nhóm người tiêu dùng cho mỗi người đăng ký (người tiêu dùng bền vững)
- Chính sách lưu giữ: 30 ngày hoặc tối đa 100MB cho mỗi luồng
- Hệ số sao chép: 3 trong sản xuất (HA)
- Thư viện khách: `nats.js` cho Node.js/TypeScript

## Phương án thay thế / Alternatives Considered

### RabbitMQ
- Pros: Battle-tested, AMQP standard, plugin ecosystem
- Cons: Higher resource usage, complex setup, Java-based
- **Rejected**: NATS simpler, faster, lower operational overhead

### Apache Kafka
- Pros: Extreme scale, topic partitioning, rebalancing
- Cons: Overkill for VietERP volumes, JVM overhead, operational complexity
- **Rejected**: NATS sufficient; Kafka not needed at our scale

### Redis Streams
- Pros: Fast, in-memory, simple commands
- Cons: Not durable after restart (unless AOF), no consumer groups, memory-limited
- **Rejected**: NATS JetStream provides persistence; Redis too volatile

### AWS SQS + SNS
- Pros: AWS-managed, scalable, reliable
- Cons: Vendor lock-in, network latency, cost per message
- **Rejected**: Self-hosted NATS enables multi-cloud; avoids vendor lock-in

## Hệ quả / Consequences

### Tích cực / Positive

1. **Lightweight & Fast**: NATS is <30MB binary, sub-millisecond latency
   - Nhẹ và nhanh: NATS là nhị phân <30MB
2. **Built-in Persistence**: JetStream stores to disk; survives restarts
   - Lưu giữ tích hợp sẵn: JetStream lưu vào đĩa
3. **At-Least-Once Semantics**: Durable consumers track offset; never lose events
   - Ngữ nghĩa ít nhất một lần: Người tiêu dùng bền vững theo dõi độ lệch
4. **Replay Capability**: Reprocess events from any point in time
   - Khả năng phát lại: Xử lý lại sự kiện từ bất kỳ thời điểm nào
5. **Subject Namespacing**: Organize events by domain; publish/subscribe patterns
   - Không gian tên chủ đề: Tổ chức sự kiện theo miền
6. **No External Dependencies**: Runs standalone; simple Docker container
   - Không có phụ thuộc bên ngoài: Chạy độc lập

### Tiêu cực / Negative

1. **Operational Overhead**: Must run NATS cluster; monitor, backup JetStream files
   - Overhead hoạt động: Phải chạy cụm NATS
2. **Smaller Ecosystem**: Fewer pre-built integrations vs Kafka/RabbitMQ
   - Hệ sinh thái nhỏ hơn: Ít tích hợp được xây dựng trước
3. **Learning Curve**: Subject patterns, consumer groups differ from other brokers
   - Đường cong học tập: Các mẫu chủ đề khác với các broker khác
4. **Distributed Setup Complexity**: JetStream clustering requires careful configuration
   - Độ phức tạp thiết lập phân tán: Cụm JetStream yêu cầu cấu hình cẩn thận
5. **Message Ordering**: At-partition level; global ordering not guaranteed
   - Thứ tự tin nhắn: Ở cấp phân vùng; không đảm bảo thứ tự toàn cục

## Tham khảo / References

- [NATS Official Docs](https://docs.nats.io)
- [NATS JetStream Guide](https://docs.nats.io/nats-concepts/jetstream)
- [NATS.js Client Library](https://github.com/nats-io/nats.js)
- [Event Sourcing with NATS](https://docs.nats.io/using-nats/jetstream)
- VietERP Event Subjects: See `libs/event-types/src/subjects.ts`

---

**Ảnh hưởng đến / Impacts**:
- Inter-Module Communication Architecture
- Event-Driven Design Patterns
- Operational Requirements
- Debugging and Replay Strategies
