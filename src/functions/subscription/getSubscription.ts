import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Subscription } from '../../models/Subscription';
import { Session } from '../../models/Session';


export async function getSubTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    // Parse JSON body
    let body: Partial<{ session_id: string, user_id: number }> = {};
    try {
      const parsed = await request.json();
      body = parsed as Partial<{ session_id: string, user_id: number }>;
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

    // get subscriptions
    try {
        const foundedTopics = await Subscription.findSubscriptions(user_id)
        return { status: 200, body: JSON.stringify({topics: foundedTopics}) };
    } catch (err) {
        return { status: 500, body: 'Internal server error' };
    }
}


app.http('getSubscription', {
  route: 'subscription/get',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: getSubTrigger
});