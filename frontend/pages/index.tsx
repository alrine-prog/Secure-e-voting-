import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
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
          {/* Sign In / Login button hidden from top menu bar */}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12 space-y-16">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Next-Gen Secure E-Voting Platform
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Transparent, Encrypted & Verifiable Elections
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
              {/* Replace src with your custom image path */}
              <img
                src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1200&auto=format&fit=crop"
                alt="Secure Digital E-Voting System"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md">
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">End-To-End Encryption</p>
                <p className="text-sm text-slate-200 mt-1 font-medium">Guaranteeing voter privacy & immutable audit trails.</p>
              </div>
            </div>
          </div>
        </section>

        {/* KEY FEATURES SECTION */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Choose Our Voter Portal</h2>
            <p className="text-slate-400 text-sm">Designed for institutional security, trust, and total voter confidentiality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xl">
                🔒
              </div>
              <h3 className="text-lg font-bold text-white">Anonymized Ballots</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Votes are decoupled from voter identity using zero-knowledge encryption algorithms.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl">
                🧾
              </div>
              <h3 className="text-lg font-bold text-white">Cryptographic Receipts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Voters receive a unique hash key after voting to verify their vote is counted in the tally.
              </
