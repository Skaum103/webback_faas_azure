// src/models/User.ts

import { getPool } from '../lib/db';
import * as sql from 'mssql';


export interface UserPartial {
  id:        number;
  username:  string;
}

/**
 * Represents a row in the Users table.
 */
export interface UserRecord {
  id:        number;
  username:  string;
  email:     string;
  password:  string;
}

/**
 * Data access methods for user records.
 */
export class User {
  /** The database table name */
  static table = 'Users';

  /**
   * Fetch all users.
   * @returns Array of user records.
   */
  public static async findAll(): Promise<UserRecord[]> {
    try {
      const pool = await getPool();
      const result: sql.IResult<UserRecord> = await pool.request()
        .query(`SELECT id, username, email, password FROM ${this.table}`);
      return result.recordset;
    } catch (err) {
      console.error('[User.findAll] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Fetch one user by its ID.
   * @param id - User ID (INT)
   * @returns The user record or undefined if not found.
   */
  public static async findById(id: number): Promise<UserRecord | undefined> {
    try {
      const pool = await getPool();
      const result: sql.IResult<UserRecord> = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT id, username, email, password FROM ${this.table} WHERE id = @id`);
      return result.recordset[0];
    } catch (err) {
      console.error('[User.findById] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Fetch one user by its username.
   * @param username - Username (VARCHAR)
   * @returns The user record or undefined if not found.
   */
  public static async findByUsername(username: string): Promise<UserRecord | undefined> {
    try {
      const pool = await getPool();
      const result: sql.IResult<UserRecord> = await pool.request()
        .input('username', sql.VarChar(100), username)
        .query(`SELECT id, username, email, password FROM ${this.table} WHERE username = @username`);
      return result.recordset[0];
    } catch (err) {
      console.error('[User.findByUsername] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Create a new user record.
   * @param params - username, email, and password
   * @returns The inserted user record
   */
  public static async create(params: {
    username: string;
    email:    string;
    password: string;
  }): Promise<UserRecord> {
    const { username, email, password } = params;
    try {
      const pool = await getPool();
      const result: sql.IResult<UserRecord> = await pool.request()
        .input('username', sql.VarChar(100), username)
        .input('email',    sql.VarChar(200), email)
        .input('password', sql.VarChar(200), password)
        .query(
          `INSERT INTO ${this.table} (username, email, password)
           OUTPUT inserted.id, inserted.username, inserted.email, inserted.password
           VALUES (@username, @email, @password);`
        );
      return result.recordset[0];
    } catch (err) {
      console.error('[User.create] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Update an existing user by ID.
   * @param id - User ID
   * @param params - Fields to update
   * @returns The updated user record.
   */
  public static async update(
    id: number,
    params: { username?: string; email?: string; password?: string }
  ): Promise<UserRecord | undefined> {
    const updates: string[] = [];
    const request = (await getPool()).request().input('id', sql.Int, id);

    if (params.username !== undefined) {
      request.input('username', sql.VarChar(100), params.username);
      updates.push('username = @username');
    }
    if (params.email !== undefined) {
      request.input('email', sql.VarChar(200), params.email);
      updates.push('email = @email');
    }
    if (params.password !== undefined) {
      request.input('password', sql.VarChar(200), params.password);
      updates.push('password = @password');
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    try {
      const query = 
        `UPDATE ${this.table}
         SET ${updates.join(', ')}
         OUTPUT inserted.id, inserted.username, inserted.email, inserted.password
         WHERE id = @id;`;

      const result: sql.IResult<UserRecord> = await request.query(query);
      return result.recordset[0];
    } catch (err) {
      console.error('[User.update] SQL Error:', err);
      throw err;
    }
  }

  /**
   * Delete a user by ID.
   * @param id - User ID
   * @returns True if one row was deleted.
   */
  public static async delete(id: number): Promise<boolean> {
    try {
      const pool = await getPool();
      const result: sql.IResult<unknown> = await pool.request()
        .input('id', sql.Int, id)
        .query(
          `DELETE FROM ${this.table} WHERE id = @id;`
        );
      return result.rowsAffected[0] === 1;
    } catch (err) {
      console.error('[User.delete] SQL Error:', err);
      throw err;
    }
  }
}
