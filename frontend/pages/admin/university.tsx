import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

export default function UniversityAdminPage() {
  const [user, setUser] = useState<any | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [staffEmail, setStaffEmail] = useState('');
  const [electionTitle, setElectionTitle] = useState('');
  const [electionStart, setElectionStart] = useState('');
  const [electionEnd, setElectionEnd] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const me = await apiFetch('/auth/me');
      if (me.ok) {
        setUser(me.body.user);
        const uid = me.body.user.universityId;
        // Attempt to fetch pending voters (server endpoint may need to be added)
        const pv = await apiFetch(`/admin/universities/${uid}/pending-voters`);
        if (pv.ok) setPending(pv.body || []);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container"><Nav /><p>Loading...</p></div>;
  if (!user) return <div className="container"><Nav /><p>Please sign in as university admin.</p></div>;

  const uid = user.universityId;

  const approveVoter = async (voterId: string) => {
    setMessage('');
    const res = await apiFetch(`/admin/universities/${uid}/voters/${voterId}/approve`, { method: 'POST' });
    if (!res.ok) setMessage(res.body?.error || 'Failed to approve');
    else {
      setMessage('Voter approved');
      setPending((p) => p.filter((v) => v.id !== voterId));
    }
  };

  const registerStaff = async (e: any) => {
    e?.preventDefault();
    setMessage('');
    const res = await apiFetch(`/staff/${uid}/staff`, {
      method: 'POST',
      body: JSON.stringify({ email: staffEmail })
    });
    if (!res.ok) setMessage(res.body?.error || 'Failed to create staff');
    else {
      setMessage('Staff invited/created');
      setStaffEmail('');
    }
  };

  const createElection = async (e: any) => {
    e?.preventDefault();
    setMessage('');
    const res = await apiFetch(`/elections/${uid}/create`, {
      method: 'POST',
      body: JSON.stringify({ title: electionTitle, startAt: electionStart, endAt: electionEnd })
    });
    if (!res.ok) setMessage(res.body?.error || 'Failed to create election');
    else {
      setMessage('Election created');
      setElectionTitle(''); setElectionStart(''); setElectionEnd('');
    }
  };

  // Placeholder actions for open/close/delete/suspend: endpoints must exist (see server section below)
  const postAction = async (path: string, verb = 'POST') => {
    setMessage('');
    const res = await apiFetch(path, { method: verb });
    if (!res.ok) setMessage(res.body?.error || 'Action failed');
    else setMessage('Action succeeded');
  };

  return (
    <div className="container">
      <Nav />
      <h2>University Admin</h2>
      <p>Manage voters, staff, and elections for your university.</p>

      <section style={{ marginTop: 16 }}>
        <h3>Pending Voters</h3>
        {!pending.length ? <p>No pending voters</p> : (
          <ul>
            {pending.map((v) => (
              <li key={v.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                {v.firstName} {v.secondName} — {v.email}
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => approveVoter(v.id)} style={{ marginRight: 8 }}>Approve</button>
                  <button onClick={() => postAction(`/admin/universities/${uid}/voters/${v.id}/suspend`)}>Suspend</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Register Staff</h3>
        <form onSubmit={registerStaff}>
          <label>Email</label>
          <input className="input" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button type="submit">Create staff</button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Create Election</h3>
        <form onSubmit={createElection}>
          <label>Title</label>
          <input className="input" value={electionTitle} onChange={(e) => setElectionTitle(e.target.value)} />
          <label>Start (ISO)</label>
          <input className="input" value={electionStart} onChange={(e) => setElectionStart(e.target.value)} placeholder="2026-12-01T09:00:00Z" />
          <label>End (ISO)</label>
          <input className="input" value={electionEnd} onChange={(e) => setElectionEnd(e.target.value)} placeholder="2026-12-02T17:00:00Z" />
          <div style={{ marginTop: 8 }}>
            <button type="submit">Create election</button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Election Actions (open / close / delete)</h3>
        <p>Use the action buttons below for a specific election by id:</p>
        <p style={{ color: '#6b7280' }}>Example action calls assume endpoints like /elections/:electionId/open etc.</p>
        <div style={{ marginTop: 8 }}>
          <label>Example election id:</label>
          <input className="input" placeholder="paste-election-id-here" id="exampleElectionId" />
          <div style={{ marginTop: 8 }}>
            <button onClick={() => {
              const id = (document.getElementById('exampleElectionId') as HTMLInputElement).value;
              postAction(`/elections/${id}/open`);
            }}>Open</button>
            <button onClick={() => {
              const id = (document.getElementById('exampleElectionId') as HTMLInputElement).value;
              postAction(`/elections/${id}/close`);
            }} style={{ marginLeft: 8 }}>Close</button>
            <button onClick={() => {
              const id = (document.getElementById('exampleElectionId') as HTMLInputElement).value;
              postAction(`/elections/${id}`, 'DELETE');
            }} style={{ marginLeft: 8 }}>Delete</button>
          </div>
        </div>
      </section>

      {message && <p style={{ marginTop: 18 }}>{message}</p>}
    </div>
  );
                            }
