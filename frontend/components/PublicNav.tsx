import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <nav style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <Link href="/"><a>Home</a></Link>
      <Link href="/about"><a>About</a></Link>
      <Link href="/policies"><a>Policies</a></Link>
      <Link href="/terms"><a>Terms</a></Link>
      <Link href="/contact"><a>Contact</a></Link>

      <div style={{ marginLeft: 'auto', position: 'relative' }} ref={ref}>
        <button
          aria-label="Open login menu"
          onClick={() => setOpen((s) => !s)}
          style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}
        >
          ⋮
        </button>
        {open && (
          <div style={{ position: 'absolute', right: 0, top: '28px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 6px 12px rgba(0,0,0,0.08)', minWidth: 180 }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 8 }}>
              <li style={{ padding: '8px 10px' }}>
                <Link href={{ pathname: '/', query: { role: 'voter' } }}><a>Login as Voter</a></Link>
              </li>
              <li style={{ padding: '8px 10px' }}>
                <Link href={{ pathname: '/', query: { role: 'staff' } }}><a>Login as Staff</a></Link>
              </li>
              <li style={{ padding: '8px 10px' }}>
                <Link href={{ pathname: '/', query: { role: 'admin' } }}><a>Login as Admin</a></Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
