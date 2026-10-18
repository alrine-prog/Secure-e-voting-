import { useState } from 'react';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

export default function RegisterUniversityPage() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [districtCity, setDistrictCity] = useState('');

  // admin fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: any) => {
    e?.preventDefault();
    setMessage(null);

    if (!name || !country || !districtCity || !username || !firstName || !email || !password) {
      setMessage('Please fill all required fields (marked *).');
      setStatus('error');
      return;
    }

    setStatus('submitting');

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
      setMessage(res.body?.error || 'Registration failed');
      setStatus('error');
      return;
    }

    setMessage('Registration submitted — your university will be reviewed by the system owner.');
    setStatus('success');
    // clear form
    setName(''); setCountry(''); setDistrictCity('');
    setUsername(''); setFirstName(''); setSecondName(''); setEmail(''); setPhone(''); setPassword('');
  };

  return (
    <div className="container">
      <Nav />
      <h2>Register Your University</h2>
      <p>Fill this form to create a new university entry in the system. The initial university admin account will be created in pending state and activated once the system owner approves the university.</p>

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

        {message && (
          <p style={{ color: status === 'success' ? '#16a34a' : '#dc2626' }}>{message}</p>
        )}

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Submitting…' : 'Register University'}</button>
        </div>
      </form>

      <hr style={{ marginTop: 24 }} />

      <section style={{ marginTop: 8 }}>
        <h3>Contact & Support</h3>
        <p><strong>Email:</strong> <a href="mailto:albertjesocen@gmail.com">albertjesocen@gmail.com</a></p>
        <p><strong>Phone:</strong> +256 785 157 237 / +256 709 813 462</p>
        <p><strong>Location:</strong> Lira City, Ayago Trading Center</p>
        <p>
          <strong>WhatsApp:</strong>{' '}
          <a href="https://wa.me/256785157237" target="_blank" rel="noreferrer">Chat on WhatsApp (+256 785 157 237)</a>
        </p>
      </section>

      <footer style={{ marginTop: 28, color: '#6b7280', fontSize: 14 }}>
        <hr />
        <p>Secure-e-voting is the product of Alrine Technology — all rights reserved.</p>
      </footer>
    </div>
  );
}
