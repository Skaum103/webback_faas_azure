import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

/**
 * Returns a connected Redis client, initializing the connection on first call.
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (client && client.isOpen) {
    return client;
  }

  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6380;
  const password = process.env.REDIS_KEY;

  if (!host || !password) {
    throw new Error('REDIS_HOST and REDIS_KEY must be set in environment variables');
  }

  client = createClient({
    socket: {
      host,
      port,
      tls: true,
    },
    password,
  });

  client.on('error', (err) => console.error('Redis Client Error', err));

  await client.connect();
  console.log('Connected to Redis');
  return client;
}
