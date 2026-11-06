import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface NavProps {
  userRole?: 'system_owner' | 'uni_admin' | 'university_admin' | 'staff' | 'voter' | 'observer' | null;
}

export default function Nav({ userRole }: NavProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const isUniversityAdmin = userRole === 'uni_admin' || userRole === 'university_admin';

  return (
    <nav className="top-nav flex items-center justify-between w-full relative px-6 py-4 bg-slate-900 text-white" aria-label="Main navigation">
      <div className="nav-links flex items-center gap-6">
        <Link href="/" className="nav-brand" aria-label="Secure E-Voting home"><span className="nav-brand-mark" aria-hidden="true">✓</span><span>Secure<span className="nav-brand-accent">Vote</span></span></Link>
        <Link href="/">Home</Link><Link href="/about">About us</Link><Link href="/policies">Policies</Link><Link href="/contact">Support</Link>
      </div>
      <div className="menu-wrap relative flex items-center gap-4 ml-auto" ref={menuRef}>
        {userRole === 'system_owner' && <Link href="/admin/university/pending" className="text-yellow-400 font-medium">University approvals</Link>}
        {isUniversityAdmin && <><Link href="/admin" className="text-blue-400 font-medium">Admin dashboard</Link><Link href="/admin/candidates" className="text-blue-300 font-medium">Candidates &amp; positions</Link></>}
        {userRole === 'staff' && <Link href="/staff" className="text-green-400 font-medium">Staff dashboard</Link>}
        {userRole === 'voter' && <Link href="/voter" className="text-purple-400 font-medium">Voter portal</Link>}
        {userRole === 'observer' && <Link href="/observer/dashboard" className="text-orange-400 font-medium">Observer dashboard</Link>}
        <button type="button" className="menu-button px-3 py-1 border rounded hover:bg-slate-800 focus:outline-none" onClick={() => setOpen((prev) => !prev)} aria-label="Open sign-in and registration menu" aria-expanded={open}>☰</button>
        {open && <div className="login-menu absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 border rounded shadow-lg flex flex-col py-2 z-50" role="menu">
          <span className="px-4 py-1 text-xs text-gray-400 font-bold uppercase tracking-wider">Sign in to your account</span>
          <Link href="/login?role=system_owner" role="menuitem" onClick={() => setOpen(false)}>System owner</Link>
          <Link href="/login?role=uni_admin" role="menuitem" onClick={() => setOpen(false)}>University administrator</Link>
          <Link href="/login?role=staff" role="menuitem" onClick={() => setOpen(false)}>Election staff</Link>
          <Link href="/login?role=voter" role="menuitem" onClick={() => setOpen(false)}>Voter</Link>
          <Link href="/login?role=observer" role="menuitem" onClick={() => setOpen(false)}>Observer</Link>
          <Link href="/register-university" role="menuitem" className="nav-register-link" onClick={() => setOpen(false)}>Register your university</Link>
        </div>}
      </div>
    </nav>
  );
}
