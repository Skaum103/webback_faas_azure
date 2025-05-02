// src/models/User.js

const { getPool, sql } = require('../db');

class User {
  static table = 'Users';

  /** fetch all users */
  static async findAll() {
    const pool   = await getPool();
    const result = await pool
      .request()
      .query(`SELECT id, username, email, password FROM ${this.table}`);
    return result.recordset;
  }

  /** fetch one user by its id (GUID or int) */
  static async findById(id) {
    const pool   = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT id, username, email, password FROM ${this.table} WHERE id = @id`);
    return result.recordset[0];
  }

  /** fetch one user by its username */
  static async findByUsername(username) {
      const pool   = await getPool();
      const result = await pool
        .request()
        .input('username', sql.VarChar(100), username)
        .query(`SELECT id, username, email, password FROM ${this.table} WHERE username = @username`);
      return result.recordset[0];
  }

  /** create a new user record */
  static async create({ username, email, password }) {
    const pool   = await getPool();
    const result = await pool
      .request()
      .input('username',  sql.VarChar(100), username)
      .input('email', sql.VarChar(200), email)
      .input('password', sql.VarChar(200), password)
      .query(`
        INSERT INTO ${this.table} (username, email, password)
        OUTPUT inserted.id, inserted.username, inserted.email, inserted.password
        VALUES (@username, @email, @password)
      `);
    return result.recordset[0];
  }

  /** update existing user by id */
  static async update(id, { username, email }) {
    const pool   = await getPool();
    const result = await pool
      .request()
      .input('id',    sql.Int, id)
      .input('username',  sql.VarChar(100),     username)
      .input('email', sql.VarChar(200),     email)
      .input('password', sql.VarChar(200), password)
      .query(`
        UPDATE ${this.table}
        SET username  = @username,
            email = @email
            password = @password
        OUTPUT inserted.id, inserted.username, inserted.email, inserted.passworrd
        WHERE id = @id
      `);
    return result.recordset[0];
  }

  /** delete a user by id */
  static async delete(id) {
    const pool   = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM ${this.table}
        WHERE id = @id
      `);
    return result.rowsAffected[0] === 1;
  }
}

module.exports = User;
