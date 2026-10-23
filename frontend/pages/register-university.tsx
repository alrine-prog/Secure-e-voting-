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
    <>
      <Head>
        <title>Register University - Secure-e-voting</title>
        {SITE_KEY && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
            async
            defer
          />
        )}
      </Head>

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
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

          <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <h3 style={{ gridColumn: '1 / -1', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Initial University Admin</h3>

            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="admin-username">Username *</label>
              <input
                id="admin-username"
                className="input"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="admin-firstname">First name *</label>
              <input
                id="admin-firstname"
                className="input"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="admin-secondname">Second name</label>
              <input
                id="admin-secondname"
                className="input"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="admin-email">Email *</label>
              <input
                id="admin-email"
                className="input"
                type="email"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="admin-phone">Phone</label>
              <input
                id="admin-phone"
                className="input"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="admin-password">Password *</label>
              <input
                id="admin-password"
                className="input"
                type="password"
                style={{ width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {message && (
            <p style={{ color: status === 'success' ? '#16a34a' : '#dc2626', marginTop: '0.5rem', fontWeight: 500 }}>
              {message}
            </p>
          )}

          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" disabled={status === 'submitting'} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
              {status === 'submitting' ? 'Submitting…' : 'Register University'}
            </button>
          </div>
        </form>

        <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '2rem 0 1rem' }} />

        <section style={{ marginTop: '0.5rem' }}>
          <h3>Contact & Support</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <p>
              <strong>Email:</strong> <a href="mailto:albertjesocen@gmail.com">albertjesocen@gmail.com</a>
            </p>
            <p>
              <strong>Phone:</strong> +256 785 157 237 / +256 709 813 462
            </p>
            <p>
              <strong>Location:</strong> Lira City, Ayago Trading Center
            </p>
            <p>
              <strong>WhatsApp:</strong>{' '}
              <a href="https://wa.me/256785157237" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp (+256 785 157 237)
              </a>
            </p>
          </div>
        </section>

        <footer style={{ marginTop: '2rem', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>
          <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', marginBottom: '1rem' }} />
          <p>Secure-e-voting is the product of Alrine Technology — all rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
