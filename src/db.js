// src/db.js
const sql = require('mssql');

let poolPromise = null;

const config = {
  server:   process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user:     process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt:            true,    // for Azure SQL
    enableArithAbort:   true
  },
  pool: {
    max:     10,
    min:     0,
    idleTimeoutMillis: 30000
  }
};

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        console.log('Connected to Azure SQL');
        return pool;
      })
      .catch(err => {
        poolPromise = null;  // reset on failure
        console.error('SQL Connection Failed:', err);
        throw err;
      });
  }
  return poolPromise;
}

module.exports = {
  sql,       // the mssql library
  getPool    // returns a Promise<ConnectionPool>
};
