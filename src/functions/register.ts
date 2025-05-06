// src/functions/Register/index.ts

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { User, UserRecord } from '../models/User';

/**
 * HTTP-triggered register function at POST /api/auth/register
 */
app.http('register', {
  route: 'auth/register',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (
    request: HttpRequest,
    context: InvocationContext
  ): Promise<HttpResponseInit> => {
    context.log('Auth register invoked for url', request.url);

    // Parse JSON body
    let body: Partial<Pick<UserRecord, 'username' | 'email' | 'password'>> = {};
    try {
      const parsed = await request.json();
      body = parsed as Partial<Pick<UserRecord, 'username' | 'email' | 'password'>>;
    } catch (err: unknown) {
      context.log(`Invalid JSON body: ${err}`);
      return { status: 400, body: 'Invalid JSON payload' };
    }

    const { username, email, password } = body;
    if (!username || !email || !password) {
      return {
        status: 400,
        body: 'Request must include { username, email, password }'
      };
    }

    try {
      // Create new user
      const created = await User.create({ username, email, password });
      return {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: created.id, username: created.username, email: created.email })
      };
    } catch (err: any) {
      context.log(`SQL Error during register: ${err}`);
      if (err.number === 2627) {
        return { status: 409, body: 'A user with that email already exists.' };
      }
      return { status: 500, body: 'Internal server error' };
    }
  }
});
