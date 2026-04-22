import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway Postgres requires SSL in production; trust the cert in that environment
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id               UUID        PRIMARY KEY,
      idempotency_key  TEXT        UNIQUE NOT NULL,
      amount           INTEGER     NOT NULL,
      category         TEXT        NOT NULL,
      description      TEXT,
      date             DATE        NOT NULL,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses (category);
    CREATE INDEX IF NOT EXISTS expenses_date_idx     ON expenses (date DESC);
  `);
}

export default pool;
