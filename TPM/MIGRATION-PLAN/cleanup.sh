#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
#                    🧹 PROMO MASTER - CLEANUP SCRIPT
#                         Archive & Delete Unused Directories
# ══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_DIR="/Users/mac/TPM-TPO"
ARCHIVE_DIR="$BASE_DIR/_archive"
DATE=$(date +%Y%m%d)

echo ""
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           🧹 PROMO MASTER CLEANUP SCRIPT${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# STEP 1: Show current state
# ══════════════════════════════════════════════════════════════════════════════

echo -e "${YELLOW}📊 CURRENT STATE:${NC}"
echo ""
ls -la "$BASE_DIR" | grep promo
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# STEP 2: Confirm with user
# ══════════════════════════════════════════════════════════════════════════════

echo -e "${YELLOW}⚠️  THIS SCRIPT WILL:${NC}"
echo ""
echo -e "  ${GREEN}✓ KEEP:${NC}    promo-master      (reference code)"
echo -e "  ${GREEN}✓ KEEP:${NC}    promo-master-v2   (main development)"
echo -e "  ${BLUE}→ ARCHIVE:${NC} promo-master-lambda → _archive/promo-master-lambda-$DATE"
echo -e "  ${RED}✗ DELETE:${NC}  promo-master-web   (duplicate, will be removed)"
echo ""

read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# ══════════════════════════════════════════════════════════════════════════════
# STEP 3: Create archive directory
# ══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}Step 1: Creating archive directory...${NC}"

mkdir -p "$ARCHIVE_DIR"
echo -e "${GREEN}✓ Created: $ARCHIVE_DIR${NC}"

# ══════════════════════════════════════════════════════════════════════════════
# STEP 4: Archive promo-master-lambda
# ══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}Step 2: Archiving promo-master-lambda...${NC}"

LAMBDA_DIR="$BASE_DIR/promo-master-lambda"
LAMBDA_ARCHIVE="$ARCHIVE_DIR/promo-master-lambda-$DATE"

if [ -d "$LAMBDA_DIR" ]; then
    # Remove node_modules to save space
    if [ -d "$LAMBDA_DIR/node_modules" ]; then
        echo "  Removing node_modules..."
        rm -rf "$LAMBDA_DIR/node_modules"
    fi
    
    # Move to archive
    mv "$LAMBDA_DIR" "$LAMBDA_ARCHIVE"
    echo -e "${GREEN}✓ Archived: $LAMBDA_DIR → $LAMBDA_ARCHIVE${NC}"
    
    # Create README in archive
    cat > "$LAMBDA_ARCHIVE/ARCHIVED.md" << EOF
# 📦 ARCHIVED: promo-master-lambda

**Archived Date:** $(date)
**Reason:** Variant not needed, migrating to promo-master-v2

## Contents
- AWS Lambda backend variant
- 18 Prisma models
- 85 TypeScript files

## Restore
If needed, move back to parent directory:
\`\`\`bash
mv $LAMBDA_ARCHIVE $LAMBDA_DIR
cd $LAMBDA_DIR
npm install
\`\`\`
EOF
    
else
    echo -e "${YELLOW}⚠ Directory not found: $LAMBDA_DIR${NC}"
fi

# ══════════════════════════════════════════════════════════════════════════════
# STEP 5: Delete promo-master-web
# ══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}Step 3: Deleting promo-master-web (duplicate)...${NC}"

WEB_DIR="$BASE_DIR/promo-master-web"

if [ -d "$WEB_DIR" ]; then
    # Double confirm for deletion
    echo -e "${RED}⚠️  About to permanently delete: $WEB_DIR${NC}"
    echo -e "${RED}   This is a DUPLICATE of promo-master-v2/apps/web${NC}"
    read -p "   Type 'DELETE' to confirm: " confirm
    
    if [ "$confirm" = "DELETE" ]; then
        rm -rf "$WEB_DIR"
        echo -e "${GREEN}✓ Deleted: $WEB_DIR${NC}"
    else
        echo -e "${YELLOW}⚠ Skipped deletion of $WEB_DIR${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Directory not found: $WEB_DIR${NC}"
fi

# ══════════════════════════════════════════════════════════════════════════════
# STEP 6: Final state
# ══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✅ CLEANUP COMPLETE!${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📊 FINAL STATE:${NC}"
echo ""
echo "Main directories:"
ls -la "$BASE_DIR" | grep -E "promo-master|_archive" || true
echo ""

if [ -d "$ARCHIVE_DIR" ]; then
    echo "Archive contents:"
    ls -la "$ARCHIVE_DIR" || true
    echo ""
fi

echo -e "${GREEN}✓ promo-master${NC}     - Reference (OLD, full features)"
echo -e "${GREEN}✓ promo-master-v2${NC}  - Main development (NEW architecture)"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. cd $BASE_DIR/promo-master-v2"
echo "  2. git checkout -b feature/full-migration"
echo "  3. Start Week 1 migration tasks"
echo ""
