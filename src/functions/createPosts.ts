import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainerClient } from '../blobService';
import { PostRecord } from '../models/Post';
import { v4 as uuidv4 } from 'uuid';

export async function createPostTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Post creation invoked for URL', request.url);

  let body: Partial<PostRecord> = {};
  try {
    const parsed = await request.json();
    body = parsed;
  } catch (err: unknown) {
    context.log(`Invalid JSON body: ${err}`);
    return { status: 400, body: 'Invalid JSON payload' };
  }

  const { title, author, content, comments } = body;

  // Validate required fields
  if (
    typeof title !== 'string' ||
    typeof author !== 'string' ||
    typeof content !== 'string' ||
    !Array.isArray(comments)
  ) {
    return {
      status: 400,
      body: 'Request must include { title (string), author (string), content (string), comments[] (array) }'
    };
  }

  try {
    // Generate new ID
    const id = uuidv4();
    const post: PostRecord = { id, title, author, content, comments };

    const containerClient = getContainerClient();
    const blobClient = containerClient.getBlockBlobClient(`${id}.json`);
    const serialized = JSON.stringify(post, null, 2);

    await blobClient.upload(serialized, Buffer.byteLength(serialized));

    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Post created with ID ${id}.`, id })
    };
  } catch (err: any) {
    context.log(`Blob upload error: ${err.message}`);
    return {
      status: 500,
      body: 'Internal server error while creating the post.'
    };
  }
}

app.http('createPost', {
  route: 'posts/create',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: createPostTrigger
});
