import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch, redirectUserByRole } from '../lib/api';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 12 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Use at least 12 characters, including upper/lowercase letters, a number, and a symbol.'); return;
    }
    if (newPassword !== confirmPassword) { setError('The new passwords do not match.'); return; }
    setSaving(true);
    try {
      const response = await apiFetch('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
      if (!response.ok) { setError(response.body?.error || 'Could not change password.'); return; }
      const me = await apiFetch('/auth/me');
      const role = me.body?.user?.role;
      if (typeof role === 'string') redirectUserByRole(role, router);
      else await router.replace('/login');
    } catch { setError('Could not connect to the password service. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="public-page login-page">
      <Head><title>Change password | Secure Electronic Voting System</title></Head>
      <Nav />
      <main className="login-main">
        <section className="login-intro"><span className="public-eyebrow">Account security</span><h1>Set a new password.</h1><p>Your temporary password can only be used to sign in and set a password you control.</p></section>
        <section className="login-card public-card">
          <span className="role-badge">Password update required</span>
          <h2>Change your password</h2>
          <form onSubmit={submit} className="public-form login-form">
            <div className="form-field">
              <label htmlFor="current-password">Temporary/current password</label>
              <div className="password-input-wrap">
                <input id="current-password" type={showCurrentPassword ? 'text' : 'password'} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
                <button className="password-visibility-toggle" type="button" onClick={() => setShowCurrentPassword((visible) => !visible)} aria-pressed={showCurrentPassword} aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}>{showCurrentPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="new-password">New password</label>
              <div className="password-input-wrap">
                <input id="new-password" type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                <button className="password-visibility-toggle" type="button" onClick={() => setShowNewPassword((visible) => !visible)} aria-pressed={showNewPassword} aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}>{showNewPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="confirm-password">Confirm new password</label>
              <div className="password-input-wrap">
                <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                <button className="password-visibility-toggle" type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-pressed={showConfirmPassword} aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            {error && <p className="form-message error-message" role="alert">{error}</p>}
            <button className="public-submit login-submit" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Set new password'}</button>
          </form>
          <p className="login-help">Can’t access the temporary password? <a href="/forgot-password">Request a password reset</a>.</p>
        </section>
      </main>
    </div>
  );
}
