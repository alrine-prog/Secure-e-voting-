import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans antialiased"/>
      {/* TOP NAVIGATION */}
      <nav className="top-nav flex items-center justify-between w-full px-6 py-4 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50"/>
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
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"></span>
              Live Tally
            </a>
          </Link>
          {/* Sign In / Login button hidden from top menu bar */}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12 space-y-16">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Next-Gen Secure E-Voting Platform
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Transparent, Encrypted &amp; Verifiable Elections
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Empowering communities and organizations with tamper-proof cryptographic voting, real-time auditability, and seamless digital access.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/about" legacyBehavior>
                <a className="px-6 py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white text-sm transition shadow-lg shadow-purple-900/40">
                  Learn How It Works
                </a>
              </Link>
              <Link href="/observer/live-tally" legacyBehavior>
                <a className="px-6 py-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm transition">
                  Explore Live Results
                </a>
              </Link>
            </div>
          </div>

          {/* HERO IMAGE / GRAPHIC */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-800/40 shadow-2xl p-2 group">
            <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1200&auto=format&fit=crop"
                alt="
