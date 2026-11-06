import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch, redirectUserByRole } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const role = useMemo(() => {
    const value = router.query.role;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized === 'admin') return 'uni_admin';
      if (['system_owner', 'uni_admin', 'staff', 'voter', 'observer'].includes(normalized)) return normalized;
    }
    return 'voter';
  }, [router.query.role]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roleLabels: Record<string, string> = { system_owner: 'System Owner', uni_admin: 'University Administrator', staff: 'Election Staff', voter: 'Voter', observer: 'Observer' };
  const roleLabel = roleLabels[role] || 'Voter';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErr('');
    setIsSubmitting(true);
    try {
      const response = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
      if (!response.ok) { setErr(response.body?.error || 'Login failed. Check your details and try again.'); return; }
      if (response.body?.user?.mustChangePassword) { await router.replace('/change-password'); return; }
      const userRole = response.body?.user?.role;
      if (typeof userRole !== 'string') { setErr('Login succeeded, but the account role could not be determined. Please contact support.'); return; }
      redirectUserByRole(userRole, router);
    } catch {
      setErr('Unable to connect to the sign-in service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="public-page login-page"><Head><title>Sign in | Secure E-Voting</title><meta name="description" content="Sign in to your Secure E-Voting account." /></Head><Nav />
    <main className="login-main"><section className="login-intro"><span className="public-eyebrow">Secure E-Voting portal</span><h1>Welcome back.</h1><p>Sign in to continue to your institution’s election workspace.</p><div className="login-assurance"><span aria-hidden="true">✓</span><span>Secure access for your role</span></div></section>
      <section className="login-card public-card"><span className="role-badge">{roleLabel} portal</span><h2>Sign in to your account</h2><p className="login-card-intro">Enter your account credentials below.</p>
        <form onSubmit={submit} className="public-form login-form"><div className="form-field"><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="form-field"><label htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          {err && <p className="form-message error-message" role="alert">{err}</p>}<button type="submit" className="public-submit login-submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : `Sign in as ${roleLabel}`} <span aria-hidden="true">→</span></button>
        </form><p className="login-help"><a href="/forgot-password">Forgot password?</a></p><p className="login-help">Need help accessing your account? <a href="/contact">Contact support</a>.</p>
      </section></main><footer className="public-footer"><span>Secure E-Voting</span><p>Secure E-Voting is the product of Alrine Technology. All rights reserved 2026.</p></footer></div>;
}
