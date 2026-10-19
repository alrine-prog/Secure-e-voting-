import { useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Global type declaration for Google reCAPTCHA v3
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

  // Admin fields
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

    // Generate reCAPTCHA v3 token if script and key exist
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
        const resData = res.body || await res.json().catch(() => ({}));
        setMessage(resData?.error || 'Registration failed');
        setStatus('error');
        return;
      }

      setMessage('Registration submitted — your university will be reviewed by the system owner.');
      setStatus('success');

      // Reset form state
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
    <div className="container">
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
      <h2>Register Your University</h2>
      <p>
        Fill this form to create a new university entry in the system. The initial university admin account will be
        created in a pending state and activated once the system owner approves the university.
      </p>

      <form onSubmit={submit} style={{ marginTop: 18 }}>
        <label htmlFor="uni-name">University name *</label>
        <input
          id="uni-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="uni-country">Country *</label>
        <input
          id="uni-country"
          className="input"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />

        <label htmlFor="uni-district">District / City *</label>
        <input
          id="uni-district"
          className="input"
          value={districtCity}
          onChange={(e) => setDistrictCity(e.target.value)}
          required
        />

        <hr style={{ margin: '18px 0' }} />

        <h3>Initial University Admin</h3>

        <label htmlFor="admin-username">Username *</label>
        <input
          id="admin-username"
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="admin-firstname">First name *</label>
        <input
          id="admin-firstname"
          className="input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label htmlFor="admin-secondname">Second name</label>
        <input
          id="admin-secondname"
          className="input"
          value={secondName}
          onChange={(e) => setSecondName(e.target.value)}
        />

        <label htmlFor="admin-email">Email *</label>
        <input
          id="admin-email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="admin-phone">Phone</label>
        <input
          id="admin-phone"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label htmlFor="admin-password">Password *</label>
        <input
          id="admin-password"
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {message && (
          <p style={{ color: status === 'success' ? '#16a34a' : '#dc2626', marginTop: 12 }}>
            {message}
          </p>
        )}

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting…' : 'Register University'}
          </button>
        </div>
      </form>

      <hr style={{ marginTop: 24 }} />

      <section style={{ marginTop: 8 }}>
        <h3>Contact & Support</h3>
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
      </section>

      <footer style={{ marginTop: 28, color: '#6b7280', fontSize: 14 }}>
        <hr />
        <p>Secure-e-voting is the product of Alrine Technology — all rights reserved.</p>
      </footer>
    </div>
  );
}
