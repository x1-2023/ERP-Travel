#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
#                    PHASE 1: MASTER VERIFICATION SCRIPT
#                    Chạy tất cả verification checks
# ══════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="${1:-$(pwd)}"
REPORT_FILE="verification-report-$(date +%Y%m%d-%H%M%S).md"

echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🔍 PHASE 1: MASTER VERIFICATION                            ║"
echo "║                    Project: $PROJECT_ROOT"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Initialize report
cat > "$REPORT_FILE" << EOF
# 📊 Verification Report
**Date:** $(date)
**Project:** $PROJECT_ROOT

---

EOF

# ═══════════════════════════════════════════════════════════════════════
# 1. CODE METRICS
# ═══════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[1/7] Verifying Code Metrics...${NC}"

cd "$PROJECT_ROOT"

# Count TypeScript files
TS_FILES=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v dist | grep -v .next | wc -l | tr -d ' ')

# Count lines of code
if command -v cloc &> /dev/null; then
    TOTAL_LOC=$(cloc . --exclude-dir=node_modules,dist,.next,.turbo,coverage --json 2>/dev/null | jq '.SUM.code' 2>/dev/null || echo "N/A")
else
    TOTAL_LOC=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v dist | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "N/A")
fi

# Count components
COMPONENTS=$(find . -path "*/components/*.tsx" | grep -v node_modules | wc -l | tr -d ' ')

# Count pages
PAGES=$(find . -path "*/pages/*.tsx" | grep -v node_modules | wc -l | tr -d ' ')

echo "  TypeScript Files: $TS_FILES"
echo "  Total LOC: $TOTAL_LOC"
echo "  Components: $COMPONENTS"
echo "  Pages: $PAGES"

cat >> "$REPORT_FILE" << EOF
## 1. Code Metrics

| Metric | Claimed | Actual | Status |
|--------|---------|--------|--------|
| TypeScript Files | 433 | $TS_FILES | $([ "$TS_FILES" -ge 400 ] && echo "✅" || echo "⚠️") |
| Total LOC | 81,059 | $TOTAL_LOC | - |
| Components | 118 | $COMPONENTS | $([ "$COMPONENTS" -ge 100 ] && echo "✅" || echo "⚠️") |
| Pages | 82 | $PAGES | $([ "$PAGES" -ge 80 ] && echo "✅" || echo "⚠️") |

EOF

# ═══════════════════════════════════════════════════════════════════════
# 2. BUILD CHECK
# ═══════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[2/7] Checking Build...${NC}"

BUILD_STATUS="✅ Pass"
if npm run build 2>&1 | tee /tmp/build-output.log | grep -q "error"; then
    BUILD_STATUS="❌ Fail"
    echo -e "  ${RED}Build failed${NC}"
else
    echo -e "  ${GREEN}Build successful${NC}"
fi

cat >> "$REPORT_FILE" << EOF
## 2. Build Status

**Status:** $BUILD_STATUS

EOF

# ═══════════════════════════════════════════════════════════════════════
# 3. TYPESCRIPT CHECK
# ═══════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[3/7] Checking TypeScript...${NC}"

TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")

if [ "$TS_ERRORS" -eq "0" ]; then
    echo -e "  ${GREEN}TypeScript: 0 errors${NC}"
    TS_STATUS="✅ 0 errors"
else
    echo -e "  ${RED}TypeScript: $TS_ERRORS errors${NC}"
    TS_STATUS="❌ $TS_ERRORS errors"
fi

cat >> "$REPORT_FILE" << EOF
## 3. TypeScript Check

**Status:** $TS_STATUS

EOF

# ═══════════════════════════════════════════════════════════════════════
# 4. LINT CHECK
# ═══════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[4/7] Checking ESLint...${NC}"

LINT_ERRORS=$(npm run lint 2>&1 | grep -c "error" || echo "0")
LINT_WARNINGS=$(npm run lint 2>&1 | grep -c "warning" || echo "0")

echo "  Errors: $LINT_ERRORS, Warnings: $LINT_WARNINGS"

cat >> "$REPORT_FILE" << EOF
## 4. ESLint Check

- Errors: $LINT_ERRORS
- Warnings: $LINT_WARNINGS

EOF

# ═══════════════════════════════════════════════════════════════════════
# 5. TEST CHECK
# ═══════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[5/7] Running Tests...${NC}"

TEST_OUTPUT=$(npm run test 2>&1 || true)
TESTS_PASSED=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= passed)' | head -1 || echo "0")
TESTS_FAILED=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= failed)' | head -1 || echo "0")

echo "  Passed: $TESTS_PASSED, Failed: $TESTS_FAILED"

cat >> "$REPORT_FILE" << EOF
## 5. Test Results

- Passed: $TESTS_PASSED
- Failed: $TESTS_FAILED

EOF

# ═══════════════════════════════════════════════════════════════════════
# 6. DATABASE SCHEMA
# ═══════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[6/7] Checking Database Schema...${NC}"

SCHEMA_FILE=$(find . -name "schema.prisma" | grep -v node_modules | head -1)
if [ -n "$SCHEMA_FILE" ]; then
    MODELS=$(grep -c "^model " "$SCHEMA_FILE" || echo "0")
    ENUMS=$(grep -c "^enum " "$SCHEMA_FILE" || echo "0")
    echo "  Models: $MODELS, Enums: $ENUMS"
else
    MODELS="N/A"
    ENUMS="N/A"
    echo "  Schema file not found"
fi

cat >> "$REPORT_FILE" << EOF
## 6. Database Schema

- Models: $MODELS (claimed: 80)
- Enums: $ENUMS (claimed: 25+)

EOF

# ═══════════════════════════════════════════════════════════════════════
# 7. DEPENDENCIES CHECK
# ═══════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[7/7] Checking Dependencies...${NC}"

OUTDATED=$(npm outdated 2>/dev/null | wc -l || echo "0")
VULNERABILITIES=$(npm audit 2>/dev/null | grep -oP '\d+(?= vulnerabilities)' | head -1 || echo "0")

echo "  Outdated: $OUTDATED packages"
echo "  Vulnerabilities: $VULNERABILITIES"

cat >> "$REPORT_FILE" << EOF
## 7. Dependencies

- Outdated packages: $OUTDATED
- Vulnerabilities: $VULNERABILITIES

EOF

# ═══════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "                           📊 SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════"

PASS_COUNT=0
FAIL_COUNT=0

# Count passes
[ "$TS_ERRORS" -eq "0" ] && PASS_COUNT=$((PASS_COUNT + 1)) || FAIL_COUNT=$((FAIL_COUNT + 1))
[ "$LINT_ERRORS" -eq "0" ] && PASS_COUNT=$((PASS_COUNT + 1)) || FAIL_COUNT=$((FAIL_COUNT + 1))
[ "$TESTS_FAILED" -eq "0" ] && PASS_COUNT=$((PASS_COUNT + 1)) || FAIL_COUNT=$((FAIL_COUNT + 1))
[ "$BUILD_STATUS" = "✅ Pass" ] && PASS_COUNT=$((PASS_COUNT + 1)) || FAIL_COUNT=$((FAIL_COUNT + 1))

echo ""
echo "  ✅ Passed: $PASS_COUNT"
echo "  ❌ Failed: $FAIL_COUNT"
echo ""

cat >> "$REPORT_FILE" << EOF
---

## Summary

| Check | Status |
|-------|--------|
| Build | $BUILD_STATUS |
| TypeScript | $TS_STATUS |
| ESLint | $([ "$LINT_ERRORS" -eq "0" ] && echo "✅ Pass" || echo "❌ $LINT_ERRORS errors") |
| Tests | $([ "$TESTS_FAILED" -eq "0" ] && echo "✅ $TESTS_PASSED passed" || echo "❌ $TESTS_FAILED failed") |

**Overall:** $PASS_COUNT passed, $FAIL_COUNT failed

---
*Generated by Master Verification Script*
EOF

echo "📄 Report saved to: $REPORT_FILE"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    exit 1
fi
