import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';


/**
 * A simple HTTP-triggered function that greets the caller by name.
 */
export async function helloTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  // Try query string first, then request body, fallback to 'world'
  const queryName = request.query.get('name');
  const bodyText  = await request.text();
  const name      = queryName ?? (bodyText?.trim() ? bodyText : 'world');

  return {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: `Hello, ${name}!`
  };
}


app.http('Hello', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: helloTrigger
});
