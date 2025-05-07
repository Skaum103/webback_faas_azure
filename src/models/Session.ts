// src/models/Session.ts

import { getPool } from '../db';
import * as sql from 'mssql';
import { v4 as uuid } from 'uuid';

/**
 * Represents a row in the Sessions table.
 */
export interface SessionRecord {
  session_id: string;
  user_id:    number;
  expires_at: Date;
}

/**
 * Data access methods for session records.
 */
export class Session {
  /** The database table name */
  static table = 'Sessions';

  /**
   * Create a new session record.
   * @param params - session_id, user_id, and expires_at
   * @returns The inserted session record
   */
  public static async create(params: {
    user_id:    number;
    expires_at: Date;
  }): Promise<SessionRecord> {
    const { user_id, expires_at } = params;
    const session_id = uuid()
    try {
      const pool = await getPool();
      const result: sql.IResult<SessionRecord> = await pool.request()
        .input('session_id', sql.UniqueIdentifier, session_id)
        .input('user_id',    sql.Int,            user_id)
        .input('expires_at', sql.DateTime2,      expires_at)
        .query(
          `INSERT INTO ${this.table} (session_id, user_id, expires_at)
           OUTPUT inserted.session_id, inserted.user_id, inserted.expires_at
           VALUES (@session_id, @user_id, @expires_at);`
        );
      return result.recordset[0];
    } catch (err) {
      console.error('[Session.create] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Create a new session record with expire date of 3 days.
   * @param params - session_id, user_id, and expires_at
   * @returns The inserted session record
   */
  public static async create_3days(params: {
      user_id:    number;
    }): Promise<SessionRecord> {
      const expires_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const user_id = params.user_id
      const session_id = uuid()
      try {
        const pool = await getPool();
        const result: sql.IResult<SessionRecord> = await pool.request()
          .input('session_id', sql.UniqueIdentifier, session_id)
          .input('user_id',    sql.Int,            user_id)
          .input('expires_at', sql.DateTime2,      expires_at)
          .query(
            `INSERT INTO ${this.table} (session_id, user_id, expires_at)
             OUTPUT inserted.session_id, inserted.user_id, inserted.expires_at
             VALUES (@session_id, @user_id, @expires_at);`
          );
        return result.recordset[0];
      } catch (err) {
        console.error('[Session.create] SQL Error:', err);
        throw err;
      }
  }

  /**
   * Validate a session by its ID.
   * @param session_id - GUID of the session
   * @returns A boolean to indeicate the result
   */
  public static async validateSession(
    session_id: string
  ): Promise<boolean> {
    try {
      const time = Date.now()
      const pool = await getPool();
      const result: sql.IResult<SessionRecord> = await pool.request()
        .input('session_id', sql.UniqueIdentifier, session_id)
        .query(
          `SELECT session_id, user_id, expires_at
           FROM ${this.table}
           WHERE session_id = @session_id AND expires_at > time;`
        );
      return result.recordset.length === 1;
    } catch (err) {
      console.error('[Session.validateSession] SQL Error:', err);
      throw err;
    }
  }

    /**
   * Validate a session by its ID.
   * @param session_id - GUID of the session
   * @returns The session record or undefined if not found
   */
    public static async findById(
      session_id: string
    ): Promise<SessionRecord | undefined> {
      try {
        const pool = await getPool();
        const result: sql.IResult<SessionRecord> = await pool.request()
          .input('session_id', sql.UniqueIdentifier, session_id)
          .query(
            `SELECT session_id, user_id, expires_at
             FROM ${this.table}
             WHERE session_id = @session_id AND;`
          );
        return result.recordset[0];
      } catch (err) {
        console.error('[Session.findById] SQL Error:', err);
        throw err;
      }
    }

  /**
   * Delete a session by its ID.
   * @param session_id - GUID of the session
   * @returns True if one row was deleted
   */
  public static async delete(
    session_id: string
  ): Promise<boolean> {
    try {
      const pool = await getPool();
      const result: sql.IResult<unknown> = await pool.request()
        .input('session_id', sql.UniqueIdentifier, session_id)
        .query(
          `DELETE FROM ${this.table}
           WHERE session_id = @session_id;`
        );
      return result.rowsAffected[0] === 1;
    } catch (err) {
      console.error('[Session.delete] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Remove all sessions that have expired.
   * @returns Number of rows deleted
   */
  public static async deleteExpired(): Promise<number> {
    try {
      const pool = await getPool();
      const result: sql.IResult<unknown> = await pool.request()
        .query(
          `DELETE FROM ${this.table}
           WHERE expires_at < SYSUTCDATETIME();`
        );
      return result.rowsAffected[0];
    } catch (err) {
      console.error('[Session.deleteExpired] SQL Error:', err);
      throw err;
    }
  }
}
