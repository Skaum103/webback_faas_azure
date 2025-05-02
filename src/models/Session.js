// src/models/Session.js

const { getPool, sql } = require('../db');

class Session {
  static table = 'Sessions';

  /**
   * Create a new session
   * @param {{ session_id: string, user_id: string, expires_at: Date }} params
   */
  static async create({ session_id, user_id, expires_at }) {
    try {
      const pool = await getPool();
      const result = await pool
        .request()
        .input('session_id', sql.UniqueIdentifier, session_id)
        .input('user_id',    sql.Int, user_id)
        .input('expires_at', sql.DateTime2,       expires_at)
        .query(`
          INSERT INTO ${this.table} (session_id, user_id, expires_at)
          OUTPUT inserted.session_id, inserted.user_id, inserted.expires_at
          VALUES (@session_id, @user_id, @expires_at);
        `);
      return result.recordset[0];
    } catch (err) {
      console.error('[Session.create] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Fetch a session by its ID
   * @param {string} session_id
   * @returns {{ session_id: string, user_id: string, expires_at: Date }|undefined}
   */
  static async findById(session_id) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('session_id', sql.UniqueIdentifier, session_id)
      .query(`
        SELECT session_id, user_id, expires_at
        FROM ${this.table}
        WHERE session_id = @session_id
      `);
    return result.recordset[0];
  }

  /**
   * Delete a session by its ID
   * @param {string} session_id
   */
  static async delete(session_id) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('session_id', sql.UniqueIdentifier, session_id)
      .query(`
        DELETE FROM ${this.table}
        WHERE session_id = @session_id
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
