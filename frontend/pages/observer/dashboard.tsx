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
            <a className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
              Switch User
            </a>
          </Link>
        </div>
      </nav>

      {/* DASHBOARD CONTENT */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Observer Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Independent monitoring portal for election auditing, integrity checks, and live tallies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/observer/live-tally" legacyBehavior>
              <a className="px-4 py-2 text-sm font-semibold rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow transition flex items-center gap-2">
                <span>View Full Live Tally</span>
                <span>&rarr;</span>
              </a>
            </Link>
          </div>
        </div>

        {/* SUMMARY STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-xl">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Ballots Audited</span>
            <div className="text-3xl font-extrabold text-white mt-2">14,660</div>
            <span className="text-xs text-emerald-400 mt-1 inline-block">100% Cryptographically Valid</span>
          </div>

          <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-xl">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Overall Turnout</span>
            <div className="text-3xl font-extrabold text-white mt-2">76.3%</div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-700/40">
              <div className="bg-orange-500 h-full w-[76.3%]" />
            </div>
          </div>

          <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-xl">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Reporting Precincts</span>
            <div className="text-3xl font-extrabold text-white mt-2">4 / 4</div>
            <span className="text-xs text-slate-400 mt-1 inline-block">All polling nodes active</span>
          </div>

          <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-xl">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">System Integrity</span>
            <div className="text-2xl font-bold text-emerald-400 mt-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified
            </div>
            <span className="text-xs text-slate-400 mt-1 inline-block">No hash mismatches</span>
          </div>
        </div>

        {/* ACTION / QUICK MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
              📊
            </div>
            <h3 className="text-lg font-bold text-white">Live Results Tally</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track candidate vote counts, percentages, and real-time precinct updates as votes are submitted.
            </p>
            <Link href="/observer/live-tally" legacyBehavior>
              <a className="inline-block text-xs font-semibold text-orange-400 hover:underline pt-2">
                Open Tally Dashboard &rarr;
              </a>
            </Link>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
              🔍
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Audit Logs</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Verify zero-knowledge proof receipts and block hashes to ensure complete voter privacy and accuracy.
            </p>
            <span className="inline-block text-xs font-semibold text-slate-500 cursor-not-allowed pt-2">
              Automated Validation Active
            </span>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-white">Incident & Discrepancy Log</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
