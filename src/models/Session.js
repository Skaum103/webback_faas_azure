// src/models/Session.js

const { getPool, sql } = require('../db');

class Session {
  static table = 'Sessions';

  /**
   * Create a new session
   * @param {{ sessionId: string, userId: string, expiresAt: Date }} params
   */
  static async create({ sessionId, userId, expiresAt }) {
    try {
      const pool = await getPool();
      const result = await pool
        .request()
        .input('sessionId', sql.UniqueIdentifier, sessionId)
        .input('userId',    sql.Int, userId)
        .input('expiresAt', sql.DateTime2,       expiresAt)
        .query(`
          INSERT INTO ${this.table} (session_id, user_id, expires_at)
          VALUES (@sessionId, @userId, @expiresAt);
        `);
      return result.rowsAffected[0] === 1;
    } catch (err) {
      console.error('[Session.create] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Fetch a session by its ID
   * @param {string} sessionId
   * @returns {{ session_id: string, user_id: string, expires_at: Date }|undefined}
   */
  static async findById(sessionId) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query(`
        SELECT session_id, user_id, expires_at
        FROM ${this.table}
        WHERE session_id = @sessionId
      `);
    return result.recordset[0];
  }

  /**
   * Delete a session by its ID
   * @param {string} sessionId
   */
  static async delete(sessionId) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query(`
        DELETE FROM ${this.table}
        WHERE session_id = @sessionId
      `);
    return result.rowsAffected[0] === 1;
  }

  /**
   * Remove all sessions that have expired
   */
  static async deleteExpired() {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`
        DELETE FROM ${this.table}
        WHERE expires_at < SYSUTCDATETIME()
      `);
    return result.rowsAffected[0];
  }
}

module.exports = Session;
