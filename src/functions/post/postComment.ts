// src/functions/postComment.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlockBlobClient } from "@azure/storage-blob";
import { getContainerClient } from "../../lib/blobService";
import { PostRecord, Comment  } from '../../models/Post';

export async function postCommentTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const id = request.params.id;
    const containerClient = getContainerClient();
    const blobClient = containerClient.getBlockBlobClient(`${id}.json`);
  
    let post: PostRecord;
  
    try {
      const downloaded = await blobClient.downloadToBuffer();
      post = JSON.parse(downloaded.toString()) as PostRecord;
    } catch (err) {
      context.log(`Blob not found: ${err}`);
      return { status: 404, body: "Post not found" };
    }
  
    let newComment: Partial<Comment>;
    try {
      newComment = await request.json();
    } catch {
      return { status: 400, body: "Invalid comment JSON" };
    }
  
    if (!newComment.user || !newComment.content) {
      return { status: 400, body: "Comment must include { user, content }" };
    }
  
    const comment: Comment = {
      user: newComment.user,
      content: newComment.content,
      time: new Date().toISOString(),
    };
  
    post.comments.push(comment);
  
    const updatedBlob = Buffer.from(JSON.stringify(post, null, 2));
    await blobClient.uploadData(updatedBlob);
  
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    };
  }
  
  app.http("postComment", {
    route: "posts/comment/{id}",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: postCommentTrigger,
  });