const { run } = require('./src/config/database');

async function migrate() {
  try {
    await run("ALTER TABLE inquiries ADD COLUMN admin_reply TEXT;");
    console.log("Added admin_reply");
  } catch (e) {
    if (!e.message.includes('duplicate column')) console.error(e);
  }

  try {
    await run("ALTER TABLE inquiries ADD COLUMN replied_at DATETIME;");
    console.log("Added replied_at");
  } catch (e) {
    if (!e.message.includes('duplicate column')) console.error(e);
  }
}

migrate();
