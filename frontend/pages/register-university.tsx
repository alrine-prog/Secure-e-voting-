import { useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
declare global {
  interface Window {
    grecaptcha?: { ready: (callback: () => void) => void; execute: (siteKey: string, options: { action: string }) => Promise<string> };
  }
}
const inputStyle = { width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box' as const, border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' };

export default function RegisterUniversityPage() {
  const [universityName, setUniversityName] = useState('');
  const [country, setCountry] = useState('');
  const [districtCity, setDistrictCity] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!universityName.trim() || !country.trim() || !districtCity.trim() || !username.trim() || !firstName.trim() || !email.trim() || !password || !photo) {
      setStatus('error'); setMessage('Complete all required fields and choose an administrator photo.'); return;
    }
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username.trim())) { setStatus('error'); setMessage('Username must be 3–30 letters, numbers, dots, underscores, or hyphens.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 5 * 1024 * 1024) { setStatus('error'); setMessage('Photo must be JPEG, PNG, or WebP and no larger than 5 MB.'); return; }

    setStatus('submitting');
    let recaptchaToken = '';
    if (SITE_KEY && window.grecaptcha) {
      try { recaptchaToken = await window.grecaptcha.execute(SITE_KEY, { action: 'register_university' }); }
      catch { setStatus('error'); setMessage('Could not verify the registration request. Try again.'); return; }
    }

    const form = new FormData();
    form.append('name', universityName.trim());
    form.append('country', country.trim());
    form.append('districtCity', districtCity.trim());
    form.append('admin[username]', username.trim());
    form.append('admin[firstName]', firstName.trim());
    form.append('admin[secondName]', secondName.trim());
    form.append('admin[email]', email.trim());
    form.append('admin[phone]', phone.trim());
    form.append('admin[password]', password);
    form.append('adminPhoto', photo);
    if (recaptchaToken) form.append('recaptchaToken', recaptchaToken);

    try {
      const response = await apiFetch('/universities/register', { method: 'POST', body: form });
      if (!response.ok) { setStatus('error'); setMessage(response.body?.error || 'Registration failed.'); return; }
      setStatus('success');
      setMessage('Registration submitted. The university administrator account will be activated after university approval.');
      setUniversityName(''); setCountry(''); setDistrictCity(''); setUsername(''); setFirstName(''); setSecondName(''); setEmail(''); setPhone(''); setPassword(''); setPhoto(null);
    } catch { setStatus('error'); setMessage('Could not connect to the registration service.'); }
  };

  return <><Head><title>Register university | Secure E-Voting</title>{SITE_KEY && <script src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`} async defer />}</Head><Nav />
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '1rem 1.25rem 2.5rem' }}>
      <h1>Register your university</h1><p>Enter the institution details and initial university administrator information. The administrator is activated when the university is approved.</p>
      <form onSubmit={submit} className="public-form" style={{ display: 'grid', gap: 14 }}>
        <h2>Organization information</h2>
        <label>Organization / university name *<input style={inputStyle} value={universityName} onChange={(e) => setUniversityName(e.target.value)} required /></label>
        <label>Country *<input style={inputStyle} value={country} onChange={(e) => setCountry(e.target.value)} required /></label>
        <label>District / city *<input style={inputStyle} value={districtCity} onChange={(e) => setDistrictCity(e.target.value)} required /></label>
        <h2>University administrator</h2>
        <label>Username *<input style={inputStyle} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={30} /></label>
        <label>First name *<input style={inputStyle} autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></label>
        <label>Surname<input style={inputStyle} autoComplete="family-name" value={secondName} onChange={(e) => setSecondName(e.target.value)} /></label>
        <label>Email *<input style={inputStyle} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Phone<input style={inputStyle} type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <label>Password (at least 12 characters) *<input style={inputStyle} type="password" autoComplete="new-password" minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <label>Administrator profile photo (JPEG, PNG, WebP; up to 5 MB) *<input style={inputStyle} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] || null)} required /></label>
        {message && <p role="status" className={status === 'error' ? 'form-message error-message' : 'form-message'}>{message}</p>}
        <button type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Submitting…' : 'Register university'}</button>
      </form>
    </main></>;
}
