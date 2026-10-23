import { useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function RegisterUniversityPage() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [districtCity, setDistrictCity] = useState('');

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || !country.trim() || !districtCity.trim() || !username.trim() || !firstName.trim() || !email.trim() || !password) {
      setMessage('Please fill all required fields (marked *).');
      setStatus('error');
      return;
    }

    setStatus('submitting');

    let recaptchaToken: string | undefined = undefined;
    if (SITE_KEY && window.grecaptcha) {
      try {
        recaptchaToken = await window.grecaptcha.execute(SITE_KEY, { action: 'register_university' });
      } catch (err) {
        console.error('reCAPTCHA execution failed:', err);
      }
    }

    const payload = {
      name,
      country,
      districtCity,
      admin: {
        username,
        firstName,
        secondName,
        email,
        phone,
        password,
      },
      recaptchaToken,
    };

    try {
      const res = await apiFetch('/universities/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setMessage(res.body?.error || 'Registration failed');
        setStatus('error');
        return;
      }

      setMessage('Registration submitted — your university will be reviewed by the system owner.');
      setStatus('success');

      setName('');
      setCountry('');
      setDistrictCity('');
      setUsername('');
      setFirstName('');
      setSecondName('');
      setEmail('');
      setPhone('');
      setPassword('');
    } catch (err) {
      setMessage('An error occurred during registration. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      <Head>
        <title>Register University - Secure-e-voting</title>
        {SITE_KEY ? (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
            async
            defer
          />
        ) : null}
      </Head>
    </div>

      <Nav />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1.25rem 2.5rem', width: '100%', boxSizing: 'border-box' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Register Your University</h2>
          <p style={{ lineHeight: '1.5', color: '#4b5563' }}>
            Fill this form to create a new university entry in the system. The initial university admin account will be
            created in a pending state and activated once the system owner approves the university.
          </p>
        </header>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="uni-name">University name *</label>
              <input
                id="uni-name"
                className="input"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="uni-country">Country *</label>
              <input
                id="uni-country"
                className="input"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="uni-district">District / City *</label>
              <input
                id="uni-district"
                className="input"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={districtCity}
                onChange={(e) => setDistrictCity(e.target.value)}
                required
              />
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '1
