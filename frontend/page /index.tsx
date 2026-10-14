import { useState } from 'react';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  const submit = async (e: any) => {
    e.preventDefault();
    setErr('');
    const resp = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (!resp.ok) {
      setErr(resp.body?.error || 'Login failed');
      return;
    }
    const user = resp.body?.user;
    if (user?.role === 'system_owner' || user?.role === 'university_admin') router.push('/admin');
    else if (user?.role === 'staff') router.push('/staff');
    else router.push('/voter');
  };

  return (
    <div className="container">
      <Nav />
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <small className="error">{err}</small>}
        <div style={{ marginTop: 8 }}>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}
