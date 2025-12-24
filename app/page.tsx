"use client";

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState, type ComponentProps } from 'react';
import { clsx } from 'clsx';
import HttWhiteLogo from '../HTT White Logo (1).png';
import type { Content } from './lib/content';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const demoContent: Content = {
  hero: {
    title: 'Hack The Throne',
    tagline: 'Explore the Web',
    badges: ['AIT CSE campus', 'On-campus', '2ⁿᵈ Year CSE only', 'Mentors on-call'],
  },
  details: [
    { title: 'Venue', body: 'AIT CSE Campus' },
    { title: 'Eligibility', body: '2ⁿᵈ Year CSE students only' },
    { title: 'Tracks', body: 'Mobility · Civic tools\nResilience · Open data' },
    { title: 'Team rules', body: 'Teams of 4–6\nFresh work only' },

  ],
  schedule: [],
  team: [
    { name: 'Ayush Kaushik', role: 'Lead Organizer' },
    { name: 'Ethan Dsouza', role: 'Tech Lead (Co-Organizer)' },
    { name: 'Ayush Mallick', role: 'Logistics & Marketing Lead' },
    { name: 'Dhanush V P', role: 'Tech & Organizing Coordinator' },
    { name: 'Abhay Emmanuel', role: 'Tech & Organizing Coordinator' },
  ],
  faqs: [
    { q: "What's a hackathon?", a: 'A fast-paced event where teams build and demo solutions in a short time (often 24–48 hours).' },
    { q: 'What do we do there?', a: 'Form teams, pick a problem, design, code, ship a demo, and present to judges.' },
    { q: 'Types of hackathons?', a: 'Thematic (health, civic), open innovation, AI/ML, hardware, and product design sprints.' },
    { q: 'Prerequisite skills?', a: 'Basics help: coding or no-code, Git, slides/storytelling, and collaboration. Mixed skills win.' },
    { q: 'Use of AI?', a: 'AI accelerates ideation, coding, testing, and content; cite sources and keep outputs transparent.' },
    { q: 'Phases of a hackathon?', a: 'Ideation → build → push to Git/GitHub → polish demo → present with a clear deck.' },
    { q: 'How to achieve good projects?', a: 'Scope tightly, pick one painful user problem, ship a working core, and demo clearly.' },
    { q: 'How to win?', a: 'Solve a real pain, show working product, clear story, impact, and next steps. Rehearse your demo.' },
    { q: "Is it just coding?", a: 'No. Product thinking, design, storytelling, and teamwork matter as much as code.' },
    { q: 'Benefits of participating?', a: 'Portfolio-worthy builds, networking, prizes, recruiter visibility, and learning under pressure.' },
  ],
  stats: [
    { title: 'Eligibility', value: '2ⁿᵈ Year CSE', caption: 'AIT Department of CSE' },
    { title: 'Mode', value: 'On-campus', caption: 'AIT CSE Campus' },
    { title: 'Support', value: 'Mentors', caption: 'Product · AI/ML · DevOps' },
  ],
  registerNote: 'Open only to 2ⁿᵈ Year CSE students. Confirm your details to request a slot.',
};

const navLinks = [
  { href: 'events', label: 'Events' },
  { href: 'about', label: 'Highlights' },
  { href: 'team', label: 'Team' },
  { href: 'faq', label: 'FAQ' },
  { href: 'register', label: 'Register' },
];

const explainerPoints = [
  'Sprint with a team to solve a focused problem, then demo live.',
  'Learn fast from mentors across product, AI/ML, DevOps, and design.',
  'Ship a working build, share the story, and get feedback on the spot.',
  'Network with peers who want to build, not just talk.',
];

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
    alt: 'Teammates collaborating at laptops',
    caption: 'Product sprinting side-by-side',
  },
  {
    src: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    alt: 'Crowd watching a live demo',
    caption: 'Live demos and quick feedback',
  },
  {
    src: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=1200&q=80',
    alt: 'Mentor guiding a student',
    caption: 'Mentors on-call to unblock you',
  },
];

export default function Page() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/content');
        if (!res.ok) throw new Error('no-content');
        const data = await res.json();
        setContent(data.content as Content);
      } catch {
        setContent(null);
      } finally {
        setLoadingContent(false);
      }
    }
    load();
  }, []);

  const data = content ?? demoContent;
  const stats = data.stats ?? demoContent.stats!;
  const faqs = useMemo(() => data.faqs || [], [data]);
  const details = useMemo(
    () => (data.details || []).filter((d) => d?.title?.toLowerCase() !== 'support'),
    [data]
  );
  const team = useMemo(() => data.team || [], [data]);
  const badges = (data.hero.badges || []).length ? data.hero.badges : demoContent.hero.badges;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content) {
      setError('Registration is closed until an event is published.');
      setFormState('error');
      return;
    }
    setFormState('submitting');
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.');
        setFormState('error');
        return;
      }

      setFormState('success');
      form.reset();
    } catch (err) {
      setError('Network error. Please try again.');
      setFormState('error');
    }
  }

  const noContent = !loadingContent && !content;

  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute inset-0 bg-hero-radial" />
      </div>

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="aurora-layer" />
        <div className="soft-rings" />
        <div className="cloud-bloom one" />
        <div className="cloud-bloom two" />
        <div className="cloud-bloom three" />
        <div className="line-glow" />
        <div className="grain-overlay" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[5] mix-blend-screen" aria-hidden>
        <div className="cursor-spotlight" />
      </div>

      <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.45)] transition-[background,box-shadow,transform] duration-200 hover:bg-white/14 header-blend relative">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="#top" className="inline-block">
              <Image
                src={HttWhiteLogo}
                alt="Hack The Throne"
                className="h-24 w-auto sm:h-28"
                priority
              />
            </a>
          </div>
          <nav className="flex flex-wrap gap-4 text-base">
            {navLinks.map((item) => (
              <a
                key={item.href}
                className="relative px-2 py-1 font-semibold text-white/80 transition-colors duration-200 hover:text-white after:absolute after:left-0 after:bottom-[-4px] after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-accent-primary after:transition after:duration-200 hover:after:scale-x-100"
                href={`#${item.href}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 space-y-12">
        {noContent && (
          <div className="glass mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-accent-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
            No event is published yet. Content below is a preview layout; registration stays closed until publish.
          </div>
        )}

        <section id="top" className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className="pointer-events-none absolute inset-y-0 right-[-8%] w-[38%] max-w-xl bg-[radial-gradient(circle_at_30%_30%,rgba(108,161,255,0.18),transparent_55%),radial-gradient(circle_at_70%_50%,rgba(92,225,255,0.12),transparent_52%),radial-gradient(circle_at_50%_80%,rgba(255,122,181,0.12),transparent_48%)] blur-3xl opacity-80"
            aria-hidden
          />
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-accent-primary">
              AIT CSE · On-campus · 2ⁿᵈ Year CSE only
            </div>
              <div className="space-y-3">
                <h1 className="hero-title-animate hero-outline font-kanji text-5xl sm:text-6xl md:text-7xl leading-tight">{data.hero.title}</h1>
                <p className="hero-tagline-animate font-dancing mx-auto block max-w-3xl text-center text-3xl sm:text-4xl md:text-5xl leading-tight">{data.hero.tagline}</p>
              </div>
            <div className="flex flex-wrap gap-3 text-sm text-base-100">
              {badges.map((b) => (
                <Pill key={b} label={b} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className={clsx(
                  'rounded-2xl bg-gradient-to-r from-accent-blue to-accent-secondary px-5 py-3 text-base font-semibold text-base-950 shadow-lg shadow-glow btn-animated cta-glow',
                  noContent && 'opacity-60 pointer-events-none'
                )}
                href="#register"
              >
                {noContent ? 'Registration closed' : 'Register now'}
              </a>
            </div>
          </div>

          <div id="events" className="glass relative overflow-hidden rounded-3xl px-6 py-6 shadow-deep">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" aria-hidden />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-primary">Events</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-base-100">Status</span>
              </div>
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-base-200">
                <p className="text-base font-semibold text-white">No active events right now.</p>
                <p className="text-sm text-base-300">We’ll publish the next cohort soon. Check back or join the mailing list.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a className="rounded-full bg-gradient-to-r from-accent-blue via-accent-primary to-accent-secondary px-4 py-2 text-sm font-semibold text-base-950 shadow-lg shadow-glow ring-1 ring-white/10 btn-animated cta-glow" href="#register">
                  Get notified
                </a>
                <a className="text-sm font-semibold text-accent-primary underline-offset-4 hover:underline leading-none" href="#faq">
                  View FAQ
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="hackathon" className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/5 bg-white/5 px-6 py-5">
            <SectionHeading eyebrow="What is a hackathon?" title="Build, demo, and get feedback fast" description="Two days to form a team, pick a problem, ship a working demo, and present it live." />
            <div className="mt-4 space-y-3 text-base text-base-200">
              {explainerPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-accent-blue to-accent-secondary shadow-[0_0_0_6px_rgba(124,140,255,0.18)]" />
                  <p>{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="rounded-full bg-gradient-to-r from-accent-blue via-accent-primary to-accent-secondary px-4 py-2 text-sm font-semibold text-base-950 shadow-lg shadow-glow ring-1 ring-white/10 btn-animated cta-glow" href="#register">
                Join the sprint
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {galleryImages.slice(0, 2).map((img) => (
              <div key={img.src} className="group relative overflow-hidden rounded-3xl bg-base-900/40 float-card">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-48 w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-base-950/80 via-base-950/30 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm font-semibold text-white">{img.caption}</p>
                  <p className="text-xs text-base-200">{img.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/5 bg-white/5 px-6 py-5">
            <SectionHeading eyebrow="Why this sprint" title="Designed for fast, confident shipping" description={data.hero.tagline} />
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {badges.map((t) => (
                <Pill key={t} label={t} subtle />
              ))}
            </div>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            {details.slice(0, 4).map((d) => (
              <InfoCard key={d.title} title={d.title} body={d.body} />
            ))}
          </div>
        </section>

        <section id="team" className="space-y-3">
          <SectionHeading eyebrow="People" title="Organizers and mentors" description="Fast feedback, crisp prompts, and grounded product guidance." />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {team.length ? (
              team.map((m) => <TeamCard key={m.name} member={m} />)
            ) : (
              <p className="text-base-300">Team roster will appear once published.</p>
            )}
          </div>
        </section>

        <section id="faq" className="space-y-3">
          <SectionHeading eyebrow="FAQ" title="Details that matter" description="What to bring, who can join, and how we run judging." />
          <div className="grid gap-2.5 md:grid-cols-2">
            {faqs.length ? (
              faqs.map((item) => <FaqCard key={item.q} item={item} />)
            ) : (
              <p className="text-base-300">FAQs will be posted soon.</p>
            )}
          </div>
        </section>

        <section id="gallery" className="space-y-3">
          <SectionHeading eyebrow="Vibe" title="Hackathon moments" description="Energy, focus, and demos — here’s what it looks like when teams build together." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((img) => (
              <div key={img.src} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-deep float-card">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-48 w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-base-950/85 via-base-950/40 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm font-semibold text-white">{img.caption}</p>
                  <p className="text-xs text-base-200">{img.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="register" className="grid gap-5">
          <div className="glass rounded-3xl px-6 py-5 shadow-deep">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-accent-primary">Apply to join</p>
                <h2 className="text-2xl font-semibold text-white">Registration</h2>
                <p className="text-base-300">{content?.registerNote || 'Registration opens when the next event is published.'}</p>
              </div>
            </div>

            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Team Name" name="teamName" placeholder="Your team name" required disabled={noContent} />
              </div>

              <GroupHeading title="Leader" required />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Leader Name" name="leaderName" placeholder="Full name" required disabled={noContent} />
                <Field label="Section" name="leaderSection" placeholder="Section (A/B/C/D)" required disabled={noContent} pattern="[A-Da-d]" maxLength={1} />
                <Field label="USN" name="leaderUSN" placeholder="USN" required disabled={noContent} pattern="[A-Za-z0-9]{10}" maxLength={10} />
                <Field label="WhatsApp Number" name="leaderWhatsapp" type="tel" placeholder="WhatsApp number" required disabled={noContent} pattern="[0-9]{10}" maxLength={10} inputMode="numeric" />
                <Field label="Acharya Mail ID" name="leaderEmail" type="email" placeholder="name@acharya.ac.in" required disabled={noContent} pattern="[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\\.[A-Za-z0-9.-]+" />
                <Field label="Hackathons attended before" name="leaderHackathons" type="number" placeholder="0" required disabled={noContent} />
              </div>

              <GroupHeading title="Member 1" required />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" name="member1Name" placeholder="Full name" required disabled={noContent} />
                <Field label="Section" name="member1Section" placeholder="Section (A/B/C/D)" required disabled={noContent} pattern="[A-Da-d]" maxLength={1} />
                <Field label="USN" name="member1USN" placeholder="USN" required disabled={noContent} pattern="[A-Za-z0-9]{10}" maxLength={10} />
                <Field label="WhatsApp Number" name="member1Whatsapp" type="tel" placeholder="WhatsApp number" required disabled={noContent} pattern="[0-9]{10}" maxLength={10} inputMode="numeric" />
                <Field label="Acharya Mail ID" name="member1Email" type="email" placeholder="name@acharya.ac.in" required disabled={noContent} pattern="[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\\.[A-Za-z0-9.-]+" />
                <Field label="Hackathons attended before" name="member1Hackathons" type="number" placeholder="0" required disabled={noContent} />
              </div>

              <GroupHeading title="Member 2" required />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" name="member2Name" placeholder="Full name" required disabled={noContent} />
                <Field label="Section" name="member2Section" placeholder="Section (A/B/C/D)" required disabled={noContent} pattern="[A-Da-d]" maxLength={1} />
                <Field label="USN" name="member2USN" placeholder="USN" required disabled={noContent} pattern="[A-Za-z0-9]{10}" maxLength={10} />
                <Field label="WhatsApp Number" name="member2Whatsapp" type="tel" placeholder="WhatsApp number" required disabled={noContent} pattern="[0-9]{10}" maxLength={10} inputMode="numeric" />
                <Field label="Acharya Mail ID" name="member2Email" type="email" placeholder="name@acharya.ac.in" required disabled={noContent} pattern="[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\\.[A-Za-z0-9.-]+" />
                <Field label="Hackathons attended before" name="member2Hackathons" type="number" placeholder="0" required disabled={noContent} />
              </div>

              <GroupHeading title="Member 3" required />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" name="member3Name" placeholder="Full name" required disabled={noContent} />
                <Field label="Section" name="member3Section" placeholder="Section (A/B/C/D)" required disabled={noContent} pattern="[A-Da-d]" maxLength={1} />
                <Field label="USN" name="member3USN" placeholder="USN" required disabled={noContent} pattern="[A-Za-z0-9]{10}" maxLength={10} />
                <Field label="WhatsApp Number" name="member3Whatsapp" type="tel" placeholder="WhatsApp number" required disabled={noContent} pattern="[0-9]{10}" maxLength={10} inputMode="numeric" />
                <Field label="Acharya Mail ID" name="member3Email" type="email" placeholder="name@acharya.ac.in" required disabled={noContent} pattern="[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\\.[A-Za-z0-9.-]+" />
                <Field label="Hackathons attended before" name="member3Hackathons" type="number" placeholder="0" required disabled={noContent} />
              </div>

              <GroupHeading title="Member 4" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" name="member4Name" placeholder="Full name" disabled={noContent} />
                <Field label="Section" name="member4Section" placeholder="Section (A/B/C/D)" disabled={noContent} pattern="[A-Da-d]" maxLength={1} />
                <Field label="USN" name="member4USN" placeholder="USN" disabled={noContent} pattern="[A-Za-z0-9]{10}" maxLength={10} />
                <Field label="WhatsApp Number" name="member4Whatsapp" type="tel" placeholder="WhatsApp number" disabled={noContent} pattern="[0-9]{10}" maxLength={10} inputMode="numeric" />
                <Field label="Acharya Mail ID" name="member4Email" type="email" placeholder="name@acharya.ac.in" disabled={noContent} pattern="[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\\.[A-Za-z0-9.-]+" />
                <Field label="Hackathons attended before" name="member4Hackathons" type="number" placeholder="0" disabled={noContent} />
              </div>

              <GroupHeading title="Member 5" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" name="member5Name" placeholder="Full name" disabled={noContent} />
                <Field label="Section" name="member5Section" placeholder="Section (A/B/C/D)" disabled={noContent} pattern="[A-Da-d]" maxLength={1} />
                <Field label="USN" name="member5USN" placeholder="USN" disabled={noContent} pattern="[A-Za-z0-9]{10}" maxLength={10} />
                <Field label="WhatsApp Number" name="member5Whatsapp" type="tel" placeholder="WhatsApp number" disabled={noContent} pattern="[0-9]{10}" maxLength={10} inputMode="numeric" />
                <Field label="Acharya Mail ID" name="member5Email" type="email" placeholder="name@acharya.ac.in" disabled={noContent} pattern="[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\\.[A-Za-z0-9.-]+" />
                <Field label="Hackathons attended before" name="member5Hackathons" type="number" placeholder="0" disabled={noContent} />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex flex-col items-start gap-3">
                <p className="font-dancing text-2xl font-semibold text-red-200 drop-shadow">Just One Question : Are You Ready to Claim The Throne ...???</p>
                <button
                  className={clsx(
                    'font-dancing rounded-2xl px-5 py-3 text-lg font-semibold shadow-lg shadow-glow btn-animated cta-glow',
                    'bg-gradient-to-r from-accent-blue to-accent-secondary text-base-950',
                    (formState === 'submitting' || noContent) && 'opacity-80'
                  )}
                  type="submit"
                  disabled={formState === 'submitting' || noContent}
                >
                  {noContent ? 'Registration closed' : formState === 'submitting' ? 'Submitting…' : 'yes(Submit)'}
                </button>
                {formState === 'success' && (
                  <div className="flex flex-col gap-2 rounded-2xl bg-accent-primary/10 px-3 py-2 text-sm text-accent-primary">
                    <span className="font-semibold">Thanks!  We received your registration.</span>
                    <a
                      className="inline-flex items-center gap-1 text-base font-semibold underline underline-offset-4 hover:text-accent-blue"
                      href="https://chat.whatsapp.com/H5JUL4SW1PqKM6gNZ5wGmh"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join the WhatsApp Participants Group
                      <span aria-hidden>→</span>
                    </a>
                    <span className="text-xs text-accent-primary/80">Use this link to get schedule updates, venue details, and mentor alerts.</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-base-900/60 py-10 text-base-300">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 text-sm">
          <div>
            <p className="font-semibold text-white">Hack The Throne</p>
            <p>AIT CSE Campus</p>
          </div>
          <div>
            <p className="font-semibold text-white">Contact</p>
            <p>dhanushvpshetty@gmail.com · +91 9606726468</p>
          </div>
          <div>
            <p className="font-semibold text-white">Social</p>
            <div className="flex gap-2">
              <a className="rounded-lg border border-white/10 px-3 py-2 text-white hover:border-accent-blue btn-outline-animated" href="#">Twitter</a>
              <a className="rounded-lg border border-white/10 px-3 py-2 text-white hover:border-accent-blue btn-outline-animated" href="#">LinkedIn</a>
              <a className="rounded-lg border border-white/10 px-3 py-2 text-white hover:border-accent-blue btn-outline-animated" href="#">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-primary">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="text-base text-base-300">{description}</p>
    </div>
  );
}

function GroupHeading({ title, required }: { title: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-sm font-semibold text-white/80">{title}</p>
      <span
        className={clsx(
          'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
          required
            ? 'border border-accent-primary/40 bg-accent-primary/10 text-accent-primary'
            : 'border border-white/10 bg-white/5 text-base-300'
        )}
      >
        {required ? 'Required' : 'Optional'}
      </span>
    </div>
  );
}

function Pill({ label, subtle }: { label: string; subtle?: boolean }) {
  return (
    <span
      className={clsx(
        'rounded-full px-3 py-1 text-xs font-semibold pill-float',
        subtle
          ? 'border border-white/10 bg-white/5 text-base-200'
          : 'border border-white/10 bg-white/10 text-accent-primary shadow-[0_10px_40px_rgba(124,140,255,0.18)]'
      )}
    >
      {label}
    </span>
  );
}

function StatCard({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-card">
      <p className="text-sm text-base-300">{title}</p>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="text-sm text-base-300">{caption}</p>
    </div>
  );
}

function InfoCard({ title, body, subtle }: { title: string; body: string; subtle?: boolean }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-white/5 p-4 shadow-card float-card',
        subtle ? 'bg-white/5' : 'glass'
      )}
    >
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="text-sm text-base-300 whitespace-pre-line">{body}</p>
    </div>
  );
}

function TeamCard({ member }: { member: { name: string; role: string } }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-card float-card flex flex-col items-center text-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-secondary text-base font-bold text-base-950">
        {member.name
          .split(' ')
          .map((p) => p[0])
          .join('')}
      </div>
      <p className="text-xl font-semibold text-white">{member.name}</p>
      <p className="text-sm text-base-300">{member.role}</p>
    </div>
  );
}

function FaqCard({ item }: { item: { q: string; a: string } }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <p className="text-lg font-semibold text-white">{item.q}</p>
      <p className="text-sm text-base-300">{item.a}</p>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  disabled,
  pattern,
  maxLength,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  pattern?: string;
  maxLength?: number;
  inputMode?: ComponentProps<'input'>['inputMode'];
}) {
  return (
    <label className="block text-sm text-base-100">
      <span className="mb-2 block font-semibold text-white">{label}{required ? ' *' : ''}</span>
      <input
        className="w-full rounded-xl glossy-input px-4 py-3 text-white outline-none ring-0 transition focus:border-accent-blue focus-glow"
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        pattern={pattern}
        maxLength={maxLength}
        inputMode={inputMode}
      />
    </label>
  );
}
