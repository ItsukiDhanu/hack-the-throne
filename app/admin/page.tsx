"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Content, ContentSchema } from '../lib/content';
import { defaultContent } from '../lib/defaultContent';

const template: Content = defaultContent;

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
