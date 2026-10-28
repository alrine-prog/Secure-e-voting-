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

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* TOP NAVIGATION */}
      <nav className="top-nav w-full bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Left Aligned Section */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/" legacyBehavior>
              <a className="font-bold text-lg sm:text-xl text-white hover:text-purple-400 transition tracking-tight">
                VoterPortal
              </a>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <Link href="/about" legacyBehavior>
                <a className="text-sm text-slate-300 hover:text-white transition">
                  About
                </a>
              </Link>
              <Link href="/policies" legacyBehavior>
                <a className="text-sm text-slate-300 hover:text-white transition">
                  Policies
                </a>
              </Link>
              <Link href="/support" legacyBehavior>
                <a className="text-sm text-slate-300 hover:text-white transition">
                  Support
                </a>
              </Link>
            </div>
          </div>

          {/* Right Aligned Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/observer/live-tally" legacyBehavior>
              <a className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition flex items-center gap-1.5 sm:gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="hidden sm:inline">Live Tally</span>
                <span className="sm:hidden">Live</span>
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
              /* Dropdown Menu Container */
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white shadow transition flex items-center gap-1.5 sm:gap-2"
                >
                  <span>Sign In / Register</span>
                  <svg
