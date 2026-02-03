#!/bin/bash

# Exit on error
set -e

# Set colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment process...${NC}"

# 0. Update Source Code
echo -e "${BLUE}Step 0: Updating source code from Git...${NC}"
if [ -d ".git" ]; then
    echo "Fetching latest changes..."
    git fetch
    echo "Pulling latest changes..."
    git pull
    echo -e "${GREEN}Source code updated.${NC}"
else
    echo -e "${YELLOW}Warning: Not a git repository, skipping update.${NC}"
fi

# 1. Build Frontend
echo -e "${BLUE}Step 1: Building Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run build
cd ..
echo -e "${GREEN}Frontend build complete.${NC}"

# 2. Build Go Backend
echo -e "${BLUE}Step 2: Building Go Backend...${NC}"
go build -o satufile .
echo -e "${GREEN}Backend build complete.${NC}"

echo -e "${GREEN}Deployment build successful! You can now run './satufile' to start the server.${NC}"