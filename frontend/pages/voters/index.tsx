import Link from 'next/link';

export default function VoterIndexPage() {
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
          <Link href="/login?role=voter" legacyBehavior>
            <a className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white shadow transition">
              Sign In to Vote
            </a>
          </Link>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12 space-y-16">
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          {/* Active Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Elections Active • Closes Today at 5:00 PM
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Cast Your Vote in the <br className="hidden sm:block" />{' '}
            <span className="text-purple-400">2026 General Election</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Your vote is secure, anonymous, and verified through cryptographic auditing. Authenticate with your voter ID to access your official digital ballot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/login?role=voter" legacyBehavior>
              <a className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/40 transition text-center">
                Authenticate & Vote Now →
              </a>
            </Link>
            <Link href="/observer/live-tally" legacyBehavior>
              <a className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition text-center">
                View Live Results
              </a>
            </Link>
          </div>
        </section>

        {/* METRICS & LIVE TALLY PREVIEW CARD */}
        <section className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/60 pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Election Overview</h2>
              <p className="text-sm text-slate-400">Real-time voting activity across all university precincts</p>
            </div>
            <Link href="/observer/live-tally" legacyBehavior>
              <a className="text-xs font-semibold text-purple-400 hover:underline">
                Open Full Observer Dashboard &rarr;
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Ballots Cast</span>
              <p className="text-2xl font-bold text-white mt-1">30,640</p>
              <span className="text-xs text-emerald-400 mt-1 inline-block">+142 in last 5 mins</span>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Turnout</span>
              <p className="text-2xl font-bold text-white mt-1">68.4%</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-500 h-full w-[68.4%]" />
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Integrity</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">100% Validated</p>
              <span className="text-xs text-slate-400 mt-1 inline-block">Zero discrepancies detected</span>
            </div>
          </div>
        </section>

        {/* 3-STEP INSTRUCTIONS */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">How Voting Works</h2>
            <p className="text-slate-400 text-sm">Three easy steps to complete your voter submission securely.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-xl space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-white text-lg">Authenticate</h3>
              <p class="text-slate-400 text-sm leading-relaxed">
                Sign in using your student/staff credentials or election token provided by your institution administrator.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-xl space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-white text-lg">Make Selections</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Review candidate profiles, read official policy statements, and select your preferred candidates for each office.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-xl space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-white text-lg">Verify & Submit</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Confirm your ballot selections and receive a unique cryptographic receipt to track and verify your vote.
              </p>
            </div>
          </div>
        </section>

        {/* HELP & SUPPORT BANNER */}
        <section className="bg-gradient-to-r from-purple-900/40 to-slate-800 border border-purple-500/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Need help casting your ballot?</h3>
            <p className="text-slate-300 text-sm">Our support staff is on standby to assist with voter eligibility or technical issues.</p>
          </div>
          <Link href="/contact-support" legacyBehavior>
            <a className="px-6 py-2.5 rounded-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 transition whitespace-nowrap text-sm">
              Contact Helpdesk
            </a>
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} E-Voting System. All rights reserved. Encrypted & Audited.</p>
      </footer>
    </div>
  );
}
