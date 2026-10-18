import { useState } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

export default function StaffDashboard() {
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [message, setMessage] = useState('');

  const register = async (e: any) => {
    e.preventDefault();
    setMessage('');
    const res = await apiFetch('/staff/:universityId/voters', {
      method: 'POST',
      body: JSON.stringify({ firstName, secondName })
    });
    if (!res.ok) setMessage(res.body?.error || 'Failed');
    else setMessage('Registered (approval pending)');
  };

  return (
    <div className="container">
      <Nav />
      <h2>Staff Dashboard</h2>
      <p>Welcome, Staff — register voters and manage participant lists.</p>

      <section style={{ marginTop: 18 }}>
        <form onSubmit={register}>
          <label>First name</label>
          <input className="input" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <label>Second name</label>
          <input className="input" placeholder="Second name" value={secondName} onChange={(e) => setSecondName(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button type="submit">Register voter</button>
          </div>
        </form>

        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </section>

      <section style={{ marginTop: 28 }}>
        <h3>Staff Tools</h3>
        <ul>
          <li><Link href="/staff/import"><a>CSV Import</a></Link> — bulk-upload eligible voters</li>
          <li><Link href="/staff/list"><a>Voter list</a></Link> — view registered voters</li>
        </ul>
      </section>
    </div>
  );
}
