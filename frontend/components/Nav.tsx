import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function Nav() {
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
    /* Flexbox layout pushing links to the left and menu wrap to the far right */
    <nav className="top-nav flex items-center justify-between w-full relative px-4 py-2">
      <div className="nav-links flex gap-4">
        {/* Note: Next.js 13+ no longer requires <a> tag inside <Link> */}
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/policies">Policies</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
      </div>

      {/* Positioned at top right relative to nav */}
      <div className="menu-wrap relative" ref={menuRef}>
        <button 
          type="button" 
          className="menu-button" 
          onClick={() => setOpen((prev) => !prev)} 
          aria-label="Open login menu"
        >
          ⋯
        </button>

        {open && (
          <div className="login-menu absolute right-0 mt-2 bg-white border rounded shadow-md flex flex-col p-2 z-50">
            <Link href="/login?role=voter">Login as Voter</Link>
            <Link href="/login?role=admin">Login as Admin</Link>
            <Link href="/login?role=staff">Login as Staff</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
