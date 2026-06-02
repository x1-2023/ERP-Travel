#!/bin/bash
# ============================================================
# LIPHOCO ERP — Setup Script
# Chạy script này từ thư mục root Viet-ERP
# ============================================================

set -e

ERP_DIR=~/GithubMac/Viet-ERP

echo "🏭 LIPHOCO ERP Setup..."

# 1. Copy branding config
echo "📦 [1/5] Setting up branding..."
cp packages/branding/src/liphoco.config.ts packages/branding/src/liphoco.config.ts 2>/dev/null || true

# 2. Copy costing module
echo "🧮 [2/5] Setting up costing module..."
mkdir -p packages/ai-copilot/src/modules/costing
# File đã được tạo sẵn, chỉ cần copy vào

# 3. Copy .env
echo "⚙️  [3/5] Setting up environment..."
cp .env.liphoco .env 2>/dev/null || true
echo "   ⚠️  Nhớ cập nhật ANTHROPIC_API_KEY và SSO_CLIENT_SECRET trong .env"

# 4. Update package.json scripts
echo "📝 [4/5] Adding LIPHOCO-specific scripts..."
# Thêm scripts hữu ích (chạy thủ công nếu cần)
# npm pkg set scripts.dev:costing="turbo run dev --filter=ExcelAI --filter=CRM"
# npm pkg set scripts.brand:check="node -e \"const {getBrand}=require('@vierp/branding');console.log(getBrand().platform.name)\""

# 5. Setup shell aliases
echo "🔧 [5/5] Setting up CLI aliases..."
if ! grep -q "LIPHOCO ERP aliases" ~/.zshrc 2>/dev/null; then
  cat >> ~/.zshrc << 'ALIASES'

# === LIPHOCO ERP aliases ===
alias erp="cd ~/GithubMac/Viet-ERP"
alias erp-up="erp && docker compose up -d"
alias erp-down="erp && docker compose down"
alias erp-dev="erp && npm run dev"
alias erp-build="erp && npm run build"
alias erp-lint="erp && npm run lint"
alias erp-sync="erp && git pull origin main && git add -A && git commit -m 'sync: $(date +%Y%m%d-%H%M)' && git push origin main"
alias erp-status="erp && git status && docker compose ps"
alias erp-log="erp && docker compose logs -f --tail=50"
alias erp-db="docker exec -it vierp-postgres psql -U erp -d liphoco_dev"
ALIASES
  echo "   ✅ Aliases added to ~/.zshrc — run: source ~/.zshrc"
else
  echo "   ℹ️  Aliases already exist in ~/.zshrc"
fi

echo ""
echo "✅ LIPHOCO ERP setup complete!"
echo ""
echo "📋 Bước tiếp theo:"
echo "   1. Sửa .env với API keys thực tế"
echo "   2. source ~/.zshrc"
echo "   3. erp-up        → Khởi động infrastructure"
echo "   4. erp-dev       → Chạy dev server"
echo "   5. erp-sync      → Git sync (dùng từ phone qua OpenClaw)"
echo ""
echo "📱 Từ phone:"
echo "   • Telegram @MacminiVietBot → gõ: erp-sync"
echo "   • VS Code Tunnel → https://vscode.dev/tunnel/quocviets-mac-minilo"
