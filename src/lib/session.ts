import { v4 as uuid } from 'uuid';
import { Session, SessionRecord } from '../models/Session';

/**
 * Validates whether a session exists and is not expired.
 * @param sessionId - The GUID of the session to validate.
 * @returns True if the session is valid, false otherwise.
 */
export async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const session = await Session.findById(sessionId);
    if (!session) return false;
    return new Date(session.expires_at) > new Date();
  } catch (err) {
    console.error('[validateSession] Error:', err);
    return false;
  }
}

/**
 * Creates a new session for a user with a 3-day expiration.
 * @param userId - The numeric ID of the user.
 * @returns The created session record.
 * @throws Propagates any SQL errors.
 */
export async function createSession(userId: number): Promise<SessionRecord> {
  const sessionId = uuid();
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const session = await Session.create({
    session_id: sessionId,
    user_id:    userId,
    expires_at: expiresAt
  });
  return session;
}

/**
 * Deletes a session by its ID.
 * @param sessionId - The GUID of the session to delete.
 * @returns True if the session was deleted, false otherwise.
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    return await Session.delete(sessionId);
  } catch (err) {
    console.error('[deleteSession] Error:', err);
    return false;
  }
}