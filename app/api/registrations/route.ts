import { NextResponse } from 'next/server';
import { listRegistrations, deleteRegistration } from '@/app/lib/store';

export async function GET(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const authHeader = request.headers.get('authorization');
  const xAdminHeader = request.headers.get('x-admin-token');
  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get('token');

  if (adminToken) {
    const token =
      authHeader?.replace(/Bearer\s+/i, '').trim() ||
      xAdminHeader?.trim() ||
      queryToken?.trim();

    if (!token || token !== adminToken) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const limitParam = searchParams.get('limit');
  const limit = Math.max(1, Math.min(500, Number(limitParam) || 100));

  try {
    const registrations = await listRegistrations(limit);
    return NextResponse.json({ ok: true, registrations });
  } catch (err) {
    console.error('listRegistrations error', err);
    return NextResponse.json({ ok: false, error: 'Failed to load registrations' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const authHeader = request.headers.get('authorization');
  const xAdminHeader = request.headers.get('x-admin-token');
  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get('token');
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
  }

  if (adminToken) {
    const token =
      authHeader?.replace(/Bearer\s+/i, '').trim() ||
      xAdminHeader?.trim() ||
      queryToken?.trim();

    if (!token || token !== adminToken) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    await deleteRegistration(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('deleteRegistration error', err);
    return NextResponse.json({ ok: false, error: 'Failed to delete registration' }, { status: 500 });
  }
}
