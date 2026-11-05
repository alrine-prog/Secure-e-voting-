import { useRouter } from 'next/router';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { redirectUserByRole } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();

  const role = useMemo(() => {
    const value = router.query.role;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized === 'admin') return 'uni_admin';
      if (normalized === 'system_owner') return 'system_owner';
      if (normalized === 'uni_admin') return 'uni_admin';
      if (normalized === 'staff') return 'staff';
      if (normalized === 'voter') return 'voter';
      if (normalized === 'observer') return 'observer';
    }
    return 'voter';
  }, [router.query.role]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const roleLabel = {
    system_owner: 'System Owner',
    uni_admin: 'University Admin',
    staff: 'Staff',
    voter: 'Voter',
    observer: 'Observer',
  }[role] || 'Voter';

  useEffect(() => {
    if (role === 'system_owner') setEmail('systemowner@securevoting.test');
    else if (role === 'uni_admin') setEmail('admin@securevoting.test');
    else if (role === 'staff') setEmail('staff@securevoting.test');
    else if (role === 'observer') setEmail('observer@securevoting.test');
    else setEmail('voter@securevoting.test');
  }, [role]);

  const submit = async (e: any) => {
    e.preventDefault();
    setErr('');

    const resp = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      setErr(data?.error || 'Login failed');
      return;
    }

    const userRole = data?.user?.role || role;
    redirectUserByRole(userRole, router);
  };

  return (
    <div className="page-shell">
      <nav className="top-nav">
        <div className="nav-links">
          <Link href="/"><a>Home</a></Link>
          <Link href="/about"><a>About</a></Link>
          <Link href="/policies"><a>Policies</a></Link>
          <Link href="/terms"><a>Terms</a></Link>
          <Link href="/contact"><a>Contact</a></Link>
        </div>
        <div className="menu-wrap">
          <Link href="/login?role=voter"><a className="menu-button">⋯</a></Link>
        </div>
      </nav>

      <main className="content-card auth-card">
        <div className="auth-header">
          <span className="eyebrow">{roleLabel} Portal</span>
          <h1>Welcome back</h1>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label>Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {err && <small className="error">{err}</small>}

          <button type="submit" className="primary-btn full-width">Login as {roleLabel}</button>
        </form>
      </main>
    </div>
  );
}
