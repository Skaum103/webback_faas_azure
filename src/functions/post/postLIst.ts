// src/functions/postList.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlockBlobClient } from "@azure/storage-blob";
import { getContainerClient } from "../../lib/blobService";
import { PostRecord } from '../../models/Post';

export async function postListTrigger(_: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const containerClient = getContainerClient();
    const posts: PostRecord[] = [];
  
    for await (const blob of containerClient.listBlobsFlat()) {
      const blobClient = containerClient.getBlobClient(blob.name);
      const downloaded = await blobClient.downloadToBuffer();
      const record = JSON.parse(downloaded.toString()) as PostRecord;
      posts.push(record);
    }
  
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(posts),
    };
  }
  
  app.http("postList", {
    route: "posts",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: postListTrigger,
  });