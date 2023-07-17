module.exports = {
    apps: [{
    name: 'bot',
    script: './bot.ts',
    instances: 0,
    exec_mode: 'cluster',
    max_memory_restart: '256M',
    wait_ready: true,
    watch: true,
    listen_timeout: 50000,
    kill_timeout: 5000
    }]
  }