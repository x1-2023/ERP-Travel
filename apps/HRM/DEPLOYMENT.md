# HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT GUIDE) — VietERP-HRM

> Tài liệu dành cho phòng IT — Triển khai hệ thống Quản lý Nhân sự VietERP-HRM lên môi trường production.

---

## Mục lục

1. [Tổng quan ứng dụng](#1-tổng-quan-ứng-dụng)
2. [Yêu cầu hệ thống](#2-yêu-cầu-hệ-thống)
3. [Hướng dẫn cài đặt từng bước](#3-hướng-dẫn-cài-đặt-từng-bước)
4. [Cấu hình biến môi trường (.env)](#4-cấu-hình-biến-môi-trường-env)
5. [Hướng dẫn lấy API Keys](#5-hướng-dẫn-lấy-api-keys)
6. [Khởi tạo database](#6-khởi-tạo-database)
7. [Chạy production](#7-chạy-production)
8. [Cấu hình Nginx](#8-cấu-hình-nginx)
9. [Cron Jobs](#9-cron-jobs)
10. [Tài khoản mặc định](#10-tài-khoản-mặc-định)
11. [Bảo mật](#11-bảo-mật)
12. [Backup database](#12-backup-database)
13. [Cập nhật ứng dụng](#13-cập-nhật-ứng-dụng)
14. [Xử lý sự cố](#14-xử-lý-sự-cố)
15. [Health Check](#15-health-check)

---

## 1. Tổng quan ứng dụng

**VietERP-HRM** là hệ thống Quản lý Nhân sự (Human Resource Management) được phát triển cho Công ty Cổ phần VietERP Việt Nam.

### Tech Stack

| Thành phần | Công nghệ | Phiên bản |
|------------|-----------|-----------|
| Framework | Next.js | 14.2.x |
| Ngôn ngữ | TypeScript | 5.x |
| ORM | Prisma | 7.x |
| Database | PostgreSQL | 16+ |
| Authentication | NextAuth v5 | 5.0 beta |
| UI Components | Radix UI + Tailwind CSS | — |
| State Management | Zustand + TanStack Query | — |
| AI Copilot | Anthropic Claude (SDK) | — |

### Các tính năng chính

- Quản lý hồ sơ nhân viên (thêm, sửa, xóa, tìm kiếm, lọc)
- Quản lý hợp đồng lao động (theo dõi, cảnh báo hết hạn)
- Cơ cấu tổ chức (phòng ban, chức vụ)
- Quản lý chấm công, tính lương, bảo hiểm
- Xuất báo cáo Excel, xuất văn bản Word (docxtemplater)
- Hệ thống phân quyền RBAC 6 vai trò
- AI Copilot HR (tư vấn nhân sự, hỗ trợ tra cứu — sử dụng Anthropic Claude Sonnet)
- Cron job kiểm tra hợp đồng sắp hết hạn
- Gửi email thông báo (SMTP/Nodemailer)

---

## 2. Yêu cầu hệ thống

### Phần cứng tối thiểu

| Thông số | Tối thiểu | Khuyến nghị |
|----------|-----------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| Băng thông | 10 Mbps | 100 Mbps |

### Phần mềm

| Phần mềm | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| Node.js | >= 20.0.0 | Bắt buộc. Dùng `node -v` để kiểm tra |
| npm | >= 10.0.0 | Đi kèm Node.js |
| PostgreSQL | >= 16 | Bắt buộc |
| Nginx | >= 1.24 | Reverse proxy |
| PM2 | >= 5.0 | Process manager |
| Git | >= 2.40 | Để clone source code |
| OpenSSL | bất kỳ | Để tạo secret keys |

### Cài đặt phần mềm (Ubuntu/Debian)

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 16
sudo apt-get install -y postgresql-16 postgresql-client-16

# Nginx
sudo apt-get install -y nginx

# PM2
sudo npm install -g pm2

# Git
sudo apt-get install -y git
```

---

## 3. Hướng dẫn cài đặt từng bước

### Bước 1: Clone source code

```bash
cd /opt
sudo git clone <repository-url> rtr-hrm
sudo chown -R $USER:$USER /opt/rtr-hrm
cd /opt/rtr-hrm
```

### Bước 2: Cài đặt dependencies

```bash
npm ci --production=false
```

> **Lưu ý:** Dùng `npm ci` thay vì `npm install` để đảm bảo cài đúng phiên bản trong `package-lock.json`.

### Bước 3: Tạo file biến môi trường

```bash
cp .env.example .env
# Hoặc tạo mới nếu không có .env.example
nano .env
```

Xem [Mục 4](#4-cấu-hình-biến-môi-trường-env) để biết chi tiết từng biến.

### Bước 4: Khởi tạo database

```bash
npx prisma generate
npx prisma db push
npm run seed:prod
```

Xem [Mục 6](#6-khởi-tạo-database) để biết chi tiết.

### Bước 5: Build ứng dụng

```bash
npm run build
```

> Build thành công sẽ tạo thư mục `.next/` chứa ứng dụng production.

### Bước 6: Chạy thử

```bash
npm run start
# Ứng dụng chạy tại http://localhost:3000
```

Truy cập `http://<server-ip>:3000` để kiểm tra. Nếu OK, tiếp tục cấu hình PM2 và Nginx.

---

## 4. Cấu hình biến môi trường (.env)

Tạo file `.env` tại thư mục gốc dự án với nội dung sau:

```env
# ═══════════════════════════════════════════════════════════
# BẮT BUỘC — Ứng dụng KHÔNG chạy được nếu thiếu
# ═══════════════════════════════════════════════════════════

# Database PostgreSQL connection string
# Format: postgresql://<user>:<password>@<host>:<port>/<database>?schema=public
DATABASE_URL="postgresql://rtr_user:MatKhauManh123@localhost:5432/rtr_hrm?schema=public"

# Secret key cho NextAuth — mã hóa session và JWT
# Tạo bằng lệnh: openssl rand -base64 32
# Tối thiểu 32 ký tự, KHÔNG dùng giá trị mặc định
NEXTAUTH_SECRET="thay-bang-gia-tri-tu-lenh-openssl-rand"

# URL gốc của ứng dụng (dùng cho NextAuth callback)
# Production: https://hrm.vierp.com
# Staging: https://hrm-staging.vierp.com
NEXTAUTH_URL="https://hrm.vierp.com"

# Secret key để xác thực cron job requests
# Tạo bằng lệnh: openssl rand -hex 32
CRON_SECRET="thay-bang-gia-tri-tu-lenh-openssl-rand-hex"

# ═══════════════════════════════════════════════════════════
# TÙY CHỌN — Tính năng bổ sung, bỏ qua nếu không cần
# ═══════════════════════════════════════════════════════════

# API Key của Anthropic — cho tính năng AI Copilot HR
# Lấy tại: https://console.anthropic.com → API Keys → Create Key
# Key bắt đầu bằng "sk-ant-"
# Cần đăng ký tài khoản Anthropic và thêm credit (phương thức thanh toán)
# Model được sử dụng: Claude Sonnet
# Chi phí ước tính: ~$5-20/tháng tùy mức độ sử dụng
# Nếu không cấu hình: tính năng AI Copilot sẽ bị vô hiệu hóa
ANTHROPIC_API_KEY="sk-ant-xxxx"

# Cấu hình SMTP — cho tính năng gửi email thông báo
# Nếu không cấu hình: các chức năng gửi email sẽ không hoạt động
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="hrm@vierp.com"
SMTP_PASS="app-password-cua-email"
SMTP_FROM="HRM RTR <hrm@vierp.com>"

# URL công khai của ứng dụng (dùng trong email, link chia sẻ)
# Thường trùng với NEXTAUTH_URL
NEXT_PUBLIC_APP_URL="https://hrm.vierp.com"

# Mật khẩu cho tài khoản admin khi seed database
# Nếu không đặt, mật khẩu mặc định sẽ được sử dụng (xem seed-prod.ts)
# CHỈ dùng khi chạy seed lần đầu
SEED_ADMIN_PASSWORD="MatKhauAdmin@Manh2026!"
```

### Bảng tổng hợp biến môi trường

| Biến | Bắt buộc | Mô tả | Ví dụ |
|------|----------|-------|-------|
| `DATABASE_URL` | **BẮT BUỘC** | Connection string PostgreSQL | `postgresql://user:pass@localhost:5432/rtr_hrm` |
| `NEXTAUTH_SECRET` | **BẮT BUỘC** | Secret key mã hóa session (>= 32 ký tự) | Tạo bằng `openssl rand -base64 32` |
| `NEXTAUTH_URL` | **BẮT BUỘC** | URL gốc ứng dụng cho NextAuth callback | `https://hrm.vierp.com` |
| `CRON_SECRET` | **BẮT BUỘC** | Secret xác thực cron job requests | Tạo bằng `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | Tùy chọn | API Key Anthropic cho AI Copilot HR | `sk-ant-api03-xxxx` |
| `SMTP_HOST` | Tùy chọn | Địa chỉ SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | Tùy chọn | Cổng SMTP | `587` |
| `SMTP_USER` | Tùy chọn | Tài khoản SMTP | `hrm@vierp.com` |
| `SMTP_PASS` | Tùy chọn | Mật khẩu SMTP (App Password) | `xxxx-xxxx-xxxx-xxxx` |
| `SMTP_FROM` | Tùy chọn | Tên + email người gửi | `HRM RTR <hrm@vierp.com>` |
| `NEXT_PUBLIC_APP_URL` | Tùy chọn | URL công khai (dùng trong email) | `https://hrm.vierp.com` |
| `SEED_ADMIN_PASSWORD` | Tùy chọn | Mật khẩu admin khi seed lần đầu | `MatKhauAdmin@Manh2026!` |

---

## 5. Hướng dẫn lấy API Keys

### 5.1. Anthropic API Key (cho AI Copilot HR)

Tính năng AI Copilot HR sử dụng model **Claude Sonnet** của Anthropic để hỗ trợ tư vấn nhân sự, tra cứu thông tin. Nếu không cần tính năng này, có thể bỏ qua.

**Các bước lấy API Key:**

1. **Truy cập** [https://console.anthropic.com](https://console.anthropic.com)
2. **Đăng ký tài khoản** (nếu chưa có):
   - Nhấn **Sign Up**
   - Nhập email công ty, tạo mật khẩu
   - Xác nhận email qua hộp thư
3. **Thêm phương thức thanh toán** (bắt buộc để sử dụng API):
   - Vào **Settings** (biểu tượng bánh răng) > **Billing**
   - Nhấn **Add Payment Method**
   - Nhập thông tin thẻ Visa/Mastercard quốc tế
   - Khuyến nghị đặt **spending limit** (giới hạn chi tiêu) để kiểm soát chi phí
4. **Tạo API Key:**
   - Vào **Settings** > **API Keys**
   - Nhấn **Create Key**
   - Đặt tên cho key (ví dụ: `rtr-hrm-production`)
   - Nhấn **Create**
   - **Copy key ngay lập tức** — key chỉ hiển thị MỘT LẦN duy nhất
   - Key có dạng: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx`
5. **Dán key vào file `.env`:**
   ```
   ANTHROPIC_API_KEY="sk-ant-api03-xxxx..."
   ```

**Chi phí ước tính:**

| Mức sử dụng | Số câu hỏi/ngày | Chi phí/tháng |
|-------------|-----------------|---------------|
| Ít | 5-10 | ~$3-5 |
| Bình thường | 10-50 | ~$5-10 |
| Nhiều | 100+ | ~$10-20 |

- Có thể đặt giới hạn chi tiêu (spending limit) trong phần Billing để tránh phát sinh chi phí ngoài dự kiến.

**Lưu ý bảo mật:**
- KHÔNG chia sẻ API Key qua email, chat, hoặc lưu trong source code
- Nếu nghi ngờ key bị lộ, vào Console > API Keys > **Revoke** key cũ và tạo key mới
- Rotate key định kỳ mỗi 3-6 tháng

### 5.2. SMTP (Gmail App Password)

Nếu sử dụng Gmail làm SMTP server:

1. Đăng nhập Gmail với tài khoản công ty
2. Truy cập [https://myaccount.google.com/security](https://myaccount.google.com/security)
3. Bật **Xác minh 2 bước** (2-Step Verification) nếu chưa bật
4. Vào **App Passwords** (Mật khẩu ứng dụng)
5. Chọn **Other (Custom name)** > nhập "VietERP HRM" > nhấn **Generate**
6. Copy mật khẩu 16 ký tự > dán vào `SMTP_PASS` trong file `.env`

---

## 6. Khởi tạo database

### Bước 1: Tạo database và user trong PostgreSQL

```bash
sudo -u postgres psql
```

```sql
-- Tạo user
CREATE USER rtr_user WITH PASSWORD 'MatKhauManh123';

-- Tạo database
CREATE DATABASE rtr_hrm OWNER rtr_user;

-- Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE rtr_hrm TO rtr_user;

-- Thoát
\q
```

### Bước 2: Generate Prisma Client

```bash
npx prisma generate
```

### Bước 3: Đẩy schema lên database

```bash
npx prisma db push
```

> Lệnh này tạo tất cả bảng, index, enum theo schema Prisma. Không cần chạy migration riêng.

### Bước 4: Seed dữ liệu ban đầu (production)

```bash
npm run seed:prod
```

Lệnh seed sẽ tạo:
- **Tài khoản Super Admin:** `admin@vierp.com`
- **Cấu hình hệ thống:** ngày công chuẩn (26), mức giảm trừ cá nhân (11.000.000), giảm trừ người phụ thuộc (4.400.000), v.v.
- **Phòng ban cốt lõi:** Kỹ Thuật (KT), Sản Xuất (SX), Hành Chính - Nhân Sự (HCNS), R&D (RND), Kinh Doanh (KD), Ban Giám Đốc (BGD)

### Kiểm tra database

```bash
npx prisma studio
# Mở trình duyệt tại http://localhost:5555 để xem dữ liệu
```

---

## 7. Chạy production

### Sử dụng PM2

```bash
# Cài đặt PM2 (nếu chưa có)
sudo npm install -g pm2

# Khởi chạy ứng dụng
pm2 start npm --name "rtr-hrm" -- start

# Kiểm tra trạng thái
pm2 status

# Xem logs
pm2 logs rtr-hrm

# Xem logs lỗi
pm2 logs rtr-hrm --err

# Tự khởi động lại khi server reboot
pm2 startup
pm2 save
```

### Các lệnh PM2 thường dùng

| Lệnh | Mô tả |
|-------|--------|
| `pm2 start npm --name "rtr-hrm" -- start` | Khởi chạy ứng dụng |
| `pm2 stop rtr-hrm` | Dừng ứng dụng |
| `pm2 restart rtr-hrm` | Khởi động lại |
| `pm2 reload rtr-hrm` | Reload không downtime (zero-downtime) |
| `pm2 delete rtr-hrm` | Xóa process khỏi PM2 |
| `pm2 logs rtr-hrm` | Xem logs realtime |
| `pm2 logs rtr-hrm --lines 100` | Xem 100 dòng log gần nhất |
| `pm2 monit` | Giám sát CPU/RAM realtime |

### File cấu hình PM2 (khuyến nghị)

Tạo file `ecosystem.config.js` tại thư mục gốc:

```javascript
module.exports = {
  apps: [
    {
      name: "rtr-hrm",
      script: "npm",
      args: "start",
      cwd: "/opt/rtr-hrm",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

Khởi chạy bằng file cấu hình:

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 8. Cấu hình Nginx

### Reverse Proxy với SSL

Tạo file `/etc/nginx/sites-available/rtr-hrm`:

```nginx
server {
    listen 80;
    server_name hrm.vierp.com;

    # Chuyển hướng HTTP sang HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hrm.vierp.com;

    # Chứng chỉ SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/hrm.vierp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hrm.vierp.com/privkey.pem;

    # Cấu hình SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Headers bảo mật
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Giới hạn kích thước upload
    client_max_body_size 10M;

    # Reverse proxy đến Next.js (port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache tài nguyên tĩnh (CSS, JS, hình ảnh)
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/rtr-hrm-access.log;
    error_log /var/log/nginx/rtr-hrm-error.log;
}
```

### Kích hoạt cấu hình

```bash
# Tạo symlink
sudo ln -s /etc/nginx/sites-available/rtr-hrm /etc/nginx/sites-enabled/

# Kiểm tra cấu hình hợp lệ
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Cài SSL miễn phí với Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hrm.vierp.com

# Tự động gia hạn (certbot tự thêm cron, kiểm tra bằng):
sudo certbot renew --dry-run
```

---

## 9. Cron Jobs

### Kiểm tra hợp đồng sắp hết hạn

Hệ thống có API endpoint `/api/cron/contract-expiry` để kiểm tra và cảnh báo hợp đồng sắp hết hạn. Endpoint yêu cầu header `x-cron-secret` phải khớp với biến `CRON_SECRET` trong `.env`.

**Thiết lập cron job chạy hàng ngày lúc 8:00 sáng:**

```bash
crontab -e
```

Thêm dòng sau:

```cron
# Kiểm tra hợp đồng sắp hết hạn — chạy lúc 8:00 sáng mỗi ngày
0 8 * * * curl -sf -H "x-cron-secret: GIA_TRI_CRON_SECRET_CUA_BAN" https://hrm.vierp.com/api/cron/contract-expiry >> /var/log/rtr-hrm-cron.log 2>&1
```

> **Lưu ý:** Thay `GIA_TRI_CRON_SECRET_CUA_BAN` bằng giá trị thực của biến `CRON_SECRET` trong file `.env`.

### Kiểm tra cron hoạt động

```bash
# Chạy thủ công để test
curl -sf -H "x-cron-secret: GIA_TRI_CRON_SECRET" http://localhost:3000/api/cron/contract-expiry

# Kết quả mong đợi: JSON response với danh sách hợp đồng sắp hết hạn
# Nếu trả về 401: sai CRON_SECRET
```

---

## 10. Tài khoản mặc định

Sau khi chạy `npm run seed:prod`, hệ thống tạo tài khoản Super Admin:

| Thông tin | Giá trị |
|-----------|---------|
| Email | `admin@vierp.com` |
| Mật khẩu | Giá trị của biến `SEED_ADMIN_PASSWORD`, hoặc mặc định `RTR@Admin2026!` |
| Vai trò | `SUPER_ADMIN` (toàn quyền) |
| Tên hiển thị | Admin RTR |

> **QUAN TRỌNG:** BẮT BUỘC ĐỔI MẬT KHẨU NGAY SAU KHI ĐĂNG NHẬP LẦN ĐẦU.

---

## 11. Bảo mật

### 11.1. Checklist ngay sau khi deploy

- [ ] Đổi mật khẩu tài khoản `admin@vierp.com`
- [ ] Đảm bảo `NEXTAUTH_SECRET` là giá trị ngẫu nhiên mạnh (>= 32 ký tự), tạo bằng `openssl rand -base64 32`
- [ ] Đảm bảo `CRON_SECRET` là giá trị ngẫu nhiên mạnh, tạo bằng `openssl rand -hex 32`
- [ ] File `.env` chỉ có owner đọc được:
  ```bash
  chmod 600 /opt/rtr-hrm/.env
  ```
- [ ] PostgreSQL chỉ cho phép kết nối từ localhost hoặc IP nội bộ
- [ ] Firewall chỉ mở port 80 và 443 (KHÔNG mở port 3000 ra ngoài)
- [ ] HTTPS đã được bật (xem mục 8)

### 11.2. Hệ thống phân quyền RBAC — 6 vai trò

| Vai trò | Mô tả | Quyền chính |
|---------|-------|-------------|
| `SUPER_ADMIN` | Quản trị viên cao nhất | Toàn quyền hệ thống, quản lý user |
| `HR_MANAGER` | Trưởng phòng Nhân sự | Quản lý toàn bộ nhân sự, phê duyệt |
| `HR_STAFF` | Nhân viên Nhân sự | Quản lý hồ sơ, hợp đồng, chấm công |
| `DEPT_MANAGER` | Trưởng phòng ban | Xem/quản lý nhân viên trong phòng ban |
| `EMPLOYEE` | Nhân viên | Xem thông tin cá nhân |
| `ACCOUNTANT` | Kế toán | Xem bảng lương, báo cáo tài chính |

Tất cả API endpoints đều yêu cầu xác thực qua NextAuth JWT. Hệ thống ghi lại audit log cho mọi thao tác CREATE/UPDATE/DELETE/LOGIN.

### 11.3. Khuyến nghị bảo mật bổ sung

- Bật HTTPS và HSTS (đã cấu hình trong Nginx)
- Rotate API keys (Anthropic, CRON_SECRET) mỗi 3-6 tháng
- Giám sát logs thường xuyên: `pm2 logs rtr-hrm --err`
- Kiểm tra lỗ hổng dependencies: `npm audit`
- KHÔNG bao giờ commit file `.env` lên Git
- Sử dụng mật khẩu mạnh cho PostgreSQL (chữ hoa, chữ thường, số, ký tự đặc biệt, >= 16 ký tự)

---

## 12. Backup database

### Script backup tự động

Tạo file `/opt/rtr-hrm/backup.sh`:

```bash
#!/bin/bash

# === Cấu hình ===
DB_NAME="rtr_hrm"
DB_USER="rtr_user"
BACKUP_DIR="/opt/rtr-hrm/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# === Tạo thư mục backup nếu chưa có ===
mkdir -p "$BACKUP_DIR"

# === Thực hiện backup ===
echo "[$(date)] Bắt đầu backup database $DB_NAME..."
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup thành công: $BACKUP_FILE"
    echo "[$(date)] Kích thước: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "[$(date)] LỖI: Backup thất bại!"
    exit 1
fi

# === Xóa backup cũ hơn RETENTION_DAYS ngày ===
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Đã xóa backup cũ hơn $RETENTION_DAYS ngày."
```

Cấp quyền thực thi:

```bash
chmod +x /opt/rtr-hrm/backup.sh
```

### Thiết lập backup tự động (cron)

```bash
crontab -e
```

Thêm dòng:

```cron
# Backup database lúc 2:00 sáng mỗi ngày
0 2 * * * /opt/rtr-hrm/backup.sh >> /var/log/rtr-hrm-backup.log 2>&1
```

### Cấu hình .pgpass (tránh nhập mật khẩu thủ công)

```bash
echo "localhost:5432:rtr_hrm:rtr_user:MatKhauManh123" > ~/.pgpass
chmod 600 ~/.pgpass
```

### Khôi phục từ backup

```bash
# Khôi phục vào database hiện tại
gunzip -c /opt/rtr-hrm/backups/rtr_hrm_20260314_020000.sql.gz | psql -U rtr_user -h localhost rtr_hrm
```

### Lưu ý về backup

- Kiểm tra backup hàng tuần bằng cách restore vào database test
- Lưu bản sao backup ở ổ đĩa riêng hoặc cloud storage (S3, Google Cloud Storage)
- Giữ ít nhất 30 ngày backup gần nhất

---

## 13. Cập nhật ứng dụng

### Quy trình cập nhật tiêu chuẩn

```bash
cd /opt/rtr-hrm

# 1. Backup database trước khi cập nhật
./backup.sh

# 2. Kéo code mới từ repository
git pull origin main

# 3. Cài đặt dependencies mới (nếu có thay đổi package-lock.json)
npm ci --production=false

# 4. Cập nhật Prisma Client
npx prisma generate

# 5. Cập nhật database schema (nếu có thay đổi schema.prisma)
npx prisma db push

# 6. Build lại ứng dụng
npm run build

# 7. Khởi động lại (zero-downtime reload)
pm2 reload rtr-hrm

# 8. Kiểm tra ứng dụng hoạt động bình thường
pm2 status
pm2 logs rtr-hrm --lines 20
```

### Rollback nếu gặp lỗi

```bash
# 1. Xem 5 commit gần nhất
git log --oneline -5

# 2. Quay về commit trước
git checkout <commit-hash>

# 3. Build và restart
npm ci --production=false
npx prisma generate
npm run build
pm2 reload rtr-hrm

# 4. Restore database nếu cần (từ backup trước khi cập nhật)
gunzip -c backups/<file-backup-truoc-cap-nhat>.sql.gz | psql -U rtr_user -h localhost rtr_hrm
```

---

## 14. Xử lý sự cố

### Bảng lỗi thường gặp và cách xử lý

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|-------------|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL chưa chạy | `sudo systemctl start postgresql` |
| `P1001: Can't reach database` | Sai `DATABASE_URL` hoặc DB chưa tạo | Kiểm tra connection string trong `.env`, tạo database |
| `NEXTAUTH_SECRET missing` | Thiếu biến môi trường bắt buộc | Thêm `NEXTAUTH_SECRET` vào `.env`, restart app |
| `prisma: command not found` | Chưa cài dependencies | Chạy `npm ci` |
| `Module not found` | Dependencies chưa cài hoặc thiếu | `npm ci --production=false` rồi build lại |
| `EACCES: permission denied` | Quyền file/thư mục không đúng | `sudo chown -R $USER:$USER /opt/rtr-hrm` |
| `Port 3000 already in use` | Process khác đang dùng port 3000 | `pm2 delete rtr-hrm` rồi start lại |
| `502 Bad Gateway` (Nginx) | Next.js chưa chạy hoặc port sai | Kiểm tra `pm2 status`, restart ứng dụng |
| `Cron 401 Unauthorized` | Sai `CRON_SECRET` trong header | Kiểm tra giá trị `x-cron-secret` khớp với `.env` |
| Build lỗi TypeScript | Lỗi code hoặc thiếu type definitions | Xem chi tiết log build, chạy `npx tsc --noEmit` |
| Trang trắng sau deploy | Build cũ hoặc build lỗi | Xóa `.next/`, chạy `npm run build` lại, restart |
| `Invalid environment variables` | Thiếu biến bắt buộc trong `.env` | Kiểm tra lại mục 4, bổ sung biến thiếu |
| `Hydration mismatch` | Khác biệt render giữa server và client | Xóa `.next/`, build lại |

### Các lệnh chẩn đoán hữu ích

```bash
# Kiểm tra ứng dụng có đang chạy không
pm2 status

# Xem logs lỗi gần nhất
pm2 logs rtr-hrm --err --lines 50

# Kiểm tra PostgreSQL
sudo systemctl status postgresql
psql -U rtr_user -h localhost -d rtr_hrm -c "SELECT 1;"

# Kiểm tra Nginx
sudo nginx -t
sudo systemctl status nginx
sudo tail -50 /var/log/nginx/rtr-hrm-error.log

# Kiểm tra port 3000 có đang được sử dụng
ss -tlnp | grep 3000

# Kiểm tra dung lượng ổ đĩa
df -h

# Kiểm tra RAM
free -h

# Kiểm tra TypeScript có lỗi không
npx tsc --noEmit
```

---

## 15. Health Check

### Endpoint kiểm tra sức khỏe ứng dụng

```
GET /api/health
```

### Kiểm tra thủ công

```bash
curl -sf http://localhost:3000/api/health
# Kết quả mong đợi: { "status": "ok", "database": "connected" }
```

### Giám sát tự động (cron)

Thêm vào crontab để kiểm tra mỗi 5 phút và tự restart nếu lỗi:

```cron
# Health check mỗi 5 phút — tự restart nếu thất bại
*/5 * * * * curl -sf http://localhost:3000/api/health > /dev/null || (echo "[$(date)] HEALTH CHECK FAILED — restarting" >> /var/log/rtr-hrm-health.log && pm2 restart rtr-hrm)
```

### Giám sát với PM2

```bash
# Xem CPU, RAM, restart count realtime
pm2 monit

# Xem thông tin chi tiết process
pm2 show rtr-hrm
```

---

## Phụ lục: Tóm tắt nhanh (Quick Start)

Dành cho người đã quen triển khai, tóm gọn tất cả bước:

```bash
# 1. Clone & cài đặt
cd /opt && sudo git clone <repo-url> rtr-hrm && cd rtr-hrm
sudo chown -R $USER:$USER .
npm ci --production=false

# 2. Biến môi trường
cp .env.example .env && nano .env
# Điền bắt buộc: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, CRON_SECRET

# 3. Database
sudo -u postgres createuser rtr_user -P
sudo -u postgres createdb rtr_hrm -O rtr_user
npx prisma generate && npx prisma db push && npm run seed:prod

# 4. Build & chạy
npm run build
pm2 start npm --name "rtr-hrm" -- start
pm2 startup && pm2 save

# 5. Nginx + SSL
sudo nano /etc/nginx/sites-available/rtr-hrm   # Paste config từ mục 8
sudo ln -s /etc/nginx/sites-available/rtr-hrm /etc/nginx/sites-enabled/
sudo certbot --nginx -d hrm.vierp.com
sudo systemctl reload nginx

# 6. Cron jobs
crontab -e
# 0 8 * * * curl -sf -H "x-cron-secret: ..." https://hrm.vierp.com/api/cron/contract-expiry >> /var/log/rtr-hrm-cron.log 2>&1
# 0 2 * * * /opt/rtr-hrm/backup.sh >> /var/log/rtr-hrm-backup.log 2>&1

# 7. Đăng nhập admin@vierp.com -> ĐỔI MẬT KHẨU NGAY
```

---

> **Tài liệu được tạo ngày 14/03/2026.**
> Phiên bản ứng dụng: VietERP-HRM v0.1.0 | Next.js 14 | Prisma 7 | PostgreSQL 16+
> Liên hệ đội phát triển nếu cần hỗ trợ thêm.
