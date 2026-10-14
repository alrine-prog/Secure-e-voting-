import { useState } from 'react';
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
      <p>Register a voter</p>
      <form onSubmit={register}>
        <input className="input" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input className="input" placeholder="Second name" value={secondName} onChange={(e) => setSecondName(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
      <hr />
      <p>CSV import is available in the admin UI (upload a CSV file with columns: firstName,secondName,email,phone,...)</p>
    </div>
  );
}
