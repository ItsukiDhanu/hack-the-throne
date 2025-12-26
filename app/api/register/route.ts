import { z } from 'zod';
import { NextResponse } from 'next/server';
import { countRegistrations, listRegistrations, saveRegistration, teamNameExists } from '@/app/lib/store';

const optionalize = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema.optional());

const leaderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  section: z.string().regex(/^[A-Da-d]$/, 'Section must be A, B, C, or D'),
  usn: z.string().regex(/^[A-Za-z0-9]{10}$/, 'USN must be 10 alphanumeric characters'),
  whatsapp: z.string().regex(/^\d{10}$/, 'WhatsApp must be 10 digits'),
  email: z.string().regex(/^[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.-]+$/, 'Email can only use letters, numbers, ., -, _, + and must contain @ and a domain'),
  hackathons: z.string().regex(/^\d+$/, 'Enter a number (0 if none)'),
});

const memberRequired = z.object({
  name: z.string().min(2, 'Name is required'),
  hackathons: z.string().regex(/^\d+$/, 'Enter a number (0 if none)'),
});

const memberOptional = z.object({
  name: optionalize(z.string().min(2)),
  hackathons: optionalize(z.string().regex(/^\d+$/)),
});

const schema = z.object({
  teamName: z.string().min(2, 'Team name is required'),

  leaderName: leaderSchema.shape.name,
  leaderSection: leaderSchema.shape.section,
  leaderUSN: leaderSchema.shape.usn,
  leaderWhatsapp: leaderSchema.shape.whatsapp,
  leaderEmail: leaderSchema.shape.email,
  leaderHackathons: leaderSchema.shape.hackathons,

  member1Name: memberRequired.shape.name,
  member1Hackathons: memberRequired.shape.hackathons,

  member2Name: memberRequired.shape.name,
  member2Hackathons: memberRequired.shape.hackathons,

  member3Name: memberRequired.shape.name,
  member3Hackathons: memberRequired.shape.hackathons,

  member4Name: memberOptional.shape.name,
  member4Hackathons: memberOptional.shape.hackathons,

  member5Name: memberOptional.shape.name,
  member5Hackathons: memberOptional.shape.hackathons,
});

function normalizeUsn(usn: string) {
  return usn.trim().toUpperCase();
}

export async function POST(request: Request) {
  const data = await request.json().catch(() => null);
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || 'Invalid payload';
    return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const cleanTeamName = parsed.data.teamName.trim();
  const sectionCode = parsed.data.leaderSection.trim().toUpperCase();

  const leaderUsnKey = normalizeUsn(parsed.data.leaderUSN);

  const duplicate = await teamNameExists(cleanTeamName);
  if (duplicate) {
    return NextResponse.json({ ok: false, error: 'Team name already registered' }, { status: 409 });
  }

  // Check leader USN uniqueness across all teams
  const existing = await listRegistrations(5000);
  const conflict = existing.find((reg) => normalizeUsn((reg as any).leaderUSN) === leaderUsnKey);

  if (conflict) {
    return NextResponse.json(
      { ok: false, error: `USN ${parsed.data.leaderUSN} is already registered.` },
      { status: 409 }
    );
  }

  const hackathonCounts = [
    parsed.data.leaderHackathons,
    parsed.data.member1Hackathons,
    parsed.data.member2Hackathons,
    parsed.data.member3Hackathons,
    parsed.data.member4Hackathons,
    parsed.data.member5Hackathons,
  ];

  const advancedMembers = hackathonCounts.reduce((acc, val) => {
    const n = Number.parseInt(val ?? '0', 10);
    return acc + (Number.isFinite(n) && n >= 2 ? 1 : 0);
  }, 0);

  const track = advancedMembers >= 2 ? 'Advanced' : 'Basic';
  const count = (await countRegistrations()) + 1;
  const trackCode = track === 'Advanced' ? 'A' : 'B';
  const teamTag = `HTT${sectionCode}${count}${trackCode}`;

  try {
    await saveRegistration({ id, createdAt, teamTag, track, advancedMembers, ...parsed.data, teamName: cleanTeamName });
  } catch (err) {
    console.error('saveRegistration error', err);
    return NextResponse.json({ ok: false, error: 'Storage not configured' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
