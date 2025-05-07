import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Session } from '../models/Session';


/**
 * HTTP-triggered logout function at POST /api/auth/logout
 */
export async function logoutTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Auth logout invoked for url', request.url);

  // Parse JSON body
  let body: Partial<{ session_id: string }> = {};
  try {
    const parsed = await request.json();
    body = parsed as Partial<{ session_id: string }>;
  } catch (err: unknown) {
    context.log(`Invalid JSON body: ${err}`);
    return { status: 400, body: 'Invalid JSON payload' };
  }

  const sessionId = body.session_id;
  if (!sessionId) {
    return { status: 400, body: 'Please provide a valid session_id.' };
  }

  try {
    const success = await Session.delete(sessionId);
    if (!success) {
      return { status: 404, body: 'Session not found or already expired.' };
    }
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Logout successful.' })
    };
  } catch (err: unknown) {
    context.log(`Error during logout: ${err}`);
    return { status: 500, body: 'Internal server error' };
  }
}


app.http('logout', {
  route: 'auth/logout',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: logoutTrigger
});
