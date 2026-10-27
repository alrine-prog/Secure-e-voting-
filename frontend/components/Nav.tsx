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
      {/* LEFT SIDE: Brand & Links */}
      <div className="nav-links flex items-center gap-6">
        <Link href="/" className="font-bold text-lg">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/policies">Policies</Link>
      </div>

      {/* RIGHT SIDE: Pinned to Top Right */}
      <div className="menu-wrap relative flex items-center gap-4 ml-auto" ref={menuRef}>
        {/* Role-Specific Shortcuts (Visible when logged in) */}
        {userRole === 'system_owner' && (
          <Link href="/system-owner/universities" className="text-yellow-400 font-medium">Approve Universities</Link>
        )}
        {userRole === 'uni_admin' && (
          <Link href="/admin/dashboard" className="text-blue-400 font-medium">Admin Dashboard</Link>
        )}
        {userRole === 'staff' && (
          <Link href="/staff/register-voter" className="text-green-400 font-medium">Register Voters</Link>
        )}
        {userRole === 'voter' && (
          <Link href="/voter/ballot" className="text-purple-400 font-medium">Cast Vote</Link>
        )}
        {userRole === 'observer' && (
          <Link href="/observer/live-tally" className="text-orange-400 font-medium">Live Tally</Link>
        )}

        {/* Top-Right Button */}
        <button
          type="button"
          className="menu-button px-3 py-1 border rounded hover:bg-slate-800 focus:outline-none"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open portal menu"
        >
          ⋯
        </button>

        {/* Dropdown Aligned to Right Edge */}
        {open && (
          <div className="login-menu absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 border rounded shadow-lg flex flex-col py-2 z-50">
            <span className="px-4 py-1 text-xs text-gray-400 font-bold uppercase tracking-wider">Select Role Login</span>
            <Link href="/login?role=system_owner" className="px-4 py-2 hover:bg-gray-100 text-sm">System Owner</Link>
            <Link href="/login?role=uni_admin" className="px-4 py-2 hover:bg-gray-100 text-sm">University Admin</Link>
            <Link href="/login?role=staff" className="px-4 py-2 hover:bg-gray-100 text-sm">Staff</Link>
            <Link href="/login?role=voter" className="px-4 py-2 hover:bg-gray-100 text-sm">Voter</Link>
            <Link href="/login?role=observer" className="px-4 py-2 hover:bg-gray-100 text-sm">Observer</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
