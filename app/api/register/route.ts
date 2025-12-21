import { z } from 'zod';
import { NextResponse } from 'next/server';
import { saveRegistration } from '@/app/lib/store';

const personRequired = z.object({
  name: z.string().min(2, 'Name is required'),
  section: z.string().min(1, 'Section is required'),
  year: z.string().min(1, 'Year is required'),
  usn: z.string().min(3, 'USN is required'),
  auid: z.string().min(3, 'AUID is required'),
  whatsapp: z.string().min(6, 'WhatsApp number is required'),
  email: z.string().email('Valid email required'),
});

const personOptional = z.object({
  name: z.string().min(2).optional(),
  section: z.string().min(1).optional(),
  year: z.string().min(1).optional(),
  usn: z.string().min(3).optional(),
  auid: z.string().min(3).optional(),
  whatsapp: z.string().min(6).optional(),
  email: z.string().email().optional(),
});

const schema = z.object({
  teamName: z.string().min(2, 'Team name is required'),

  leaderName: personRequired.shape.name,
  leaderSection: personRequired.shape.section,
  leaderYear: personRequired.shape.year,
  leaderUSN: personRequired.shape.usn,
  leaderAUID: personRequired.shape.auid,
  leaderWhatsapp: personRequired.shape.whatsapp,
  leaderEmail: personRequired.shape.email,

  member1Name: personRequired.shape.name,
  member1Section: personRequired.shape.section,
  member1Year: personRequired.shape.year,
  member1USN: personRequired.shape.usn,
  member1AUID: personRequired.shape.auid,
  member1Whatsapp: personRequired.shape.whatsapp,
  member1Email: personRequired.shape.email,

  member2Name: personRequired.shape.name,
  member2Section: personRequired.shape.section,
  member2Year: personRequired.shape.year,
  member2USN: personRequired.shape.usn,
  member2AUID: personRequired.shape.auid,
  member2Whatsapp: personRequired.shape.whatsapp,
  member2Email: personRequired.shape.email,

  member3Name: personRequired.shape.name,
  member3Section: personRequired.shape.section,
  member3Year: personRequired.shape.year,
  member3USN: personRequired.shape.usn,
  member3AUID: personRequired.shape.auid,
  member3Whatsapp: personRequired.shape.whatsapp,
  member3Email: personRequired.shape.email,

  member4Name: personOptional.shape.name,
  member4Section: personOptional.shape.section,
  member4Year: personOptional.shape.year,
  member4USN: personOptional.shape.usn,
  member4AUID: personOptional.shape.auid,
  member4Whatsapp: personOptional.shape.whatsapp,
  member4Email: personOptional.shape.email,
});

export async function POST(request: Request) {
  const data = await request.json().catch(() => null);
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || 'Invalid payload';
    return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = Date.now();

  try {
    await saveRegistration({ id, createdAt, ...parsed.data });
  } catch (err) {
    console.error('saveRegistration error', err);
    return NextResponse.json({ ok: false, error: 'Storage not configured' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
