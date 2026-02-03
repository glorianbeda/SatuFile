module.exports = {
  apps: [
    {
      name: "satufile",
      script: "./satufile",
      args: "--port 8080 --root ./data",
      env: {
        NODE_ENV: "production",
        SATUFILE_JWT_SECRET: "change-me-in-production-please", // User should change this
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
