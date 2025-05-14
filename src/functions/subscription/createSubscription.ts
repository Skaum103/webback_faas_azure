import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Subscription } from '../../models/Subscription';
import { Session } from '../../models/Session';


export async function createSubTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    // Parse JSON body
    let body: Partial<{ session_id: string, user_id: number, topics: string[] }> = {};
    try {
      const parsed = await request.json();
      body = parsed as Partial<{ session_id: string, user_id: number, topics: string[] }>;
    } catch (err: unknown) {
      context.log(`Invalid JSON body: ${err}`);
      return { status: 400, body: 'Invalid JSON payload' };
    }
  
    // Validate Session
    const session_id = body.session_id;
    const user_id = body.user_id;
    try {
        if (! await Session.validateSession(session_id, user_id)) {
            return { status: 401, body: "Failed to validate session" };
        }
    } catch (err) {
        return { status: 500, body: 'Internal server error' };
    }

    // Create subscriptions
    const topics = body.topics
    try {
        const rowsAffected = await Subscription.saveSubscriptions(user_id, topics)
        return { status: 200, body: `${rowsAffected} subscriptions saved successfully.` };
    } catch (err) {
        return { status: 500, body: 'Internal server error' };
    }
}


app.http('createSubscription', {
  route: 'subscription/create',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: createSubTrigger
});