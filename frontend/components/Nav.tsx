import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface NavProps {
  userRole?: 'system_owner' | 'uni_admin' | 'university_admin' | 'staff' | 'voter' | 'observer' | null;
}

export default function Nav({ userRole }: NavProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isUniversityAdmin = userRole === 'uni_admin' || userRole === 'university_admin';

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="top-nav" aria-label="Main navigation">
      <div className="nav-links">
        <Link href="/" className="nav-brand" aria-label="Secure E-Voting home" onClick={closeMenu}>
          <span className="nav-brand-mark" aria-hidden="true">✓</span>
          <span>Secure<span className="nav-brand-accent"> E-Voting</span></span>
        </Link>
        <Link href="/" onClick={closeMenu}>Home</Link>
        <Link href="/about" onClick={closeMenu}>About</Link>
        <Link href="/policies" onClick={closeMenu}>Policies</Link>
        <Link href="/contact" onClick={closeMenu}>Support</Link>
      </div>

      <div className="menu-wrap" ref={menuRef}>
        {userRole === 'system_owner' && <Link href="/admin/university/pending" className="nav-role-link" onClick={closeMenu}>University approvals</Link>}
        {isUniversityAdmin && <Link href="/admin" className="nav-role-link" onClick={closeMenu}>Admin dashboard</Link>}
        {userRole === 'staff' && <Link href="/staff" className="nav-role-link" onClick={closeMenu}>Staff dashboard</Link>}
        {userRole === 'voter' && <Link href="/voter" className="nav-role-link" onClick={closeMenu}>Voter portal</Link>}
        {userRole === 'observer' && <Link href="/observer/dashboard" className="nav-role-link" onClick={closeMenu}>Observer dashboard</Link>}
        <button
          type="button"
          className="menu-button"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={open ? 'Close account menu' : 'Open account menu'}
          aria-expanded={open}
          aria-controls="account-dropdown"
          aria-haspopup="menu"
        >
          <span aria-hidden="true">•••</span>
        </button>
        {open && <div className="login-menu" id="account-dropdown" role="menu" aria-label="Account options">
          <span className="login-menu-heading">Sign in to your account</span>
          <Link href="/login?role=system_owner" role="menuitem" onClick={closeMenu}>System owner</Link>
          <Link href="/login?role=uni_admin" role="menuitem" onClick={closeMenu}>University administrator</Link>
          <Link href="/login?role=staff" role="menuitem" onClick={closeMenu}>Election staff</Link>
          <Link href="/login?role=voter" role="menuitem" onClick={closeMenu}>Voter</Link>
          <Link href="/login?role=observer" role="menuitem" onClick={closeMenu}>Observer</Link>
          <Link href="/register-university" role="menuitem" className="nav-register-link" onClick={closeMenu}>Register your university</Link>
        </div>}
      </div>
    </nav>
  );
}
