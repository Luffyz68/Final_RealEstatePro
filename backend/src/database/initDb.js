
const { runMigrations } = require('./migrate');

runMigrations()
  .then(() => {
    console.log('Database migrations completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database migration failed:', error.message);
    process.exit(1);
  });
