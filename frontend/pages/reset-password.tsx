import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const queryEmail = typeof router.query.email === 'string' ? router.query.email : '';
    const queryToken = typeof router.query.token === 'string' ? router.query.token : '';
    setEmail(queryEmail);
    setToken(queryToken);
  }, [router.query.email, router.query.token]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!token || !email) {
      setError('This reset link is invalid or expired. Request a new one.');
      return;
    }
    if (newPassword.length < 12 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Use at least 12 characters, including upper/lowercase letters, a number, and a symbol.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, newPassword })
      });
      if (!response.ok) {
        setError(response.body?.error || 'Could not reset password.');
        return;
      }
      setMessage('Password updated. Redirecting to sign in…');
      window.setTimeout(() => { void router.replace('/login'); }, 900);
    } catch {
      setError('Could not connect to the account service.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="public-page login-page">
      <Head><title>Reset password | Secure E-Voting</title></Head>
      <Nav />
      <main className="login-main">
        <section className="login-intro">
          <span className="public-eyebrow">Account security</span>
          <h1>Set a new password.</h1>
          <p>Your reset link expires after 10 minutes.</p>
        </section>
        <section className="login-card public-card">
          <h2>Reset your password</h2>
          <form onSubmit={submit} className="public-form login-form">
            <div className="form-field">
              <label htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="confirm-password">Confirm new password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>
            {error && <p className="form-message error-message" role="alert">{error}</p>}
            {message && <p className="form-message" role="status">{message}</p>}
            <button className="public-submit login-submit" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
