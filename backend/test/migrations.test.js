const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const { createDatabase } = require('../src/config/database');
const { runMigrations } = require('../src/database/migrate');



function createTempDatabase() {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'real-estate-migrate-')
  );

  const dbPath = path.join(dir, 'test.db');
  const db = createDatabase(dbPath);

  return {
    dir,
    dbPath,
    db
  };
}



test('migrations are idempotent and preserve existing data', async (t) => {
  const {
    dir,
    db
  } = createTempDatabase();

  t.after(async () => {
    await db.close();

    fs.rmSync(dir, {
      recursive: true,
      force: true
    });
  });



  await runMigrations(db);

  const testEmail = `preserved_${Date.now()}@example.com`;

  const userResult = await db.run(
    `
      INSERT INTO users (
        full_name,
        email,
        password,
        role,
        status
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      'Preserved User',
      testEmail,
      'hashed-password',
      'customer',
      'active'
    ]
  );

  const originalUserId = userResult.id || userResult.lastID;

  assert.ok(
    originalUserId,
    'Expected inserted user to receive an ID'
  );



  const migrationsBefore = await db.query(
    `
      SELECT version
      FROM schema_migrations
      ORDER BY version
    `
  );

  assert.ok(
    migrationsBefore.length > 0,
    'Expected migrations to be recorded'
  );



  await runMigrations(db);



  const user = await db.get(
    `
      SELECT
        id,
        full_name,
        email,
        password,
        role,
        status
      FROM users
      WHERE email = ?
    `,
    [testEmail]
  );

  assert.ok(
    user,
    'Existing user should survive migration'
  );

  assert.equal(
    user.id,
    originalUserId,
    'Migration should preserve user ID'
  );

  assert.equal(
    user.full_name,
    'Preserved User'
  );

  assert.equal(
    user.email,
    testEmail
  );

  assert.equal(
    user.password,
    'hashed-password'
  );

  assert.equal(
    user.role,
    'customer'
  );

  assert.equal(
    user.status,
    'active'
  );



  const propertyColumns = await db.query(
    `
      SELECT column_name AS name
      FROM information_schema.columns
      WHERE table_name = 'properties'
    `
  );

  const propertyColumnNames = propertyColumns.map(
    column => column.name
  );

  assert.ok(
    propertyColumnNames.includes('id'),
    'properties table should contain id'
  );

  assert.ok(
    propertyColumnNames.includes('title'),
    'properties table should contain title'
  );

  assert.ok(
    propertyColumnNames.includes('price'),
    'properties table should contain price'
  );

  assert.ok(
    propertyColumnNames.includes('amenities'),
    'properties table should contain amenities'
  );



  const migrationsAfter = await db.query(
    `
      SELECT version
      FROM schema_migrations
      ORDER BY version
    `
  );

  assert.deepEqual(
    migrationsAfter,
    migrationsBefore,
    'Running migrations twice should not create duplicate migration records'
  );



  const migrationVersions = migrationsAfter.map(
    migration => migration.version
  );

  const uniqueVersions = new Set(
    migrationVersions
  );

  assert.equal(
    uniqueVersions.size,
    migrationVersions.length,
    'Migration versions should be unique'
  );
});


test('migrations can run repeatedly without changing migration history', async (t) => {
  const {
    dir,
    db
  } = createTempDatabase();

  t.after(async () => {
    await db.close();

    fs.rmSync(dir, {
      recursive: true,
      force: true
    });
  });

  await runMigrations(db);

  const firstRun = await db.query(
    `
      SELECT version
      FROM schema_migrations
      ORDER BY version
    `
  );

  await runMigrations(db);
  await runMigrations(db);
  await runMigrations(db);

  const finalRun = await db.query(
    `
      SELECT version
      FROM schema_migrations
      ORDER BY version
    `
  );

  assert.deepEqual(
    finalRun,
    firstRun,
    'Repeated migration runs should not modify migration history'
  );
});



test('migrations do not delete existing user rows', async (t) => {
  const {
    dir,
    db
  } = createTempDatabase();

  t.after(async () => {
    await db.close();

    fs.rmSync(dir, {
      recursive: true,
      force: true
    });
  });

  await runMigrations(db);

  const runId = Date.now();
  const users = [
    [
      'User One',
      `user1_${runId}@example.com`,
      'hash-1',
      'customer',
      'active'
    ],
    [
      'User Two',
      `user2_${runId}@example.com`,
      'hash-2',
      'customer',
      'active'
    ],
    [
      'Agent User',
      `agent_${runId}@example.com`,
      'hash-3',
      'agent',
      'active'
    ]
  ];

  for (const user of users) {
    await db.run(
      `
        INSERT INTO users (
          full_name,
          email,
          password,
          role,
          status
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      user
    );
  }

  const before = await db.get(
    `
      SELECT COUNT(*) AS total
      FROM users
    `
  );

  await runMigrations(db);

  const after = await db.get(
    `
      SELECT COUNT(*) AS total
      FROM users
    `
  );

  assert.equal(
    Number(after.total),
    Number(before.total),
    'Migration must not delete existing users'
  );
});



test('migrations create required application tables', async (t) => {
  const {
    dir,
    db
  } = createTempDatabase();

  t.after(async () => {
    await db.close();

    fs.rmSync(dir, {
      recursive: true,
      force: true
    });
  });

  await runMigrations(db);

  const tables = await db.query(
    `
      SELECT table_name AS name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `
  );

  const tableNames = new Set(
    tables.map(table => table.name)
  );

  const requiredTables = [
    'users',
    'properties',
    'property_images',
    'property_types',
    'locations',
    'favorites',
    'inquiries',
    'appointments',
    'service_requests',
    'schema_migrations'
  ];

  for (const tableName of requiredTables) {
    assert.ok(
      tableNames.has(tableName),
      `Expected table "${tableName}" to exist`
    );
  }
});