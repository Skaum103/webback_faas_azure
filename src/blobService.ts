// src/blobService.ts
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME!;

if (!connStr || !containerName) {
  throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING or AZURE_BLOB_CONTAINER_NAME.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

export function getContainerClient(): ContainerClient {
  return blobServiceClient.getContainerClient(containerName);
}
