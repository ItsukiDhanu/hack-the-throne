import { readContent, writeContent } from '@/app/lib/store';
import { ContentSchema } from '@/app/lib/content';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function GET() {
  const data = await readContent();
  if (!data) {
    return NextResponse.json({ ok: false, message: 'No event published yet.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, content: data });
}

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const authHeader = request.headers.get('authorization');

  if (!adminToken) {
    return NextResponse.json({ ok: false, error: 'Admin token not configured' }, { status: 500 });
  }

  const token = authHeader?.replace(/Bearer\s+/i, '').trim();
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
