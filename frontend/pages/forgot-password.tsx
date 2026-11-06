import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage(''); setSending(true);
    try {
      const response = await apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      if (!response.ok) setError(response.body?.error || 'Could not request reset instructions.');
      else { sessionStorage.setItem('passwordResetEmail', email.trim().toLowerCase()); setMessage(response.body?.message || 'If that account exists, reset instructions will be emailed.'); }
    } catch { setError('Could not connect to the account service.'); }
    finally { setSending(false); }
  };
  return <div className="public-page login-page"><Head><title>Forgot password | Secure E-Voting</title></Head><Nav /><main className="login-main"><section className="login-intro"><span className="public-eyebrow">Account recovery</span><h1>Reset your password.</h1><p>We’ll email a one-time reset code if your account exists.</p></section><section className="login-card public-card"><h2>Forgot password?</h2><form onSubmit={submit} className="public-form login-form"><div className="form-field"><label htmlFor="reset-email">Account email</label><input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>{error && <p className="form-message error-message" role="alert">{error}</p>}{message && <p className="form-message" role="status">{message}</p>}<button className="public-submit login-submit" disabled={sending}>{sending ? 'Sending…' : 'Email reset code'}</button></form>{message && <button className="dashboard-button" style={{ marginTop: 16 }} onClick={() => router.push('/reset-password')}>Enter reset code</button>}<p className="login-help"><a href="/login">Return to sign in</a></p></section></main></div>;
}
