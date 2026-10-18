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
    <nav className="top-nav">
      <div className="nav-links">
        <Link href="/"><a>Home</a></Link>
        <Link href="/about"><a>About</a></Link>
        <Link href="/policies"><a>Policies</a></Link>
        <Link href="/terms"><a>Terms</a></Link>
        <Link href="/contact"><a>Contact</a></Link>
      </div>

      <div className="menu-wrap" ref={menuRef}>
        <button type="button" className="menu-button" onClick={() => setOpen((prev) => !prev)} aria-label="Open login menu">
          ⋯
        </button>

        {open && (
          <div className="login-menu">
            <Link href="/login?role=voter"><a>Login as Voter</a></Link>
            <Link href="/login?role=admin"><a>Login as Admin</a></Link>
            <Link href="/login?role=staff"><a>Login as Staff</a></Link>
          </div>
        )}
      </div>
    </nav>
  );
}
/**
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
    <nav className="top-nav">
      <div className="nav-links">
        <Link href="/"><a>Home</a></Link>
        <Link href="/about"><a>About</a></Link>
        <Link href="/policies"><a>Policies</a></Link>
        <Link href="/terms"><a>Terms</a></Link>
        <Link href="/register-university"><a>Register University</a></Link>
        <Link href="/contact"><a>Contact</a></Link>
      </div>

      <div className="menu-wrap" ref={menuRef}>
        <button type="button" className="menu-button" onClick={() => setOpen((prev) => !prev)} aria-label="Open login menu">
          ⋯
        </button>

        {open && (
          <div className="login-menu">
            <Link href="/login?role=voter"><a>Login as Voter</a></Link>
            <Link href="/login?role=admin"><a>Login as Admin</a></Link>
            <Link href="/login?role=staff"><a>Login as Staff</a></Link>
          </div>
        )}
      </div>
    </nav>
  );
}
**/
