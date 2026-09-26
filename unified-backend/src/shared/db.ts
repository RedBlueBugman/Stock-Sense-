import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'stocksense',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'stocksense2026',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => console.error('[DB] Idle client error:', err));

export const query = async <T extends QueryResultRow = any>(
  text: string, params?: any[]
): Promise<QueryResult<T>> => pool.query<T>(text, params);

export const getClient = () => pool.connect();
export default pool;
