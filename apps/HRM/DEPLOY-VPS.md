# Deploy ứng dụng lên VPS RTR — Hướng dẫn từng bước

> Ghi lại đúng quy trình đã thực hiện khi deploy VietERP-HRM lên VPS.
> Lần sau deploy app mới, làm lại từ đầu theo thứ tự này.

---

## 1. Tạo SSH key để đăng nhập VPS không cần mật khẩu

```bash
# Kiểm tra đã có SSH key chưa
ls ~/.ssh/id_ed25519.pub

# Nếu chưa có, tạo mới
ssh-keygen -t ed25519 -C "email@example.com"

# Copy key lên server (cần nhập mật khẩu lần đầu)
sshpass -p $'rty!@#fgh$%^' ssh-copy-id -o StrictHostKeyChecking=no lam@171.244.40.23

# Test — phải vào được không cần mật khẩu
ssh lam@171.244.40.23 "echo OK"
```

> **Lưu ý:** Mật khẩu chứa ký tự đặc biệt `!@#$%^`, dùng `$'...'` để escape đúng.
> Nếu `.ssh` bị lỗi permission (owned by root), fix bằng:
> ```bash
> ssh lam@171.244.40.23 'echo '"'"'rty!@#fgh$%^'"'"' | sudo -S chown -R lam:lam /home/lam/.ssh'
> ```

---

## 2. Tạo SSH key trên VPS để kết nối GitHub

```bash
# SSH vào server
ssh lam@171.244.40.23

# Tạo key
ssh-keygen -t ed25519 -C "nclamvn@gmail.com" -f ~/.ssh/id_ed25519 -N ""

# Cấu hình SSH cho GitHub
cat >> ~/.ssh/config << EOF
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
EOF
chmod 600 ~/.ssh/config

# Lấy public key — copy dòng này
cat ~/.ssh/id_ed25519.pub

# Thêm key vào GitHub: https://github.com/settings/ssh/new

# Thêm GitHub vào known_hosts & test
ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
ssh -T git@github.com
# → "Hi nclamvn! You've successfully authenticated..."
```

---

## 3. Chuẩn bị Docker files trong project (trên máy local)

### 3.1 Thêm `output: "standalone"` vào Next.js config

```js
// next.config.mjs
const nextConfig = {
  output: "standalone",   // ← Thêm dòng này
  // ... config khác
}
```

### 3.2 Tạo `Dockerfile`

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

RUN mkdir -p /data && chown -R nextjs:nodejs /data /app
USER nextjs

EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### 3.3 Tạo `docker-compose.yml`

```yaml
services:
  app:
    build: .
    container_name: rtr-hrm            # ← Đổi tên theo app
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://rtr_hrm:rtr_hrm_secret@db:5432/rtr_hrm
    volumes:
      - app-data:/data
    networks:
      - internal
      - caddy                          # ← BẮT BUỘC: để Caddy proxy tới
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    container_name: rtr-hrm-db         # ← Đổi tên theo app
    restart: unless-stopped
    environment:
      POSTGRES_DB: rtr_hrm
      POSTGRES_USER: rtr_hrm
      POSTGRES_PASSWORD: rtr_hrm_secret
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rtr_hrm"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  db-data:
  app-data:

networks:
  internal:
  caddy:
    external: true                     # ← Network chung với Caddy container
```

> **Quan trọng:** KHÔNG expose port ra ngoài (không có `ports:`). Caddy proxy qua Docker network `caddy`.

### 3.4 Tạo `.dockerignore`

```
node_modules
.next
.git
.gitignore
*.md
.env
.env.local
```

### 3.5 Commit & push

```bash
git add Dockerfile docker-compose.yml .dockerignore next.config.mjs
git commit -m "feat: add Docker deployment config"
git push origin main
```

---

## 4. Clone repo trên VPS và tạo file .env

```bash
ssh lam@171.244.40.23

# Clone
cd ~
git clone git@github.com:Real-Time-Robotics/VietERP-HRM.git rtr-hrm
cd rtr-hrm

# Tạo .env (chỉnh theo app)
cat > .env << 'EOF'
DATABASE_URL="postgresql://rtr_hrm:rtr_hrm_secret@db:5432/rtr_hrm"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="https://hrm.vierp.com"
AUTH_SECRET="<openssl rand -base64 32>"
NEXT_PUBLIC_APP_URL="https://hrm.vierp.com"
NEXT_PUBLIC_SHOW_DEMO="false"
CRON_SECRET="<openssl rand -hex 32>"
RENDER_DISK_PATH="/data"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="VietERP HRM <hrm@vierp.com>"
ANTHROPIC_API_KEY=""
EOF
```

---

## 5. Build Docker image và khởi chạy

```bash
cd ~/rtr-hrm

# Build & chạy (lần đầu mất ~7-10 phút)
docker compose up -d --build

# Kiểm tra container đã chạy
docker ps | grep rtr-hrm

# Xem logs
docker logs rtr-hrm --tail 20
# → Phải thấy: "✓ Ready in XXXms"
```

---

## 6. Khởi tạo Database (Prisma)

App chạy standalone nên không có Prisma CLI. Dùng builder stage để chạy migration:

```bash
cd ~/rtr-hrm

# Build image từ builder stage (có đầy đủ node_modules)
docker build --target builder -t rtr-hrm-migrate .

# Push schema vào database
docker run --rm \
  --network rtr-hrm_internal \
  -e DATABASE_URL="postgresql://rtr_hrm:rtr_hrm_secret@rtr-hrm-db:5432/rtr_hrm" \
  rtr-hrm-migrate \
  npx prisma db push --accept-data-loss=false

# → "Your database is now in sync with your Prisma schema"
```

### Seed admin user

Vì project dùng `@prisma/adapter-pg`, seed file thường không chạy trực tiếp được.
Dùng `node -e` với adapter:

```bash
docker run --rm \
  --network rtr-hrm_internal \
  -e DATABASE_URL="postgresql://rtr_hrm:rtr_hrm_secret@rtr-hrm-db:5432/rtr_hrm" \
  -w /app rtr-hrm-migrate node -e "
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const pw = await bcrypt.hash('RTR@Admin2026!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vierp.com' },
    create: { email: 'admin@vierp.com', password: pw, name: 'Admin RTR', role: 'SUPER_ADMIN' },
    update: {}
  });
  console.log('Admin seeded:', admin.email, admin.role);
}

main().catch(console.error).finally(() => prisma.\$disconnect());
"

# → "Admin seeded: admin@vierp.com SUPER_ADMIN"
```

---

## 7. Cấu hình Caddy proxy cho domain

Caddy chạy trong Docker container `caddy`, config tại `/home/hung/caddy/conf/Caddyfile`.

```bash
# Thêm site mới vào Caddyfile
echo 'rty!@#fgh$%^' | sudo -S bash -c 'cat >> /home/hung/caddy/conf/Caddyfile << "EOF"

hrm.vierp.com {
    tls software@vierp.com
    reverse_proxy rtr-hrm:3000 {
        header_up X-Real-IP {http.request.header.CF-Connecting-IP}
        header_up X-Forwarded-For {http.request.header.CF-Connecting-IP}
    }
}
EOF'

# Reload Caddy (không cần restart container)
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## 8. Trỏ DNS và kiểm tra

1. Vào DNS provider (Cloudflare, etc.)
2. Thêm A record: `hrm.vierp.com` → `171.244.40.23`
3. Đợi DNS propagate (~1-5 phút)
4. Truy cập `https://hrm.vierp.com`
5. Đăng nhập: `admin@vierp.com` / `RTR@Admin2026!`

### Kiểm tra health

```bash
# Từ trên server
curl -s http://localhost:3000/api/health
# → {"status":"ok","database":"connected",...}
```

---

## 9. Đăng nhập hệ thống

Truy cập `https://hrm.vierp.com` → trang đăng nhập sẽ hiển thị.

| Thông tin | Giá trị |
|-----------|---------|
| URL | `https://hrm.vierp.com` |
| Email | `admin@vierp.com` |
| Mật khẩu | `RTR@Admin2026!` |
| Vai trò | `SUPER_ADMIN` |

> Sau khi đăng nhập, vào **Admin > Users** để tạo thêm tài khoản cho nhân viên.

---

## Cập nhật app sau khi có code mới

```bash
ssh lam@171.244.40.23
cd ~/rtr-hrm
git pull origin main
docker compose up -d --build
# Nếu có thay đổi schema DB:
docker build --target builder -t rtr-hrm-migrate .
docker run --rm --network rtr-hrm_internal \
  -e DATABASE_URL="postgresql://rtr_hrm:rtr_hrm_secret@rtr-hrm-db:5432/rtr_hrm" \
  rtr-hrm-migrate npx prisma db push
```

---

## Thông tin server

| Thông tin | Giá trị |
|-----------|---------|
| IP | `171.244.40.23` |
| SSH | `ssh lam@171.244.40.23` (key-based, không cần mật khẩu) |
| Sudo password | `rty!@#fgh$%^` |
| OS | Ubuntu 24.04 |
| Docker | v28 + Compose v2 |
| Caddy container | `caddy` trên network `caddy` |
| Caddyfile | `/home/hung/caddy/conf/Caddyfile` |
| TLS email | `software@vierp.com` |

## Apps đang chạy trên server

| App | Container | Domain |
|-----|-----------|--------|
| HRM | `rtr-hrm` + `rtr-hrm-db` | `hrm.vierp.com` |
| MRP | `vierp-mrp` + `vierp-mrp-db` + `vierp-mrp-redis` | `mrp.vierp.com` |
| Website | `rtr-website` | `web.vierp.com` |
| Supabase | `supabase-*` | `supabase.vierp.com` |
| SRS Streaming | `rtr-srs` | `streaming.vierp.com` |
| RustDesk | `hbbs` + `hbbr` | — |

## Lệnh hữu ích

```bash
# Xem logs
docker logs rtr-hrm --tail 50 -f

# Xem tất cả container
docker ps --format "table {{.Names}}\t{{.Status}}"

# Xem Caddyfile
cat /home/hung/caddy/conf/Caddyfile

# Dọn dẹp Docker
docker system prune -f && docker builder prune -f
```

## Bài học rút ra

1. **Mật khẩu đặc biệt** — Dùng `$'...'` hoặc `'"'"'...'"'"'` để escape `!@#$%^`
2. **Standalone output** — Next.js Docker bắt buộc `output: "standalone"` trong config
3. **Prisma CLI trong Docker** — Standalone image không có CLI, dùng builder stage (`--target builder`) để chạy migration
4. **PrismaClient adapter** — Nếu dùng `@prisma/adapter-pg`, seed phải khởi tạo PrismaClient với adapter, không dùng `new PrismaClient()` trần
5. **Caddy Docker network** — App phải join network `caddy` (external) để Caddy proxy tới được
6. **Không expose port** — Các app nội bộ đều dùng port 3000 internal, Caddy phân biệt qua container name
