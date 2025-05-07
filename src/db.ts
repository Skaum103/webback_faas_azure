// src/db.ts

import { ConnectionPool, config as SqlConfig } from 'mssql';

/**
 * SQL connection pool configuration for Azure SQL Database.
 */
const config: SqlConfig = {
  server:   process.env.AZURE_SQL_SERVER!,      // e.g. "my-server.database.windows.net"
  database: process.env.AZURE_SQL_DATABASE!,    // e.g. "MyDatabase"
  user:     process.env.AZURE_SQL_USER!,        // e.g. "dbuser@my-server"
  password: process.env.AZURE_SQL_PASSWORD!,    // your password or managed identity token
  options: {
    encrypt:          true,   // required for Azure SQL
    enableArithAbort: true
  },
  pool: {
    max:               10,
    min:               0,
    idleTimeoutMillis: 30000
  }
};

// A shared promise for the connection pool, reused across function invocations
let pool: Promise<ConnectionPool> | null = null;

/**
 * Returns a singleton ConnectionPool instance.
 * Connects on first call and caches the promise.
 */
export function getPool(): Promise<ConnectionPool> {
  if (!pool) {
    pool = new ConnectionPool(config)
      .connect()
      .then(p => {
        console.log('Connected to Azure SQL');
        return p;
      })
      .catch(err => {
        // reset pool on failure so we can retry on next invocation
        pool = null;
        console.error('SQL Connection Failed:', err);
        throw err;
      });
  }
  return pool;
}
