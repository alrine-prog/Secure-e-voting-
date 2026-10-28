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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

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

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setSelectedCandidate(null);
    setHasVoted(false);
    setReceiptHash('');
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white"/>
      <nav className="top-nav w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between"/>
          <div className="flex items-center gap-4 lg:gap-6"/>
            <Link
              href="/"
              className="font-bold text-lg sm:text-xl text-white hover:text-purple-400 transition tracking-tight"
            >
              VoterPortal
            </Link>
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <Link href="/about" className="text-sm text-slate-300 hover:text-white transition">
                About
              </Link>
              <Link href="/policies" className="text-sm text-slate-300 hover:text-white transition">
                Policies
              </Link>
              <Link href="/support" className="text-sm text-slate-300 hover:text-white transition">
                Support
              </Link>
            </div>

          /* Right Aligned Section */
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/observer/live-tally"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition flex items-center gap-1.5 sm:gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="hidden xs:inline">Live Tally</span>
              <span className="xs:hidden">Live</span>
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Sign Out
              </button>
            ) : (
              /* Dropdown Menu Button */
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white shadow transition flex items-center gap-1.5 sm:gap-2"
                >
                  <span>Sign In / Register</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-md shadow-lg bg-slate-800 border border-slate-700 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href="/login?role=voter"
                        className="block px-4 py-2 text-xs sm:text-sm text-slate-200 hover:bg-slate-700 hover:text-white"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register/voter"
                        className="block px-4 py-2 text-xs sm:text-sm text-slate-200 hover:bg-slate-700 hover:text-white"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Register as Voter
                      
