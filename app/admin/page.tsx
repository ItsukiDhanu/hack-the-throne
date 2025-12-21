"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Content, ContentSchema } from '../lib/content';

const template: Content = {
  hero: {
    title: 'Pulse Hackathon 2025',
    tagline: 'Build resilient, intelligent solutions that move communities forward.',
    badges: ['Jan 24–25, 2025', 'Innovation Hub · Hall B', '20 teams', '$10k prizes'],
  },
  details: [
    { title: 'Date & Time', body: 'January 24–25, 2025 · Starts 9:00 AM' },
    { title: 'Venue', body: 'Innovation Hub, Hall B · Atlantis Tech Park' },
    { title: 'Tracks', body: 'Urban mobility · Civic tools · Resilience infra · Open data' },
    { title: 'Who', body: 'Developers, designers, PMs, data builders' },
    { title: 'Prizes', body: '$10k cash + partner credits + pilot opportunities' },
    { title: 'Support', body: 'Food, Wi-Fi, charging, mentors, quiet rooms' },
  ],
  schedule: [
    { time: '8:15 AM', title: 'Check-in', body: 'Badge pickup, breakfast, team tables open.' },
    { time: '9:00 AM', title: 'Kickoff', body: 'Keynote + challenge drop; sponsor APIs and datasets.' },
    { time: '10:00 AM', title: 'Sprint', body: 'Mentor office hours rolling; hardware + data sandbox live.' },
    { time: '7:00 PM', title: 'Health check', body: 'Progress reviews to unblock teams.' },
    { time: '10:00 AM', title: 'Submission', body: 'Code freeze, deck upload, demo order announced.' },
    { time: '11:00 AM', title: 'Demos', body: '5 min pitch + live QA.' },
  ],
  team: [
    { name: 'Avery Lane', role: 'Lead Organizer' },
    { name: 'Jordan Malik', role: 'Engineering Lead' },
    { name: 'Casey Sun', role: 'Design Lead' },
    { name: 'Taylor Reed', role: 'Operations' },
  ],
  faqs: [
    { q: 'Who can join?', a: 'Developers, designers, PMs, data folks. Teams of 2–5.' },
    { q: 'Do we need an idea now?', a: 'No. We share prompts and data on-site; bring your own if it fits the theme.' },
    { q: 'What should we bring?', a: 'Laptop, chargers, ID, and any hardware. We provide power, internet, snacks, and coffee nonstop.' },
    { q: 'Do you support beginners?', a: 'Yes. Mentors, template repos, and lightning how-tos run all day.' },
  ],
  stats: [
    { title: 'Mentors', value: '15', caption: 'Product · AI/ML · DevOps' },
    { title: 'Tracks', value: '4', caption: 'Mobility · Civic · Resilience · Open data' },
    { title: 'Support', value: '24/7', caption: 'Food · Wi-Fi · Nap pods' },
  ],
  registerNote: 'Seats limited to 20 teams. We will confirm within 48 hours.',
};

function AdminInner() {
  const search = useSearchParams();
  const presetToken = search.get('token')?.trim() || '';
  const [token, setToken] = useState(presetToken);
  const [jsonText, setJsonText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/content')
      .then(async (res) => {
        if (!res.ok) throw new Error('No current content');
        const data = await res.json();
        setJsonText(JSON.stringify(data.content, null, 2));
      })
      .catch(() => setJsonText(JSON.stringify(template, null, 2)));
  }, []);

  async function save() {
    setLoading(true);
    setStatus(null);
    setError(null);
    const auth = token.trim();
    try {
      const parsed = ContentSchema.parse(JSON.parse(jsonText));
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth ? { Authorization: `Bearer ${auth}`, 'x-admin-token': auth } : {}),
        },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setStatus('Saved content');
    } catch (err: any) {
      setError(err?.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Admin · Content</h1>
        <a className="text-sm text-blue-300 underline" href="/">Back to site</a>
      </div>
      <p className="text-base text-slate-200">Paste or edit the event JSON. Save with your admin token.</p>
      <div className="flex flex-col gap-3">
        <input
          type="password"
          placeholder="Admin token"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <textarea
          className="min-h-[480px] w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setJsonText(JSON.stringify(template, null, 2))}
            className="rounded-lg border border-white/10 px-4 py-2 text-white hover:border-blue-400/60"
            type="button"
          >
            Reset to template
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-pink-500 px-4 py-2 font-semibold text-base-900 shadow-md shadow-blue-500/30 disabled:opacity-70"
            type="button"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading…</div>}>
      <AdminInner />
    </Suspense>
  );
}
