import { getPool } from '../lib/db';
import * as sql from 'mssql';


export interface Subscription {
    id: number;
    user_id:    number;
    topic:  string;
}

export class Subscription{
/** The database table name */
static table = 'Subscription';

    /**
     * Create a new subscription record.
     * @param params - Subscription Record, contains topic and user_id
     * @returns The inserted Subscription record
    */
    public static async saveSubscription(subscription: Subscription): Promise<boolean> {
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
     * Save subscriptions in batch.
     * @param user_id - id of the user
     * @param topics - List of topics to be added
     * @returns Number of rows inserted
     */
    public static async saveSubscriptions(user_id: number, topics: string[]): Promise<number> {
        try {
            const pool = await getPool();
            
            // Create a list of topic-value pairs for insertion
            const topicsParam = topics.map((topic, index) => `(@user_id, @topic${index})`).join(', ');

            // Prepare query with dynamic inputs for each topic
            const request = pool.request().input('user_id', sql.Int, user_id);

            // Add dynamic inputs for each topic in the list
            topics.forEach((topic, index) => {
                request.input(`topic${index}`, sql.NVarChar, topic);
            });

            const query = `
                INSERT INTO ${this.table} (user_id, topic)
                VALUES ${topicsParam};
            `;

            const result: sql.IResult<any> = await request.query(query);
            return result.rowsAffected[0];  // Return number of rows inserted
        } catch (err) {
            console.error('[Subscription.saveSubscriptions] SQL Error:', err.message);
            throw new Error('Failed to save subscriptions.');
        }
    }

    /**
     * Find the subscriptions of a user
     * @param user_id - GUID of the user
     * @returns Array of subscription topics or empty array if not found
     */
    public static async findSubscriptions(user_id: number): Promise<string[]> {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('user_id', sql.Int, user_id)
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
    public static async deleteSubscriptions(user_id: number, topics: string[]): Promise<number> {
        try {
            const pool = await getPool();
                
            /// Create placeholders for each topic dynamically (e.g., @topic0, @topic1)
            const topicsParam = topics.map((_, index) => `@topic${index}`).join(', ');

            // Prepare the query with the dynamically created placeholders
            let query = `
                DELETE FROM ${this.table}
                WHERE user_id = @user_id
                AND topic IN (${topicsParam});
            `;
            
            // Prepare the request and add user_id as a parameter
            const request = pool.request().input('user_id', sql.Int, user_id);

            // Add each topic as a parameter (e.g., @topic0, @topic1, etc.)
            topics.forEach((topic, index) => {
                request.input(`topic${index}`, sql.NVarChar, topic);
            });

            // Execute the query
            const result = await request.query(query);
            return result.rowsAffected[0];  // Return number of rows inserted
        } catch (err) {
            console.error('[Subscription.deleteSubscriptions] SQL Error:', err.message);
            throw new Error('Failed to delete subscriptions.');
        }
    }

}