// src/checkBlobConnection.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainerClient } from "../../lib/blobService";

export async function checkBlobConnection(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const container = getContainerClient();

    // Try to list blobs — this verifies connectivity and permission
    const iter = container.listBlobsFlat();
    const first = await iter.next(); // just check first item

    return {
      status: 200,
      body: `✅ Successfully connected to container "${container.containerName}". Found blob: ${first.value?.name ?? 'none'}`,
    };
  } catch (err: any) {
    context.error("❌ Blob storage connection failed:", err.message);
    return {
      status: 500,
      body: `❌ Failed to connect to Blob Storage: ${err.message}`,
    };
  }
}

app.http("CheckBlobConnection", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: checkBlobConnection,
});
