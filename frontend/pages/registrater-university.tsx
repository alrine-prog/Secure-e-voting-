// frontend/pages/register-university.tsx
import { useState } from 'react';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';
import Link from 'next/link';

export default function RegisterUniversity() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [districtCity, setDistrictCity] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!name || !country || !districtCity || !username || !firstName || !email || !password) {
      setError('Please fill the required fields.');
      return;
    }

    setSubmitting(true);
    try {
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
          password
        }
      };

      const res = await apiFetch('/universities/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        setError(res.body?.error || 'Registration failed');
      } else {
        setMsg('Registration submitted — your account will be active after system owner approval.');
        // optional: clear form
        setName('');
        setCountry('');
        setDistrictCity('');
        setUsername('');
        setFirstName('');
        setSecondName('');
        setEmail('');
        setPhone('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Nav />
      <h2>Register Your University</h2>
      <p>
        Register your institution and create an initial university administrator account. An administrator account
        will be created in pending state — a system owner must approve the university before it becomes active.
      </p>

      <form onSubmit={submit} style={{ marginTop: 18 }}>
        <label>University name *</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

        <label>Country *</label>
        <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} />

        <label>District / City *</label>
        <input className="input" value={districtCity} onChange={(e) => setDistrictCity(e.target.value)} />

        <hr style={{ margin: '18px 0' }} />

        <h3>Initial University Admin</h3>
        <label>Username *</label>
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>First name *</label>
        <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />

        <label>Second name</label>
        <input className="input" value={secondName} onChange={(e) => setSecondName(e.target.value)} />

        <label>Email *</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Phone</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>Password *</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {msg && <p style={{ color: '#16a34a' }}>{msg}</p>}

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Register University'}</button>
        </div>
      </form>

      <hr style={{ marginTop: 20 }} />
      <p>
        After registration, the System Owner will approve the university. To see pending registrations (system owner only), visit{' '}
        <Link href="/admin/universities/pending"><a>Pending Universities</a></Link>.
      </p>
    </div>
  );
                                                         }
