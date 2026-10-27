// app/voter/live-tally/page.tsx
import Link from 'next/link';

export default function VoterLiveTally() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Election Results (Live)</h1>
        
        {/* Simplified Candidate Progress Bar */}
        <div className="bg-slate-800 p-4 rounded-lg space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Dr. Sarah Jenkins</span>
            <span>54.2%</span>
          </div>
          <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[54.2%]" />
          </div>
        </div>

        <Link href="/voter/ballot" legacyBehavior>
          <a className="block text-center text-sm text-purple-400 mt-4">Return to Ballot Options</a>
        </Link>
      </div>
    </div>
  );
}
