import { z } from 'zod';
import { NextResponse } from 'next/server';
import { countRegistrations, listRegistrations, saveRegistration, teamNameExists } from '@/app/lib/store';

const optionalize = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema.optional());

const personRequired = z.object({
  name: z.string().min(2, 'Name is required'),
  section: z.string().regex(/^[A-Da-d]$/, 'Section must be A, B, C, or D'),
  usn: z.string().regex(/^[A-Za-z0-9]{10}$/, 'USN must be 10 alphanumeric characters'),
  whatsapp: z.string().regex(/^\d{10}$/, 'WhatsApp must be 10 digits'),
  email: z.string().regex(/^[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.-]+$/, 'Email can only use letters, numbers, ., -, _, + and must contain @ and a domain'),
  hackathons: z.string().regex(/^\d+$/, 'Enter a number (0 if none)'),
});

const personOptional = z.object({
  name: optionalize(z.string().min(2)),
  section: optionalize(z.string().regex(/^[A-Da-d]$/)),
  usn: optionalize(z.string().regex(/^[A-Za-z0-9]{10}$/)),
  whatsapp: optionalize(z.string().regex(/^\d{10}$/)),
  email: optionalize(z.string().regex(/^[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.-]+$/)),
  hackathons: optionalize(z.string().regex(/^\d+$/)),
});

const schema = z.object({
  teamName: z.string().min(2, 'Team name is required'),

  leaderName: personRequired.shape.name,
  leaderSection: personRequired.shape.section,
  leaderUSN: personRequired.shape.usn,
  leaderWhatsapp: personRequired.shape.whatsapp,
  leaderEmail: personRequired.shape.email,
  leaderHackathons: personRequired.shape.hackathons,

  member1Name: personRequired.shape.name,
  member1Section: personRequired.shape.section,
  member1USN: personRequired.shape.usn,
  member1Whatsapp: personRequired.shape.whatsapp,
  member1Email: personRequired.shape.email,
  member1Hackathons: personRequired.shape.hackathons,

  member2Name: personRequired.shape.name,
  member2Section: personRequired.shape.section,
  member2USN: personRequired.shape.usn,
  member2Whatsapp: personRequired.shape.whatsapp,
  member2Email: personRequired.shape.email,
  member2Hackathons: personRequired.shape.hackathons,

  member3Name: personRequired.shape.name,
  member3Section: personRequired.shape.section,
  member3USN: personRequired.shape.usn,
  member3Whatsapp: personRequired.shape.whatsapp,
  member3Email: personRequired.shape.email,
  member3Hackathons: personRequired.shape.hackathons,

  member4Name: personOptional.shape.name,
  member4Section: personOptional.shape.section,
  member4USN: personOptional.shape.usn,
  member4Whatsapp: personOptional.shape.whatsapp,
  member4Email: personOptional.shape.email,
  member4Hackathons: personOptional.shape.hackathons,

  member5Name: personOptional.shape.name,
  member5Section: personOptional.shape.section,
  member5USN: personOptional.shape.usn,
  member5Whatsapp: personOptional.shape.whatsapp,
  member5Email: personOptional.shape.email,
  member5Hackathons: personOptional.shape.hackathons,
});

type MemberEntry = { usn: string; name: string };

function normalizeUsn(usn: string) {
  return usn.trim().toUpperCase();
}

function collectMembers(data: any): MemberEntry[] {
  return [
    { usn: data.leaderUSN, name: data.leaderName },
    { usn: data.member1USN, name: data.member1Name },
    { usn: data.member2USN, name: data.member2Name },
    { usn: data.member3USN, name: data.member3Name },
    data.member4USN ? { usn: data.member4USN, name: data.member4Name } : null,
    data.member5USN ? { usn: data.member5USN, name: data.member5Name } : null,
  ].filter(Boolean) as MemberEntry[];
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

  const duplicate = await teamNameExists(cleanTeamName);
  if (duplicate) {
    return NextResponse.json({ ok: false, error: 'Team name already registered' }, { status: 409 });
  }

  // Check USN uniqueness within the submitted team
  const members = collectMembers(parsed.data);
  const seenUsn = new Set<string>();
  for (const m of members) {
    const key = normalizeUsn(m.usn);
    if (seenUsn.has(key)) {
      return NextResponse.json(
        { ok: false, error: `USN ${m.usn} is already used in this team.` },
        { status: 400 }
      );
    }
    seenUsn.add(key);
  }

  // Check USN uniqueness across all teams
  const existing = await listRegistrations(5000);
  const conflict = existing
    .flatMap((reg) => collectMembers(reg))
    .find((m) => seenUsn.has(normalizeUsn(m.usn)));

  if (conflict) {
    return NextResponse.json(
      { ok: false, error: `USN ${conflict.usn} is already registered.` },
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
