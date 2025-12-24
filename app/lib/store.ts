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
  teamTag: string;
  track: 'Basic' | 'Advanced';
  advancedMembers: number;
  teamName: string;

  leaderName: string;
  leaderSection: string;
  leaderUSN: string;
  leaderWhatsapp: string;
  leaderEmail: string;
  leaderHackathons: string;

  member1Name: string;
  member1Section: string;
  member1USN: string;
  member1Whatsapp: string;
  member1Email: string;
  member1Hackathons: string;

  member2Name: string;
  member2Section: string;
  member2USN: string;
  member2Whatsapp: string;
  member2Email: string;
  member2Hackathons: string;

  member3Name: string;
  member3Section: string;
  member3USN: string;
  member3Whatsapp: string;
  member3Email: string;
  member3Hackathons: string;

  member4Name?: string;
  member4Section?: string;
  member4USN?: string;
  member4Whatsapp?: string;
  member4Email?: string;
  member4Hackathons?: string;

  member5Name?: string;
  member5Section?: string;
  member5USN?: string;
  member5Whatsapp?: string;
  member5Email?: string;
  member5Hackathons?: string;
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

export async function countRegistrations(): Promise<number> {
  if (hasKv) {
    try {
      return await kv.zcard('registration:index');
    } catch (err) {
      console.error('KV countRegistrations error', err);
      return 0;
    }
  }

  const client = await getRedisClient();
  if (!client) throw new Error('Storage not configured (KV or REDIS_URL missing)');
  return client.zCard('registration:index');
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

export async function deleteRegistration(id: string): Promise<void> {
  if (!id) return;

  if (hasKv) {
    await kv.del(`registration:${id}`);
    await kv.zrem('registration:index', id);
    return;
  }

  const client = await getRedisClient();
  if (!client) throw new Error('Storage not configured (KV or REDIS_URL missing)');

  await client.del(`registration:${id}`);
  await client.zRem('registration:index', id);
}

export async function deleteAllRegistrations(): Promise<void> {
  if (hasKv) {
    const ids = await kv.zrange('registration:index', 0, -1);
    if (ids.length) {
      const keys = ids.map((id) => `registration:${id}`);
      await kv.del(...keys);
    }
    await kv.del('registration:index');
    return;
  }

  const client = await getRedisClient();
  if (!client) throw new Error('Storage not configured (KV or REDIS_URL missing)');

  const ids = await client.zRange('registration:index', 0, -1, { REV: false });
  if (ids.length) {
    await client.del(...ids.map((id) => `registration:${id}`));
  }
  await client.del('registration:index');
}

export async function teamNameExists(name: string): Promise<boolean> {
  const target = name.trim().toLowerCase();
  if (!target) return false;

  if (hasKv) {
    const ids = await kv.zrange('registration:index', 0, -1);
    for (const id of ids) {
      const teamName = await kv.hget<string>(`registration:${id}`, 'teamName');
      if (typeof teamName === 'string' && teamName.trim().toLowerCase() === target) return true;
    }
    return false;
  }

  const client = await getRedisClient();
  if (!client) throw new Error('Storage not configured (KV or REDIS_URL missing)');

  const ids = await client.zRange('registration:index', 0, -1, { REV: false });
  for (const id of ids) {
    const teamName = await client.hGet(`registration:${id}`, 'teamName');
    if (teamName && teamName.trim().toLowerCase() === target) return true;
  }
  return false;
}

export type { RegistrationPayload, RegistrationIndexEntry };
