require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./app');
const { getConfig } = require('./config/env');
const { runMigrations } = require('./database/migrate');

const start = async () => {
  const config = getConfig();
  await runMigrations();
  const host = process.env.HOST || '0.0.0.0';
  const server = app.listen(config.port, host, () => {
    console.log('===================================================');
    console.log(`🚀 Real Estate Server running on port ${config.port}`);
    console.log(`📡 Base URL: http://localhost:${config.port}`);
    console.log('===================================================');
  });
  return server;
};

if (require.main === module) {
  start().catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { start };
