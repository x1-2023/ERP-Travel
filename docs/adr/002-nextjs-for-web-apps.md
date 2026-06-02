# ADR-002: Next.js 14+ for Web Applications

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP web applications require:
- Server-side rendering (SSR) for SEO (Admin Dashboard, Public Portal)
- Built-in API routes without separate backend framework
- Type-safe frontend-backend contract via TypeScript
- Full React ecosystem and community support
- File-based routing to reduce boilerplate
- Streaming, incremental static regeneration (ISR)
- Real-time features via WebSockets for live dashboards

Các ứng dụng web VietERP yêu cầu:
- Kết xuất phía máy chủ (SSR) cho SEO
- Các tuyến API tích hợp sẵn mà không cần khung backend riêng
- Hợp đồng frontend-backend an toàn kiểu qua TypeScript
- Hỗ trợ đầy đủ hệ sinh thái React
- Định tuyến dựa trên tệp để giảm đơn vị
- Phát trực tuyến, tái tạo tĩnh tăng dần (ISR)
- Các tính năng thời gian thực thông qua WebSockets

Next.js 14 (App Router) provides all these with modern server components and API routes.

## Quyết định / Decision

**Adopt Next.js 14+ with App Router** as the primary web framework for all VietERP web applications.

Áp dụng **Next.js 14+ với App Router** làm khung web chính cho tất cả các ứng dụng web VietERP.

**Configuration**:
- Next.js 14.0 or higher (with App Router)
- TypeScript for type safety
- React 18.2+ for concurrent rendering
- Built-in API routes (`/api/*`) for backend logic
- Middleware for authentication and logging
- Export to static sites where appropriate (Public Portal, Documentation)

**Cấu hình**:
- Next.js 14.0 trở lên (với App Router)
- TypeScript để bảo vệ kiểu
- React 18.2+ để kết xuất đồng thời
- Các tuyến API tích hợp sẵn (`/api/*`) cho logic backend
- Middleware cho xác thực và ghi nhật ký
- Xuất sang các trang web tĩnh khi thích hợp

## Phương án thay thế / Alternatives Considered

### Remix
- Pros: Data loading conventions, form actions, great DX
- Cons: Smaller ecosystem, fewer third-party integrations
- **Rejected**: Next.js has wider adoption in Vietnam, larger ecosystem

### Vite + React + Express
- Pros: Maximum flexibility, separate concerns
- Cons: Must maintain separate frontend/backend, API synchronization overhead
- **Rejected**: Lost benefits of Next.js API routes and SSR simplicity

### Angular
- Pros: Enterprise features, dependency injection
- Cons: Steep learning curve, TypeScript required (not a con), heavier bundle
- **Rejected**: React simpler for ERP UI, smaller learning curve

### SvelteKit
- Pros: Reactive, small bundle size
- Cons: Tiny ecosystem compared to React, hard to hire Svelte developers
- **Rejected**: React ecosystem unmatched for enterprise

## Hệ quả / Consequences

### Tích cực / Positive

1. **Unified Frontend-Backend**: API routes in same codebase reduce friction
   - Frontend-Backend thống nhất: Các tuyến API trong cùng mã base giảm ma sát
2. **Server Components**: React Server Components reduce client-side JavaScript
   - Thành phần máy chủ: Giảm JavaScript phía khách hàng
3. **Type-Safe API Routes**: Shared types between client and server
   - Các tuyến API an toàn kiểu: Kiểu chia sẻ giữa khách và máy chủ
4. **Built-in Optimizations**: Image, font, script optimization out of box
   - Tối ưu hóa tích hợp sẵn: Tối ưu hóa hình ảnh, phông chữ, tập lệnh
5. **Streaming & ISR**: Progressive rendering improves perceived performance
   - Phát trực tuyến & ISR: Kết xuất tiến bộ cải thiện hiệu suất cảm nhận
6. **SEO Built-in**: Metadata API, Open Graph, structured data support
   - SEO tích hợp sẵn: Hỗ trợ API siêu dữ liệu, Open Graph, dữ liệu có cấu trúc

### Tiêu cực / Negative

1. **Cold Start in Serverless**: API routes cold start can exceed 1 second (mitigated by containers)
   - Khởi động lạnh: API routes khởi động lạnh có thể vượt quá 1 giây
2. **App Router Learning Curve**: Server/Client boundary requires mental model shift
   - Đường cong học tập: Ranh giới Server/Client yêu cầu sự thay đổi mô hình
3. **Node.js Only**: Can't target edge runtimes with all libraries (most work fine)
   - Chỉ Node.js: Không thể nhắm mục tiêu edge runtimes
4. **Bundle Size**: Server components reduce it, but still React overhead (~40KB gzip)
   - Kích thước bundle: Thành phần máy chủ giảm nó, nhưng vẫn có overhead React

## Tham khảo / References

- [Next.js 14 App Router Docs](https://nextjs.org/docs)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- VietERP Apps: `apps/admin-dashboard`, `apps/public-portal`, `apps/mobile-web`

---

**Ảnh hưởng đến / Impacts**:
- Web Application Architecture
- Development Workflow
- Performance Optimization Strategy
- Deployment Configuration
