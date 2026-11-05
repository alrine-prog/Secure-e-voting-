import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type SessionUser = { role?: string; universityId?: string };

export default function StaffDashboard() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me').then((res) => { if (res.ok) setUser(res.body?.user || null); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) { setMessage('Your account is not associated with a university. Contact your administrator.'); return; }
    setSubmitting(true); setMessage('');
    try {
      const res = await apiFetch(`/staff/${user.universityId}/voters`, { method: 'POST', body: JSON.stringify({ firstName, secondName }) });
      if (!res.ok) setMessage(res.body?.error || 'Voter registration failed.');
      else { setMessage('Voter registration submitted for approval.'); setFirstName(''); setSecondName(''); }
    } catch { setMessage('Could not connect to the registration service.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><p className="dashboard-state">Loading your workspace…</p></main></div>;
  if (!user || user.role !== 'staff') return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><span className="dashboard-kicker">Access restricted</span><h1>Election staff access required</h1><p>This workspace is for authorized election staff.</p><Link className="dashboard-link" href="/login?role=staff">Sign in as staff →</Link></section></main></div>;

  return <div className="dashboard-page"><Nav userRole="staff" /><main className="dashboard-main"><header className="dashboard-heading"><div><span className="dashboard-kicker">Election operations</span><h1>Staff dashboard</h1><p>Register eligible voters and access your voter-list tools.</p></div><span className="dashboard-role">Election staff</span></header>
    <section className="dashboard-stat-grid"><article className="dashboard-stat"><span>Workspace</span><strong>Voter registration</strong><small>University election operations</small></article><article className="dashboard-stat"><span>Institution</span><strong>{user.universityId || 'Not assigned'}</strong><small>Assigned university</small></article><article className="dashboard-stat"><span>Next step</span><strong>Register voters</strong><small>Submissions may require approval</small></article></section>
    <div className="dashboard-grid dashboard-grid-two"><section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">New participant</span><h2>Register a voter</h2></div><span className="dashboard-card-icon">01</span></div><p className="dashboard-muted">Enter the voter’s name to submit a registration request for your university.</p><form className="dashboard-form" onSubmit={register}><label htmlFor="voter-first-name">First name</label><input id="voter-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /><label htmlFor="voter-second-name">Second name</label><input id="voter-second-name" value={secondName} onChange={(e) => setSecondName(e.target.value)} required /><button className="dashboard-button" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit voter registration'} <span>→</span></button></form>{message && <p className="dashboard-feedback" role="status">{message}</p>}</section>
      <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Staff resources</span><h2>Voter management</h2></div><span className="dashboard-card-icon">02</span></div><p className="dashboard-muted">Continue with your existing staff tools.</p><div className="dashboard-shortcut-links"><Link href="/staff/list">View voter list <span>→</span></Link><Link href="/staff/import">Import voters from CSV <span>→</span></Link></div></section></div></main><footer className="dashboard-footer">Secure E-Voting · Election operations</footer></div>;
}
