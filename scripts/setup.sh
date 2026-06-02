#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ERP Ecosystem Developer Environment Setup ===${NC}\n"

# Function to print errors and exit
error_exit() {
  echo -e "${RED}✗ $1${NC}"
  exit 1
}

# Function to print success
success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print info
info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Check Node.js version
info "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  error_exit "Node.js >= 20.x is required (current: $(node -v))"
fi
success "Node.js $(node -v) detected"

# Check npm version
info "Checking npm version..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 10 ]; then
  error_exit "npm >= 10.x is required (current: $(npm -v))"
fi
success "npm $(npm -v) detected"

# Check Docker
info "Checking Docker..."
if ! command -v docker &> /dev/null; then
  error_exit "Docker is not installed. Please install Docker Desktop"
fi
success "Docker detected"

# Install dependencies
info "Installing dependencies..."
npm install --legacy-peer-deps
success "Dependencies installed"

# Start Docker services
info "Starting Docker services..."
docker compose up -d
success "Docker services started"

# Wait for services to be healthy
info "Waiting for services to be healthy (5s)..."
sleep 5
success "Services health check completed"

# Copy .env.example to .env if not exists
info "Setting up environment configuration..."
if [ ! -f .env ]; then
  cp .env.example .env
  success ".env file created from .env.example"
else
  info ".env already exists, skipping"
fi

# Generate and push database
info "Generating database schema..."
npx turbo db:generate
success "Database schema generated"

info "Pushing database..."
npx turbo db:push
success "Database schema pushed"

# Print success message and next steps
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Start development server:"
echo -e "     ${BLUE}npm run dev${NC}"
echo ""
echo "  2. Run tests:"
echo -e "     ${BLUE}npm test${NC}"
echo ""
echo "  3. Build all modules:"
echo -e "     ${BLUE}npm run build${NC}"
echo ""
echo -e "${BLUE}For more information, see README.md${NC}"
echo ""
