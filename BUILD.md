# SatuFile Build Commands

## Docker Build

### Single Platform (Local)
```bash
docker build -t satufile:latest .
```

### Multi-Platform Build (Push to Registry)
```bash
# Setup buildx (one-time)
docker buildx create --name multibuilder --use
docker buildx inspect --bootstrap

# Build for multiple platforms and push
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t vunix99/satufile:latest \
  -t vunix99/satufile:$(git describe --tags --always) \
  --push .
```

### Build for Specific Platform
```bash
# AMD64 only
docker buildx build --platform linux/amd64 -t satufile:amd64 --load .

# ARM64 only
docker buildx build --platform linux/arm64 -t satufile:arm64 --load .
```

## Go Binary Build

### Current OS
```bash
go build -o satufile .
```

### Cross-Compile
```bash
# Linux AMD64
GOOS=linux GOARCH=amd64 go build -o satufile-linux-amd64 .

# Linux ARM64
GOOS=linux GOARCH=arm64 go build -o satufile-linux-arm64 .

# Windows AMD64
GOOS=windows GOARCH=amd64 go build -o satufile-windows-amd64.exe .

# macOS AMD64
GOOS=darwin GOARCH=amd64 go build -o satufile-darwin-amd64 .

# macOS ARM64 (Apple Silicon)
GOOS=darwin GOARCH=arm64 go build -o satufile-darwin-arm64 .
```

## Frontend Build

```bash
cd frontend
npm run build
```

## Full Release Build Script

```bash
#!/bin/bash
VERSION=$(git describe --tags --always)

# Build frontend
cd frontend && npm run build && cd ..

# Build Go binaries
for os in linux darwin windows; do
  for arch in amd64 arm64; do
    ext=""
    [[ "$os" == "windows" ]] && ext=".exe"
    
    echo "Building ${os}/${arch}..."
    GOOS=$os GOARCH=$arch go build -o "dist/satufile-${os}-${arch}${ext}" .
  done
done

# Build Docker multi-platform
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t vunix99/satufile:latest \
  -t vunix99/satufile:$VERSION \
  --push .

echo "Done! Version: $VERSION"
```
