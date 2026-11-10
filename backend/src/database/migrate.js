require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env')
});

const defaultDatabase = require('../config/database');

/* =========================================================
   BASE SCHEMA  (PostgreSQL)
   Used for brand-new databases.
========================================================= */

const baseSchema = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,

  role TEXT NOT NULL
    CHECK(role IN ('admin', 'agent', 'customer'))
    DEFAULT 'customer',

  profile_image TEXT,

  status TEXT NOT NULL
    CHECK(status IN ('active', 'inactive'))
    DEFAULT 'active',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,

  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  commune TEXT,
  address TEXT,

  latitude REAL,
  longitude REAL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,

  title TEXT NOT NULL,
  description TEXT,

  price REAL NOT NULL
    CHECK(price > 0),

  property_type_id INTEGER NOT NULL,

  listing_type TEXT NOT NULL
    CHECK(listing_type IN ('sale', 'rent')),

  status TEXT NOT NULL
    CHECK(
      status IN (
        'available',
        'pending',
        'sold',
        'rented',
        'hidden'
      )
    )
    DEFAULT 'available',

  approval_status TEXT NOT NULL
    CHECK(
      approval_status IN (
        'pending',
        'approved',
        'rejected'
      )
    )
    DEFAULT 'pending',

  bedrooms INTEGER NOT NULL
    DEFAULT 0
    CHECK(bedrooms >= 0),

  bathrooms REAL NOT NULL
    DEFAULT 0
    CHECK(bathrooms >= 0),

  area REAL NOT NULL
    CHECK(area > 0),

  area_unit TEXT NOT NULL
    DEFAULT 'sqm',

  location_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,

  main_image TEXT,
  amenities TEXT,

  featured INTEGER NOT NULL
    DEFAULT 0
    CHECK(featured IN (0, 1)),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(property_type_id)
    REFERENCES property_types(id)
    ON DELETE RESTRICT,

  FOREIGN KEY(location_id)
    REFERENCES locations(id)
    ON DELETE RESTRICT,

  FOREIGN KEY(agent_id)
    REFERENCES users(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS agent_requests (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL,

  status TEXT NOT NULL
    CHECK(
      status IN (
        'pending',
        'approved',
        'rejected'
      )
    )
    DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS property_images (
  id SERIAL PRIMARY KEY,

  property_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, property_id),

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY(property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,

  user_id INTEGER,
  property_id INTEGER NOT NULL,

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,

  admin_reply TEXT,
  replied_at TIMESTAMP,

  status TEXT NOT NULL
    CHECK(
      status IN (
        'pending',
        'contacted',
        'resolved',
        'closed'
      )
    )
    DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE SET NULL,

  FOREIGN KEY(property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,

  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,

  message TEXT,

  status TEXT NOT NULL
    CHECK(
      status IN (
        'pending',
        'approved',
        'rejected',
        'completed',
        'cancelled'
      )
    )
    DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY(property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE,

  FOREIGN KEY(agent_id)
    REFERENCES users(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS service_requests (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL,
  property_id INTEGER,

  service_type TEXT NOT NULL
    CHECK(
      service_type IN (
        'property_inspection',
        'property_maintenance',
        'cleaning',
        'valuation',
        'legal_consultation',
        'other'
      )
    ),

  description TEXT NOT NULL,
  preferred_date TEXT,

  status TEXT NOT NULL
    CHECK(
      status IN (
        'pending',
        'in_progress',
        'completed',
        'cancelled'
      )
    )
    DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY(property_id)
    REFERENCES properties(id)
    ON DELETE SET NULL
);
`;


/* =========================================================
   HELPER UTILITIES  (PostgreSQL versions)
========================================================= */

const tableExists = async (database, table) => {
  const result = await database.get(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = $1`,
    [table]
  );
  return Boolean(result);
};

const columnExists = async (database, table, column) => {
  if (!(await tableExists(database, table))) {
    return false;
  }

  const result = await database.get(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2`,
    [table, column]
  );

  return Boolean(result);
};

const ensureColumn = async (database, table, column, definition) => {
  const exists = await columnExists(database, table, column);
  if (exists) {
    return false;
  }

  await database.exec(
    `ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`
  );

  return true;
};


/* =========================================================
   MIGRATIONS
========================================================= */

const migrations = [

  {
    version: 1,
    name: 'create-base-schema',

    run: async database => {
      await database.exec(baseSchema);
    }
  },

  {
    version: 2,
    name: 'add-property-fields',

    run: async database => {
      await ensureColumn(
        database,
        'properties',
        'amenities',
        'TEXT'
      );

      await ensureColumn(
        database,
        'properties',
        'featured',
        'INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0, 1))'
      );
    }
  },

  {
    version: 3,
    name: 'add-core-indexes',

    run: async database => {
      await database.exec(`
        CREATE INDEX IF NOT EXISTS idx_properties_type
          ON properties(property_type_id);

        CREATE INDEX IF NOT EXISTS idx_properties_location
          ON properties(location_id);

        CREATE INDEX IF NOT EXISTS idx_properties_agent
          ON properties(agent_id);

        CREATE INDEX IF NOT EXISTS idx_properties_status
          ON properties(status);

        CREATE INDEX IF NOT EXISTS idx_properties_listing
          ON properties(listing_type);

        CREATE INDEX IF NOT EXISTS idx_properties_approval
          ON properties(approval_status);

        CREATE INDEX IF NOT EXISTS idx_inquiries_property
          ON inquiries(property_id);

        CREATE INDEX IF NOT EXISTS idx_inquiries_user
          ON inquiries(user_id);

        CREATE INDEX IF NOT EXISTS idx_inquiries_status
          ON inquiries(status);

        CREATE INDEX IF NOT EXISTS idx_appointments_user
          ON appointments(user_id);

        CREATE INDEX IF NOT EXISTS idx_appointments_agent
          ON appointments(agent_id);

        CREATE INDEX IF NOT EXISTS idx_appointments_property
          ON appointments(property_id);

        CREATE INDEX IF NOT EXISTS idx_appointments_status
          ON appointments(status);

        CREATE INDEX IF NOT EXISTS idx_service_requests_user
          ON service_requests(user_id);

        CREATE INDEX IF NOT EXISTS idx_service_requests_property
          ON service_requests(property_id);

        CREATE INDEX IF NOT EXISTS idx_service_requests_status
          ON service_requests(status);

        CREATE INDEX IF NOT EXISTS idx_property_images_property
          ON property_images(property_id);

        CREATE INDEX IF NOT EXISTS idx_favorites_user
          ON favorites(user_id);

        CREATE INDEX IF NOT EXISTS idx_favorites_property
          ON favorites(property_id);
      `);
    }
  },

  {
    version: 4,
    name: 'upgrade-legacy-property-schema',

    run: async database => {
      await ensureColumn(
        database,
        'properties',
        'approval_status',
        `TEXT NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected'))`
      );

      await ensureColumn(
        database,
        'properties',
        'area_unit',
        "TEXT NOT NULL DEFAULT 'sqm'"
      );

      await ensureColumn(
        database,
        'properties',
        'main_image',
        'TEXT'
      );

      await ensureColumn(
        database,
        'properties',
        'amenities',
        'TEXT'
      );

      await ensureColumn(
        database,
        'properties',
        'featured',
        'INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0, 1))'
      );
    }
  },

  {
    version: 5,
    name: 'upgrade-inquiry-schema',

    run: async database => {
      await ensureColumn(
        database,
        'inquiries',
        'admin_reply',
        'TEXT'
      );

      await ensureColumn(
        database,
        'inquiries',
        'replied_at',
        'TIMESTAMP'
      );
    }
  },

  {
    version: 6,
    name: 'create-agent-requests',

    run: async database => {
      await database.exec(`
        CREATE TABLE IF NOT EXISTS agent_requests (
          id SERIAL PRIMARY KEY,

          user_id INTEGER NOT NULL,

          status TEXT NOT NULL
            CHECK(
              status IN (
                'pending',
                'approved',
                'rejected'
              )
            )
            DEFAULT 'pending',

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_agent_requests_user
          ON agent_requests(user_id);

        CREATE INDEX IF NOT EXISTS idx_agent_requests_status
          ON agent_requests(status);
      `);
    }
  },

  {
    version: 7,
    name: 'add-search-and-dashboard-indexes',

    run: async database => {
      await database.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_role
          ON users(role);

        CREATE INDEX IF NOT EXISTS idx_users_status
          ON users(status);

        CREATE INDEX IF NOT EXISTS idx_properties_featured
          ON properties(featured);

        CREATE INDEX IF NOT EXISTS idx_properties_created
          ON properties(created_at);

        CREATE INDEX IF NOT EXISTS idx_appointments_date
          ON appointments(appointment_date);

        CREATE INDEX IF NOT EXISTS idx_service_requests_created
          ON service_requests(created_at);
      `);
    }
  },

  /* ── Migration 8: Add bio column to users ── */
  {
    version: 8,
    name: 'add-user-bio-column',

    run: async database => {
      await ensureColumn(database, 'users', 'bio', 'TEXT');
    }
  }
];


/* =========================================================
   MIGRATION RUNNER  (PostgreSQL)
========================================================= */

const ensureMigrationTable = async database => {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT,
      applied_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await ensureColumn(
    database,
    'schema_migrations',
    'name',
    'TEXT'
  );
};


const runMigration = async (database, migration) => {
  await database.exec('BEGIN');

  try {
    await migration.run(database);

    await database.exec(
      `INSERT INTO schema_migrations (version, name)
       VALUES (${migration.version}, '${migration.name}')`
    );

    await database.exec('COMMIT');
  } catch (error) {
    try {
      await database.exec('ROLLBACK');
    } catch {
      // ignore rollback errors
    }

    error.message =
      `Migration ${migration.version} (${migration.name}) failed: ${error.message}`;

    throw error;
  }
};


const runMigrations = async (database = defaultDatabase) => {

  await ensureMigrationTable(database);

  const appliedRows = await database.query(
    'SELECT version FROM schema_migrations ORDER BY version'
  );

  const applied = new Set(
    appliedRows.map(row => Number(row.version))
  );

  const orderedMigrations = [...migrations].sort(
    (a, b) => a.version - b.version
  );

  for (const migration of orderedMigrations) {
    if (applied.has(migration.version)) {
      continue;
    }

    await runMigration(database, migration);
    applied.add(migration.version);
  }
};


const runFromCli = async () => {
  try {
    await runMigrations();
    console.log('Database migrations completed safely.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await defaultDatabase.close();
    } catch (error) {
      console.error('Failed to close database:', error.message);
      process.exitCode = 1;
    }
  }
};

if (require.main === module) {
  runFromCli();
}

module.exports = {
  runMigrations
};
