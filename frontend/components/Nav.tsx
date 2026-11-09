import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface NavProps {
  userRole?: 'system_owner' | 'uni_admin' | 'university_admin' | 'staff' | 'voter' | 'observer' | null;
}

type Identity = { username?: string; firstName?: string; secondName?: string; photoUrl?: string | null; organizationName?: string | null; role?: string };
const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function Nav({ userRole }: NavProps) {
  const [open, setOpen] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [uploading, setUploading] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const photoInput = useRef<HTMLInputElement | null>(null);
  const isUniversityAdmin = userRole === 'uni_admin' || userRole === 'university_admin';

  useEffect(() => {
    if (!userRole) return;
    apiFetch('/auth/me').then((response) => {
      if (response.ok && response.body?.user) setIdentity(response.body.user as Identity);
    }).catch(() => undefined);
  }, [userRole]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      window.alert('Choose a JPEG, PNG, or WebP image up to 5 MB.');
      return;
    }
    const formData = new FormData();
    formData.append('photo', file);
    setUploading(true);
    try {
      const response = await apiFetch('/auth/profile/photo', { method: 'POST', body: formData });
      if (!response.ok) { window.alert(response.body?.error || 'Could not update profile photo.'); return; }
      setIdentity((current) => current ? { ...current, photoUrl: response.body.photoUrl } : current);
    } catch { window.alert('Could not connect to update your profile photo.'); }
    finally { setUploading(false); }
  };

  const closeMenu = () => setOpen(false);
  const displayName = [identity?.firstName, identity?.secondName].filter(Boolean).join(' ') || identity?.username || 'Account';
  const photoSrc = identity?.photoUrl ? `${apiBase}${identity.photoUrl}` : '';
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <nav className="top-nav" aria-label="Main navigation">
      <div className="nav-links">
        <Link href="/" className="nav-brand" aria-label="Secure E-Voting home" onClick={closeMenu}><span className="nav-brand-mark" aria-hidden="true">✓</span><span>Secure<span className="nav-brand-accent"> E-Voting</span></span></Link>
        <Link href="/" onClick={closeMenu}>Home</Link><Link href="/about" onClick={closeMenu}>About</Link><Link href="/policies" onClick={closeMenu}>Policies</Link><Link href="/contact" onClick={closeMenu}>Support</Link>
      </div>
      <div className="menu-wrap relative flex items-center gap-4 ml-auto" ref={menuRef}>
        {userRole === 'system_owner' && <Link href="/admin/university/pending" className="text-yellow-400 font-medium">University approvals</Link>}
        {isUniversityAdmin && <><Link href="/admin" className="text-blue-400 font-medium">Admin dashboard</Link><Link href="/admin/candidates" className="text-blue-300 font-medium">Candidates &amp; results</Link></>}
        {userRole === 'staff' && <Link href="/staff" className="text-green-400 font-medium">Staff dashboard</Link>}
        {userRole === 'voter' && <Link href="/voter" className="text-purple-400 font-medium">Voter portal</Link>}
        {userRole === 'observer' && <Link href="/observer/dashboard" className="text-orange-400 font-medium">Observer dashboard</Link>}
        {userRole && identity && <div style={{ display: 'flex', alignItems: 'center', gap: 9, maxWidth: 250 }}>
          {photoSrc ? <img src={photoSrc} alt={`${displayName} profile`} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: '50%' }} /> : <span aria-label="Profile photo placeholder" style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#e9e7fb', color: '#5142cd', fontWeight: 700 }}>{initial}</span>}
          <span style={{ display: 'grid', lineHeight: 1.25 }}><strong style={{ fontSize: 12 }}>{identity.username ? `@${identity.username}` : displayName}</strong><small style={{ fontSize: 10 }}>{identity.organizationName || displayName}</small><button type="button" onClick={() => photoInput.current?.click()} disabled={uploading} style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 10, color: '#6654e8' }}>{uploading ? 'Uploading…' : 'Change photo'}</button></span>
          <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} style={{ display: 'none' }} aria-label="Upload profile photo" />
        </div>}
        <button type="button" className="menu-button px-3 py-1 border rounded hover:bg-slate-800 focus:outline-none" onClick={() => setOpen((prev) => !prev)} aria-label="Open sign-in and registration menu" aria-expanded={open}>☰</button>
        {open && <div className="login-menu absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 border rounded shadow-lg flex flex-col py-2 z-50" role="menu">
          <span className="px-4 py-1 text-xs text-gray-400 font-bold uppercase tracking-wider">Sign in to your account</span>
          <Link href="/login?role=system_owner" role="menuitem" onClick={closeMenu}>System owner</Link><Link href="/login?role=uni_admin" role="menuitem" onClick={closeMenu}>University administrator</Link><Link href="/login?role=staff" role="menuitem" onClick={closeMenu}>Election staff</Link><Link href="/login?role=voter" role="menuitem" onClick={closeMenu}>Voter</Link><Link href="/login?role=observer" role="menuitem" onClick={closeMenu}>Observer</Link><Link href="/register-university" role="menuitem" className="nav-register-link" onClick={closeMenu}>Register your university</Link>
        </div>}
      </div>
    </nav>
  );
}
