#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
#                    PAGE VERIFICATION SCRIPT
#                    Test tất cả pages render được
# ══════════════════════════════════════════════════════════════════════════════

set -e

BASE_URL="${1:-http://localhost:5173}"
TIMEOUT=5

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# All routes to verify
ROUTES=(
    "/"
    "/analytics"
    "/calendar"
    "/promotions"
    "/promotions/new"
    "/claims"
    "/claims/new"
    "/customers"
    "/products"
    "/funds"
    "/funds/new"
    "/finance/accruals"
    "/finance/accruals/new"
    "/finance/deductions"
    "/finance/deductions/new"
    "/finance/journals"
    "/finance/cheques"
    "/operations/delivery"
    "/operations/delivery/calendar"
    "/operations/sell-tracking"
    "/operations/sell-tracking/trends"
    "/operations/inventory"
    "/operations/inventory/history"
    "/planning/budgets"
    "/planning/targets"
    "/planning/baselines"
    "/planning/templates"
    "/planning/scenarios"
    "/planning/clash-detection"
    "/integration"
    "/integration/erp"
    "/integration/dms"
    "/integration/webhooks"
    "/integration/security"
    "/ai"
    "/ai/insights"
    "/ai/recommendations"
    "/voice"
    "/bi"
    "/bi/reports"
    "/bi/analytics"
    "/bi/export"
    "/settings"
)

echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    📄 PAGE VERIFICATION                                       ║"
echo "║                    Base URL: $BASE_URL"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if server is running
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server not responding at $BASE_URL${NC}"
    echo "Please start the dev server first: npm run dev"
    exit 1
fi

TOTAL=${#ROUTES[@]}
PASSED=0
FAILED=0
FAILED_ROUTES=()

for route in "${ROUTES[@]}"; do
    url="$BASE_URL$route"
    
    # Check if page loads (HTTP 200)
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅${NC} $route"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} $route (HTTP $status)"
        FAILED=$((FAILED + 1))
        FAILED_ROUTES+=("$route")
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "                           RESULTS"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "  Total Routes: $TOTAL"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "Failed Routes:"
    for route in "${FAILED_ROUTES[@]}"; do
        echo "  - $route"
    done
    exit 1
else
    echo -e "${GREEN}✅ All pages verified successfully!${NC}"
    exit 0
fi
