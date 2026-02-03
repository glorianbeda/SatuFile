#!/bin/bash
set -e

echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Building Backend..."
# Embed frontend into binary if we were using embed, but current main.go uses -r flag for root.
# Assuming we want a single binary that serves the built frontend.
go build -o satufile main.go

echo "Build Complete!"
echo "Run with: ./satufile"
echo "Or with PM2: pm2 start ecosystem.config.js"
