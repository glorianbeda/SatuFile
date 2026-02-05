# Tasks: Cleanup Project and PM2 Native Deployment

## 1. PM2 Configuration

- [x] 1.1 Create ecosystem.config.js with backend configuration
- [x] 1.2 Configure environment variables in ecosystem.config.js
- [x] 1.3 Set up PM2 instance count and memory limits
- [x] 1.4 Configure logging settings in ecosystem.config.js

## 2. Project Cleanup

- [x] 2.1 Identify all unused deployment files (deploy.sh, Docker files)
- [x] 2.2 Remove deploy.sh from project root
- [x] 2.3 Remove Dockerfile if present
- [x] 2.4 Remove docker-compose.yml if present
- [x] 2.5 Remove .dockerignore if present
- [x] 2.6 Remove docker/ directory if present
- [x] 2.7 Update package.json to remove Docker/deploy.sh scripts (not present)

## 3. Documentation

- [x] 3.1 Update README.md with PM2 installation instructions
- [x] 3.2 Add PM2 ecosystem configuration documentation
- [x] 3.3 Document common PM2 commands (start, stop, restart, logs, monit)
- [x] 3.4 Document server startup script setup
- [x] 3.5 Verify README is complete and accurate

## 4. Testing

- [x] 4.1 Build Go binary to verify it compiles
- [ ] 4.2 Start application with PM2 and verify it runs
- [ ] 4.3 Verify health endpoint responds
- [ ] 4.4 Test PM2 restart behavior
- [ ] 4.5 Verify logs are accessible via pm2 logs
- [x] 4.6 Test cleanup - verify removed files are gone
