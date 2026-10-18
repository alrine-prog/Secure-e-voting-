import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

export default function AdminGeneralPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const res = await apiFetch('/auth/me');
      if (res.ok) setUser(res.body?.user || null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container"><Nav /><p>Loading...</p></div>;
  if (!user) return <div className="container"><Nav /><p>Please sign in as staff.</p></div>;

  const universityId = user.universityId;

  const registerVoter = async (e: any) => {
    e.preventDefault();
    setMessage('');
    const res = await apiFetch(`/staff/${universityId}/voters`, {
      method: 'POST',
      body: JSON.stringify({ firstName, secondName: lastName })
    });
    if (!res.ok) setMessage(res.body?.error || 'Registration failed');
    else {
      setMessage('Voter registered (pending approval)');
      setFirstName('');
      setLastName('');
    }
  };

  const uploadCsv = async (e: any) => {
    e.preventDefault();
    if (!csvFile) {
      setMessage('Pick a CSV file first');
      return;
    }
    setMessage('');
    const fd = new FormData();
    fd.append('file', csvFile);
    // apiFetch helper doesn't support multipart — use fetch directly
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';
    const resp = await fetch(`${apiBase}/staff/${universityId}/voters/upload`, {
      method: 'POST',
      credentials: 'include',
      body: fd
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) setMessage(data?.error || 'CSV upload failed');
    else setMessage(`CSV processed: ${data?.count || 'unknown'} rows`);
  };

  return (
    <div className="container">
      <Nav />
      <h2>Staff Console</h2>
      <p>Welcome, {user.email}. Register voters for your institution here.</p>

      <section style={{ marginTop: 18 }}>
        <form onSubmit={registerVoter}>
          <label>First name</label>
          <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <label>Second/Last name</label>
          <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button type="submit">Register Voter</button>
          </div>
        </form>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </section>

      <section style={{ marginTop: 28 }}>
        <h3>CSV Upload</h3>
        <p>Upload a CSV with columns: firstName,secondName,email,phone,...</p>
        <form onSubmit={uploadCsv}>
          <input type="file" accept=".csv,text/csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
          <div style={{ marginTop: 8 }}>
            <button type="submit">Upload CSV</button>
          </div>
        </form>
      </section>
    </div>
  );
          }
