import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface NavProps {
  userRole?: 'system_owner' | 'uni_admin' | 'staff' | 'voter' | 'observer' | null;
}

export default function Nav({ userRole }: NavProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <nav className="top-nav flex items-center justify-between w-full relative px-6 py-4 bg-slate-900 text-white">
      {/* Brand / Home Link */}
      <div className="nav-links flex items-center gap-6">
        <Link href="/" className="font-bold text-lg">Voting System</Link>
        <Link href="/about">About</Link>
        <Link href="/policies">Policies</Link>
      </div>

      {/* Role-Specific Links & Login Menu */}
      <div className="menu-wrap relative flex items-center gap-4" ref={menuRef}>
        {/* Dynamic Nav Links Based on Role */}
        {userRole === 'system_owner' && (
          <Link href="/system-owner/universities" className="text-yellow-400">Approve Universities</Link>
        )}
        {userRole === 'uni_admin' && (
          <Link href="/admin/dashboard" className="text-blue-400">Admin Dashboard</Link>
        )}
        {userRole === 'staff' && (
          <Link href="/staff/register-voter" className="text-green-400">Register Voters</Link>
        )}
        {userRole === 'voter' && (
          <Link href="/voter/ballot" className="text-purple-400">Cast Vote</Link>
        )}
        {userRole === 'observer' && (
          <Link href="/observer/live-tally" className="text-orange-400">Live Tally</Link>
        )}

        {/* Action Button */}
        <button
          type="button"
          className="menu-button px-3 py-1 border rounded hover:bg-slate-800"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open menu"
        >
          ⋯
        </button>

        {/* Login Role Links Dropdown */}
        {open && (
          <div className="login-menu absolute right-0 top-10 w-48 bg-white text-gray-800 border rounded shadow-lg flex flex-col py-2 z-50">
            <span className="px-4 py-1 text-xs text-gray-400 font-bold uppercase">Quick Login</span>
            <Link href="/login?role=system_owner" className="px-4 py-2 hover:bg-gray-100">System Owner</Link>
            <Link href="/login?role=uni_admin" className="px-4 py-2 hover:bg-gray-100">University Admin</Link>
            <Link href="/login?role=staff" className="px-4 py-2 hover:bg-gray-100">Staff</Link>
            <Link href="/login?role=voter" className="px-4 py-2 hover:bg-gray-100">Voter</Link>
            <Link href="/login?role=observer" className="px-4 py-2 hover:bg-gray-100">Observer</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
