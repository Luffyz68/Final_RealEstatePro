const { run } = require('./src/config/database');

async function migrate() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS agent_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_id INTEGER NOT NULL, 
        status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Created agent_requests table");
  } catch (e) {
    console.error("Error creating agent_requests:", e);
  }

  try {
    await run("ALTER TABLE properties ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected'))");
    console.log("Added approval_status to properties");
  } catch (e) {
    if (!e.message.includes('duplicate column')) console.error(e);
  }
}

migrate();
