"use client";

import { Suspense, useMemo, useState } from 'react';
import type { RegistrationPayload } from '@/app/lib/store';
import { useSearchParams } from 'next/navigation';

function toCsv(rows: RegistrationPayload[]) {
  const headers = [
    'id','createdAt','teamTag','teamName','track','advancedMembers',
    'leaderName','leaderSection','leaderUSN','leaderWhatsapp','leaderEmail','leaderHackathons',
    'member1Name','member1Hackathons',
    'member2Name','member2Hackathons',
    'member3Name','member3Hackathons',
    'member4Name','member4Hackathons',
    'member5Name','member5Hackathons',
  ];
  const escape = (v: unknown) => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape((row as any)[h])).join(','));
  }
  return lines.join('\n');
}

function RegistrationsInner() {
  const search = useSearchParams();
  const presetToken = search.get('token')?.trim() || '';
  const [token, setToken] = useState(presetToken);
  const [limit, setLimit] = useState(100);
  const [registrations, setRegistrations] = useState<RegistrationPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setStatus(null);
    const auth = token.trim();
    try {
      const qs = new URLSearchParams({ limit: String(limit) });
      if (auth) qs.set('token', auth);
      const res = await fetch(`/api/registrations?${qs.toString()}`, {
        headers: auth ? { Authorization: `Bearer ${auth}`, 'x-admin-token': auth } : {},
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to load');
      setRegistrations(data.registrations || []);
      setStatus(`Loaded ${data.registrations?.length || 0} registrations`);
    } catch (err: any) {
      setError(err?.message || 'Error loading');
    } finally {
      setLoading(false);
    }
  }

  function downloadCsv() {
    const csv = toCsv(registrations);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const latest = useMemo(() => registrations.slice(0, 5), [registrations]);

  const memberCount = (r: RegistrationPayload) => {
    let count = r.leaderName ? 1 : 0;
    const names = [r.member1Name, r.member2Name, r.member3Name, r.member4Name, r.member5Name];
    for (const name of names) {
      if (name) count += 1;
    }
    return count;
  };

  async function remove(id: string) {
    setError(null);
    setStatus(null);
    const auth = token.trim();
    if (!auth) {
      setError('Admin token required');
      return;
    }

    const target = registrations.find((r) => r.id === id);
    const label = target ? `${target.teamName} (${target.leaderName})` : 'this registration';
    const ok = window.confirm(`Delete ${label}? This action cannot be undone.`);
    if (!ok) return;

    setDeletingId(id);
    try {
      const qs = new URLSearchParams({ id });
      qs.set('token', auth);
      const res = await fetch(`/api/registrations?${qs.toString()}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth}`, 'x-admin-token': auth },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to delete');
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      setStatus('Deleted registration');
    } catch (err: any) {
      setError(err?.message || 'Error deleting');
    } finally {
      setDeletingId(null);
    }
  }

  async function removeAll() {
    setError(null);
    setStatus(null);
    const auth = token.trim();
    if (!auth) {
      setError('Admin token required');
      return;
    }

    const ok = window.confirm('Delete ALL registrations? This cannot be undone.');
    if (!ok) return;

    setDeletingAll(true);
    try {
      const qs = new URLSearchParams({ all: 'true' });
      qs.set('token', auth);
      const res = await fetch(`/api/registrations?${qs.toString()}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth}`, 'x-admin-token': auth },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to delete all');
      setRegistrations([]);
      setStatus('Deleted all registrations');
    } catch (err: any) {
      setError(err?.message || 'Error deleting all');
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Admin · Registrations</h1>
        <a className="text-sm text-blue-300 underline" href="/">Back to site</a>
      </div>
      <p className="text-base text-slate-200">Fetch recent registrations and export to CSV. Provide the admin token if configured.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-slate-200">
          Admin token
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="rounded-lg glossy-input px-3 py-2 text-white"
            placeholder="Bearer token"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-200">
          Limit (max 500)
          <input
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 1)}
            className="rounded-lg glossy-input px-3 py-2 text-white"
          />
        </label>
        <div className="flex items-end gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-accent-blue to-accent-secondary px-4 py-2 font-semibold text-base-950 shadow-lg shadow-glow btn-animated disabled:opacity-60"
            type="button"
          >
            {loading ? 'Loading…' : 'Load'}
          </button>
          <button
            onClick={downloadCsv}
            disabled={!registrations.length}
            className="rounded-lg border border-white/10 px-4 py-2 font-semibold text-white hover:border-accent-blue btn-outline-animated disabled:opacity-60"
            type="button"
          >
            Download CSV
          </button>
          <button
            onClick={removeAll}
            disabled={!registrations.length || deletingAll}
            className="rounded-lg border border-red-500/60 px-4 py-2 font-semibold text-red-200 hover:border-red-400 btn-outline-animated disabled:opacity-60"
            type="button"
          >
            {deletingAll ? 'Deleting all…' : 'Delete all'}
          </button>
        </div>
      </div>

      {status && <p className="text-sm text-emerald-400">{status}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="overflow-auto rounded-2xl border border-white/10 bg-white/5 shadow-card">
        <table className="min-w-full text-sm text-slate-200">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-left">Tag</th>
              <th className="px-3 py-2 text-left">Leader</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Track</th>
              <th className="px-3 py-2 text-left">Advanced</th>
              <th className="px-3 py-2 text-left">Members</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {latest.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-3 py-2 font-semibold text-white">{r.teamName}</td>
                <td className="px-3 py-2 text-slate-200">{r.teamTag || '—'}</td>
                <td className="px-3 py-2">
                  <div className="font-semibold text-white">{r.leaderName}</div>
                  <div className="text-xs text-slate-400">{r.leaderEmail}</div>
                </td>
                <td className="px-3 py-2 text-slate-400">{new Date(Number(r.createdAt || 0)).toLocaleString()}</td>
                <td className="px-3 py-2 text-slate-200">{r.track || 'Basic'}</td>
                <td className="px-3 py-2 text-slate-400">{r.advancedMembers ?? 0}</td>
                <td className="px-3 py-2 text-slate-400">{memberCount(r)} members</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => remove(r.id)}
                    disabled={deletingId === r.id}
                    className="rounded-lg border border-red-500/60 px-3 py-1 text-xs font-semibold text-red-200 hover:border-red-400 btn-outline-animated disabled:opacity-60"
                    type="button"
                  >
                    {deletingId === r.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {!latest.length && (
              <tr>
                <td className="px-3 py-3 text-slate-400" colSpan={5}>No registrations loaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RegistrationsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading…</div>}>
      <RegistrationsInner />
    </Suspense>
  );
}
