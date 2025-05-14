// src/models/Session.ts

import { getPool } from '../lib/db';
import * as sql from 'mssql';

export interface SubscriptionRecords {
    subscriptions: string[];
}

export interface Subscription {
    id: number;
    user_id:    number;
    topic:  string;
}

export class Subscription{
/** The database table name */
static table = 'Sessions';

    /**
     * Create a new subscription record.
     * @param params - Subscription Record, contains topic and user_id
     * @returns The inserted Subscription record
    */
    public static async create(params: {subscription: Subscription}): Promise<boolean> {
        const { subscription } = params;
        try {
            const pool = await getPool();
            const result: sql.IResult<Subscription> = await pool.request()
                .input('topic', sql.VarChar(100), subscription.topic)
                .input('user_id', sql.Int, subscription.user_id)
                .query(
                `INSERT INTO ${this.table} (topic, user_id)
                OUTPUT inserted.id, inserted.topic, inserted.user_id
                VALUES (@topic, @user_id;`
                );
            return true;
        } catch (err) {
            console.error('[Subscription.create] SQL Error:', err);
            throw err;
        }
    }


    /**
     * Find the subscriptions of a user
     * @param user_id - GUID of the user
     * @returns Array of subscription topics or empty array if not found
     */
    public static async findSubscriptions(user_id: string): Promise<string[]> {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('user_id', sql.UniqueIdentifier, user_id)
                .query(
                    `SELECT topic
                    FROM ${this.table}
                    WHERE user_id = @user_id;`
                );

            return result.recordset.map((record: any) => record.topic);
        } catch (err) {
            console.error('[Subscription.findSubscriptions] SQL Error:', err.message);
            throw new err
        }
    }

    /**
     * Delete subscriptions by userId and topics.
     * @param user_id - GUID of the user
     * @param topics - the topics to be removed
     * @returns True if one row was deleted
     */
    public static async deleteSubscriptions(user_id: string, topics: string[]): Promise<boolean> {
        try {
            const pool = await getPool();
            const result: sql.IResult<any> = await pool.request()
                .input('user_id', sql.UniqueIdentifier, user_id)
                .input('topics', sql.VarChar(100), topics.join(','))
                .query(`
                    DELETE FROM ${this.table}
                    WHERE user_id = @user_id
                    AND topic IN (@topics);
                `);

            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('[Subscription.deleteSubscriptions] SQL Error:', err.message);
            throw new Error('Failed to delete subscriptions.');
        }
    }

}