import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CandidateResult {
  id: string;
  name: string;
  party: string;
  votes: number;
  color: string;
}

export default function LiveTallyPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLive, setIsLive] = useState<boolean>(true);

  // Mock initial tally data
  const [results, setResults] = useState<CandidateResult[]>([
    { id: '1', name: 'Dr. Sarah Jenkins', party: 'Alliance Party', votes: 14230, color: 'bg-blue-600' },
    { id: '2', name: 'Marcus Vance', party: 'Progressive Choice', votes: 11890, color: 'bg-purple-600' },
    { id: '3', name: 'Elena Rostova', party: 'Independent Coalition', votes: 4520, color: 'bg-emerald-600' },
  ]);

  const totalVotes = results.reduce((acc, curr) => acc + curr.votes, 0);

  // Function to simulate real-time updates
  const refreshTally = () => {
    setResults((prev) =>
      prev.map((candidate) => ({
        ...candidate,
        votes: candidate.votes + Math.floor(Math.random() * 15),
      }))
    );
    setLastUpdated(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    if (!isLive) return;

    // Simulate real-time websocket/polling updates every 5 seconds
    const interval = setInterval(() => {
      refreshTally();
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">Live Election Tally</h1>
              {isLive ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE UPDATING
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                  PAUSED
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Observer Dashboard • Last sync: <span className="text-slate-200">{lastUpdated}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className="px-4 py-2 text-sm font-medium rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {isLive ? 'Pause Stream' : 'Resume Stream'}
            </button>
            <button
              onClick={refreshTally}
              className="px-4 py-2 text-sm font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow transition"
            >
              Force Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-lg">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Ballots Cast</span>
            <div className="text-3xl font-bold mt-2 text-white">{totalVotes.toLocaleString()}</div>
          </div>
          <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-lg">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Precincts Reporting</span>
            <div className="text-3xl font-bold mt-2 text-white">42 / 45 <span className="text-sm font-normal text-slate-400">(93.3%)</span></div>
          </div>
          <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-lg">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Voter Turnout</span>
            <div className="text-3xl font-bold mt-2 text-white">68.4%</div>
          </div>
          <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-lg">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Audit Integrity Status</span>
            <div className="text-3xl font-bold mt-2 text-emerald-400 flex items-center gap-2 text-2xl">
              ✓ Verified
            </div>
          </div>
        </div>

        {/* Candidate Results breakdown */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Executive Board Election Results</h2>

          <div className="space-y-6">
            {results.map((candidate) => {
              const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : '0';

              return (
                <div key={candidate.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-semibold text-white text-lg">{candidate.name}</span>
                      <span className="ml-3 text-xs text-slate-400 font-medium">{candidate.party}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-white">{candidate.votes.toLocaleString()}</span>
                      <span className="ml-2 text-sm text-slate-400">({percentage}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${candidate.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation Back to Portal */}
        <div className="flex justify-between items-center pt-4">
          <Link href="/" legacyBehavior>
            <a className="text-sm text-slate-400 hover:text-white transition">← Back to Dashboard</a>
          </Link>
        </div>

      </div>
    </div>
  );
}
