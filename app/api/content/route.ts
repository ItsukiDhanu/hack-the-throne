import { readContent } from '@/app/lib/store';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await readContent();
  if (!data) {
    return NextResponse.json({ ok: false, message: 'No event published yet.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, content: data });
}
