import { kv } from '@vercel/kv';
import { createClient, type RedisClientType } from 'redis';
import type { Content } from './content';

// Shared storage helpers: prefer Vercel KV if configured; otherwise fall back to REDIS_URL.
let redisClient: RedisClientType | null = null;

async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client: RedisClientType = createClient({ url });
  client.on('error', (err) => console.error('Redis error', err));
  await client.connect();
  redisClient = client as RedisClientType; // cache concrete client
  return redisClient;
}

const hasKv = Boolean(process.env.KV_REST_API_URL);

export async function readContent(): Promise<Content | null> {
  if (hasKv) {
    try {
      return (await kv.get<Content>('content:current')) || null;
    } catch (err) {
      console.error('KV readContent error', err);
    }
  }

  const client = await getRedisClient();
  if (!client) return null;
  const raw = await client.get('content:current');
  return raw ? (JSON.parse(raw) as Content) : null;
}

export async function writeContent(content: Content): Promise<void> {
  if (hasKv) {
    await kv.set('content:current', content);
    await kv.set('content:updatedAt', Date.now());
    return;
  }

  const client = await getRedisClient();
  if (!client) throw new Error('Storage not configured (KV or REDIS_URL missing)');
  await client.set('content:current', JSON.stringify(content));
  await client.set('content:updatedAt', Date.now().toString());
}

type RegistrationPayload = {
  id: string;
  createdAt: number;
  teamName: string;

  leaderName: string;
  leaderSection: string;
  leaderYear: string;
  leaderUSN: string;
  leaderAUID: string;
  leaderWhatsapp: string;
  leaderEmail: string;

  member1Name: string;
  member1Section: string;
  member1Year: string;
  member1USN: string;
  member1AUID: string;
  member1Whatsapp: string;
  member1Email: string;

  member2Name: string;
  member2Section: string;
  member2Year: string;
  member2USN: string;
  member2AUID: string;
  member2Whatsapp: string;
  member2Email: string;

  member3Name: string;
  member3Section: string;
  member3Year: string;
  member3USN: string;
  member3AUID: string;
  member3Whatsapp: string;
  member3Email: string;

  member4Name?: string;
  member4Section?: string;
  member4Year?: string;
  member4USN?: string;
  member4AUID?: string;
  member4Whatsapp?: string;
  member4Email?: string;
};

type RegistrationIndexEntry = { id: string; createdAt: number };

export async function saveRegistration(data: RegistrationPayload): Promise<void> {
  if (hasKv) {
    await kv.hset(`registration:${data.id}`, data);
    await kv.zadd('registration:index', { score: data.createdAt, member: data.id });
    return;
  }

  const client = await getRedisClient();
  if (!client) throw new Error('Storage not configured (KV or REDIS_URL missing)');

  const filtered = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== '')
  ) as Record<string, string | number>;

  await client.hSet(`registration:${data.id}`, filtered);
  await client.zAdd('registration:index', { score: data.createdAt, value: data.id });
}

export async function listRegistrations(limit = 100): Promise<RegistrationPayload[]> {
  if (hasKv) {
    const ids = await kv.zrange('registration:index', -limit, -1);
    const registrations: RegistrationPayload[] = [];
    for (const id of ids) {
      const data = await kv.hgetall<RegistrationPayload>(`registration:${id}`);
      if (data) registrations.push(data);
    }
    return registrations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  const client = await getRedisClient();
  if (!client) throw new Error('Storage not configured (KV or REDIS_URL missing)');

  const ids = await client.zRange('registration:index', 0, limit - 1, { REV: true });
  const registrations: RegistrationPayload[] = [];
  for (const id of ids) {
    const data = await client.hGetAll(`registration:${id}`);
    if (data && Object.keys(data).length) {
      registrations.push(data as unknown as RegistrationPayload);
    }
  }
  return registrations;
}

export type { RegistrationPayload, RegistrationIndexEntry };
