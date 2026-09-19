module.exports = {
  apps: [
    {
      name: 'laptop-index',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
