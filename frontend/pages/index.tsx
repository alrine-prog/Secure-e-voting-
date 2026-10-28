import Link from 'next/link';
import { useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  bio: string;
}

export default function VoterIndexPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [voterTokenInput, setVoterTokenInput] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [receiptHash, setReceiptHash] = useState<string>('');

  const candidates: Candidate[] = [
    {
      id: 'cand-1',
      name: 'Dr. Sarah Jenkins',
      party: 'Alliance Party',
      bio: 'Focusing on research expansion, campus sustainability, and tuition stabilization.',
    },
    {
      id: 'cand-2',
      name: 'Marcus Vance',
      party: 'Progressive Choice',
      bio: 'Advocating for digital infrastructure, mental health funding, and student housing reform.',
    },
    {
      id: 'cand-3',
      name: 'Elena Rostova',
      party: 'Independent Coalition',
      bio: 'Promoting transparent campus governance, diversity initiatives, and career mentorship.',
    },
  ];

  const handleTokenAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (voterTokenInput.trim()) {
      setIsAuthenticated(true);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setHasVoted(true);
      setReceiptHash(`0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
      {/* TOP NAVIGATION */}
      <nav className="top-nav flex items-center justify-between w-full px-6 py-4 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" legacyBehavior>
            <a className="font-bold text-lg text-white hover:text-purple-400 transition">
              VoterPortal
            </a>
          </Link>
          <Link href="/about" legacyBehavior>
            <a className="text-sm text-slate-300 hover:text-white transition hidden md:inline-block">
              About
            </a>
          </Link>
          <Link href="/policies" legacyBehavior>
            <a className="text-sm text-slate-300 hover:text-white transition hidden md:inline-block">
              Policies
            </a>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/observer/live-tally" legacyBehavior>
            <a className="px-3 py-1.5 text-xs font-semibold rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              Live Tally
            </a>
          </Link>

          {isAuthenticated ? (
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/login?role=voter" legacyBehavior>
              <a className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white shadow transition">
                Sign In
              </a>
            </Link>
          )}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-10 space-y-12">
        {hasVoted ? (
          <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white">Vote Successfully Recorded!</h1>
              <p className="text-slate-300 text-sm">
                Your ballot has been encrypted, anonymized, and committed to the official tally.
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-left space-y-2 font-mono text-xs">
              <span className="text-slate-400 font-sans block text-xs font-bold uppercase tracking-wider">
                Cryptographic Receipt Hash
              </span>
              <p className="text-purple-400 break-all bg-slate-950 p-2 rounded border border-slate-800">
                {receiptHash}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/observer/live-tally" legacyBehavior>
                <a className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition">
                  View Live Results Tally →
                </a>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Polls Open • Closes Today at 5:00 PM
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                2026 Executive Officer Election
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Cast your vote securely or enter your voter passcode below to access your digital ballot.
              </p>
            </section>

            {isAuthenticated ? (
              <section className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-700/60 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Official Ballot</h2>
                    <p className="text-xs text-slate-400">Select one candidate for President / Executive Director</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Voter Verified
                  </span>
                </div>

                <div className="space-y-4">
                  {candidates.map((candidate) => {
                    const isSelected = selectedCandidate === candidate.id;
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedCandidate(candidate.id)}
                        className={`p-5 rounded-xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-purple-900/20 border-purple-500 text-white ring-1 ring-purple-500'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-white">{candidate.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium border border-slate-700">
                              {candidate.party}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 max-w-xl">{candidate.bio}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="candidate"
                            checked={isSelected}
                            onChange={() => setSelectedCandidate(candidate.id)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 accent-purple-500"
                          />
                          <span className="text-xs font-semibold text-slate-300 sm:hidden">Select</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-700/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400">
                    * Submissions are final and cannot be altered once broadcasted.
                  </p>
                  <button
                    onClick={handleVoteSubmit}
                    disabled={!selectedCandidate || isSubmitting}
                    className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-sm transition shadow-lg ${
                      !selectedCandidate || isSubmitting
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/40'
                    }`}
                  >
                    {isSubmitting ? 'Encrypting & Casting...' : 'Cast Official Vote →'}
                  </button>
                </div>
              </section>
            ) : (
              <section className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-white">Enter Voting Token to Access Ballot</h2>
                  <p className="text-xs text-slate-400">
                    Input your single-use voting passcode or sign in with your institutional credentials.
                  </p>
                </div>

                <form onSubmit={handleTokenAuthenticate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Voter Key / Token</label>
                    <input
                      type="text"
                      placeholder="e.g. VT-9824-X12"
                      value={voterTokenInput}
                      onChange={(e) => setVoterTokenInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white text-sm transition shadow"
                  >
                    Unlock My Ballot &rarr;
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase font-semibold">Or</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <Link href="/login?role=voter" legacyBehavior>
                  <a className="block text-center py-2.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition">
                    Sign In with SSO / Student Account
                  </a>
                </Link>
              </section>
            )}

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase">Ballots Submitted</span>
                <p className="text-2xl font-bold text-white mt-1">30,640</p>
              </div>
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase">Current Turnout</span>
                <p className="text-2xl font-bold text-white mt-1">68.4%</p>
              </div>
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase">Audit Status</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">✓ Active</p>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} E-Voting System. Secure Encrypted Voting Module.</p>
      </footer>
    </div>
  );
}
Do for me some adjustments where this page serve only as Home page with photo that talk about the system    and the hide login link on button menu
