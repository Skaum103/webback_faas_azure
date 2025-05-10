// src/functions/postDelete.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainerClient } from "../blobService";

export async function postDeleteTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const id = request.params.id;
  const containerClient = getContainerClient();
  const blobClient = containerClient.getBlobClient(`${id}.json`);

  try {
    await blobClient.deleteIfExists();
    return { status: 200, body: "Post deleted (if existed)" };
  } catch (err) {
    context.log(`Delete error: ${err}`);
    return { status: 500, body: "Failed to delete post" };
  }
}

app.http("postDelete", {
  route: "posts/delete/{id}",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: postDeleteTrigger,
});
