import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { User, UserRecord } from '../../models/User';
import { Session } from '../../models/Session';


/**
 * HTTP-triggered login function at POST /api/auth/login
 */
export async function loginTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Auth login invoked for url', request.url);

  // Parse JSON body
  let body: Partial<Pick<UserRecord, 'username' | 'password'>>;
  try {
    const parsed = await request.json();
    body = parsed as Partial<Pick<UserRecord, 'username' | 'password'>>;
  } catch (err) {
    context.log(`Invalid JSON body: ${err}`);
    return { status: 400, body: 'Invalid JSON payload' };
  }

  const { username, password } = body;
  if (!username || !password) {
    return {
      status: 400,
      body: 'Request must include { username, password }'
    };
  }

  try {
    // Verify credentials
    const user = await User.findByUsername(username);
    if (!user) {
      return { status: 401, body: 'Invalid credentials' };
    }
    if (user.password !== password) {
      return { status: 401, body: 'Invalid credentials' };
    }

    // Create a new session
    const session = await Session.create_3days({
      user_id:    user.id,
    });
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        session_id: session.session_id,
        user_id: user.id
      })
    };
  } catch (err) {
    context.log(`Invalid JSON body: ${err}`);
    return { status: 500, body: 'Internal server error' };
  }
}


app.http('login', {
  route: 'auth/login',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: loginTrigger
});
