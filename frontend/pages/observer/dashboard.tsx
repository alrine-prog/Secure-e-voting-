import Link from 'next/link';
import { useState } from 'react';

interface PrecinctStatus {
  id: string;
  name: string;
  votesCast: number;
  totalVoters: number;
  status: 'active' | 'synced' | 'flagged';
}

export default function ObserverDashboardPage() {
  const [precincts] = useState<PrecinctStatus[]>([
    { id: '1', name: 'Main Campus - Library', votesCast: 4230, totalVoters: 5500, status: 'synced' },
    { id: '2', name: 'North Hall Precinct', votesCast: 3120, totalVoters: 4000, status: 'synced' },
    { id: '3', name: 'Engineering Quad', votesCast: 5890, totalVoters: 7200, status: 'active' },
    { id: '4', name: 'West Annex Gym', votesCast: 1420, totalVoters: 2500, status: 'flagged' },
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* TOP NAVIGATION HEADER */}
      <nav className="top-nav flex items-center justify-between w-full px-6 py-4 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" legacyBehavior>
            <a className="font-bold text-lg text-white hover:text-orange-400 transition">
              Observer Portal
            </a>
          </Link>
          <Link href="/observer/live-tally" legacyBehavior>
            <a className="text-sm text-slate-300 hover:text-white transition">Live Tally</a>
          </Link>
          <Link href="/about" legacyBehavior>
            <a className="text-sm text-slate-300 hover:text-white transition hidden md:inline-block">About</a>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Monitoring Active
          </span>
          <Link href="/login?role=observer" legacyBehavior>
