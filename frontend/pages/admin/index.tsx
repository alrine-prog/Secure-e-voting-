import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type Account = { email?: string; role?: string; universityId?: string };

export default function UniversityAdminDashboard() {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffMessage, setStaffMessage] = useState('');
  const [observerEmail, setObserverEmail] = useState('');
  const [observerName, setObserverName] = useState('');
  const [organization, setOrganization] = useState('');
  const [observerMessage, setObserverMessage] = useState('');

  useEffect(() => {
    apiFetch('/auth/me').then((res) => {
      if (res.ok) setUser(res.body?.user || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    setStaffMessage('');
    const res = await apiFetch(`/admin/universities/${user.universityId}/staff`, {
      method: 'POST', body: JSON.stringify({ email: staffEmail, name: staffName }),
    });
    setStaffMessage(res.ok ? 'Staff account created.' : res.body?.error || 'Could not create the staff account.');
    if (res.ok) { setStaffEmail(''); setStaffName(''); }
  };

  const addObserver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    setObserverMessage('');
    const res = await apiFetch(`/admin/universities/${user.universityId}/observers`, {
      method: 'POST', body: JSON.stringify({ email: observerEmail, name: observerName, organization }),
    });
    setObserverMessage(res.ok ? 'Observer account created.' : res.body?.error || 'Could not create the observer account.');
    if (res.ok) { setObserverEmail(''); setObserverName(''); setOrganization(''); }
  };

  if (loading) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><p className="dashboard-state">Loading your workspace…</p></main></div>;
  if (!user || !['university_admin', 'uni_admin'].includes(user.role || '')) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><span className="dashboard-kicker">Access restricted</span><h1>University administrator access required</h1><p>This workspace is reserved for university administrators.</p><Link className="dashboard-link" href="/login?role=uni_admin">Sign in as university administrator →</Link></section></main></div>;

  return (
    <div className="dashboard-page">
      <Nav userRole="uni_admin" />
      <main className="dashboard-main">
        <header className="dashboard-heading"><div><span className="dashboard-kicker">Institution workspace</span><h1>University dashboard</h1><p>Manage election access and the people supporting your institution’s elections.</p></div><span className="dashboard-role">University administrator</span></header>
        <section className="dashboard-stat-grid">
          <article className="dashboard-stat"><span>Institution</span><strong>{user.universityId || 'Not assigned'}</strong><small>Active workspace</small></article>
          <article className="dashboard-stat"><span>Account</span><strong>Administrator</strong><small>{user.email}</small></article>
          <article className="dashboard-stat"><span>Quick access</span><strong>Election tools</strong><small>Manage your institution</small></article>
        </section>
        <div className="dashboard-grid dashboard-grid-two">
          <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Team management</span><h2>Register staff member</h2></div><span className="dashboard-card-icon">01</span></div><p className="dashboard-muted">Create an account for a staff member who will support voter registration.</p><form className="dashboard-form" onSubmit={addStaff}><label htmlFor="staff-name">Full name</label><input id="staff-name" value={staffName} onChange={(e) => setStaffName(e.target.value)} required /><label htmlFor="staff-email">Email address</label><input id="staff-email" type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required /><button className="dashboard-button" type="submit">Create staff account <span>→</span></button></form>{staffMessage && <p className="dashboard-feedback" role="status">{staffMessage}</p>}</section>
          <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Independent oversight</span><h2>Register observer</h2></div><span className="dashboard-card-icon">02</span></div><p className="dashboard-muted">Provide an observer with an account to monitor election activity.</p><form className="dashboard-form" onSubmit={addObserver}><label htmlFor="observer-name">Full name</label><input id="observer-name" value={observerName} onChange={(e) => setObserverName(e.target.value)} required /><label htmlFor="observer-email">Email address</label><input id="observer-email" type="email" value={observerEmail} onChange={(e) => setObserverEmail(e.target.value)} required /><label htmlFor="observer-org">Organization</label><input id="observer-org" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Optional" /><button className="dashboard-button" type="submit">Create observer account <span>→</span></button></form>{observerMessage && <p className="dashboard-feedback" role="status">{observerMessage}</p>}</section>
        </div>
        <section className="dashboard-card dashboard-shortcuts"><div><span className="dashboard-kicker">Continue your work</span><h2>University election tools</h2><p className="dashboard-muted">Open the tools available for your institution.</p></div><div className="dashboard-shortcut-links"><Link href="/admin/university">Manage university activity <span>→</span></Link><Link href="/admin/university/pending">Review pending voters <span>→</span></Link></div></section>
      </main>
      <footer className="dashboard-footer">Secure E-Voting · University administration</footer>
    </div>
  );
}
