import { readContent, writeContent } from '@/app/lib/store';
import { Content, ContentSchema } from '@/app/lib/content';
import { defaultContent } from '@/app/lib/defaultContent';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

const legacyTrackBodies = new Set([
  'Mobility · Civic tools\nResilience · Open data',
  'Urban mobility · Civic tools\nResilience infra · Open data',
]);

function isLegacyContent(content: Content): boolean {
  const trackBody = content.details
    ?.find((d) => d.title?.toLowerCase() === 'tracks')
    ?.body?.trim();
  if (!trackBody) return false;
  return legacyTrackBodies.has(trackBody);
}

export async function GET() {
  const data = await readContent();
  if (!data) {
    return NextResponse.json({ ok: false, message: 'No event published yet.' }, { status: 404 });
  }

  if (isLegacyContent(data)) {
    try {
      await writeContent(defaultContent);
      return NextResponse.json({ ok: true, content: defaultContent, migrated: true });
    } catch (err) {
      console.error('content migration failed', err);
      return NextResponse.json({ ok: true, content: defaultContent, migrated: false });
    }
  }

  return NextResponse.json({ ok: true, content: data });
}

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const authHeader = request.headers.get('authorization');
  const xAdminHeader = request.headers.get('x-admin-token');
  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get('token');

  if (!adminToken) {
    return NextResponse.json({ ok: false, error: 'Admin token not configured' }, { status: 500 });
  }

  const token =
    authHeader?.replace(/Bearer\s+/i, '').trim() ||
    xAdminHeader?.trim() ||
    queryToken?.trim();

  if (!token || token !== adminToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = ContentSchema.parse(body);
    await writeContent(parsed);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid content payload', issues: err.issues }, { status: 400 });
    }
    console.error('writeContent error', err);
    return NextResponse.json({ ok: false, error: 'Failed to save content' }, { status: 500 });
  }
}
