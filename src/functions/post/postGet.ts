// src/functions/postGet.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlockBlobClient } from "@azure/storage-blob";
import { getContainerClient } from "../../lib/blobService";
import { PostRecord } from '../../models/Post';

export async function postGetTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const id = request.params.id;
    const containerClient = getContainerClient();
    const blobClient = containerClient.getBlobClient(`${id}.json`);
  
    try {
      const downloaded = await blobClient.downloadToBuffer();
      const post = JSON.parse(downloaded.toString()) as PostRecord;
      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      };
    } catch (err) {
      context.log(`Blob not found: ${err}`);
      return { status: 404, body: "Post not found" };
    }
  }
  
  app.http("postGet", {
    route: "posts/id/{id}",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: postGetTrigger,
  });