const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

const createDatabase = (config = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const connectionString = process.env.DATABASE_URL || config.connectionString;

  const poolConfig = connectionString
    ? {
        connectionString,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: config.host || process.env.DB_HOST || 'localhost',
        port: parseInt(config.port || process.env.DB_PORT || '5432', 10),
        user: config.user || process.env.DB_USER || 'postgres',
        password: config.password || process.env.DB_PASSWORD || '',
        database: config.database || process.env.DB_NAME || 'real_estate_db',
        ssl: (process.env.DB_SSL === 'true' || isProduction) ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };

  const pool = new Pool(poolConfig);

  pool.on('connect', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Connected to PostgreSQL database');
    }
  });

  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
  });

  /**
   * Helper: convert `?` placeholders to `$1, $2, ...` for pg
   */
  const convertPlaceholders = (sql) => {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
  };

  /**
   * query(sql, params) – returns all rows (like sqlite3 db.all)
   */
  const query = async (sql, params = []) => {
    const result = await pool.query(convertPlaceholders(sql), params);
    return result.rows;
  };

  /**
   * get(sql, params) – returns first row or undefined (like sqlite3 db.get)
   */
  const get = async (sql, params = []) => {
    const result = await pool.query(convertPlaceholders(sql), params);
    return result.rows[0] || undefined;
  };

  /**
   * run(sql, params) – executes INSERT/UPDATE/DELETE.
   * Returns { id, changes } to match the SQLite API used throughout the app.
   * For INSERT statements we append RETURNING id automatically if not present.
   */
  const run = async (sql, params = []) => {
    let pgSql = convertPlaceholders(sql);

    // Auto-add RETURNING id for INSERT statements that don't already have it
    const isInsert = /^\s*INSERT\s/i.test(pgSql);
    if (isInsert && !/RETURNING/i.test(pgSql)) {
      pgSql = pgSql.replace(/;?\s*$/, ' RETURNING id');
    }

    const result = await pool.query(pgSql, params);
    return {
      id: result.rows[0]?.id ?? null,
      lastID: result.rows[0]?.id ?? null,
      changes: result.rowCount,
    };
  };

  /**
   * exec(sql) – executes raw SQL (multi-statement). Used by migrations.
   */
  const exec = async (sql) => {
    await pool.query(sql);
  };

  /**
   * close() – close the pool
   */
  const close = async () => {
    await pool.end();
  };

  return { pool, query, get, run, exec, close };
};

const defaultDatabase = createDatabase();

module.exports = {
  ...defaultDatabase,
  createDatabase
};
