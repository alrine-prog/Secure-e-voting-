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
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me').then((res) => { if (res.ok) setUser(res.body?.user || null); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) { setMessage('Your account is not associated with a university. Contact your administrator.'); return; }
    if (!firstName.trim() || !secondName.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setMessage('Please fill in first name, surname, email, username, and password.');
      return;
    }
    setSubmitting(true); setMessage('');
    try {
      const res = await apiFetch(`/staff/${user.universityId}/voters`, {
        method: 'POST',
        body: JSON.stringify({ firstName: firstName.trim(), secondName: secondName.trim(), email: email.trim(), username: username.trim(), password, phone: phone.trim() || undefined })
      });
      if (!res.ok) setMessage(res.body?.error || 'Voter registration failed.');
      else { setMessage('Voter registration submitted for approval.'); setFirstName(''); setSecondName(''); setEmail(''); setUsername(''); setPassword(''); setPhone(''); }
    } catch { setMessage('Could not connect to the registration service.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><p className="dashboard-state">Loading your workspace…</p></main></div>;
  if (!user || user.role !== 'staff') return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><span className="dashboard-kicker">Access required</span><h2>Staff access only</h2><p>This page is for election staff accounts.</p><Link href="/login?role=staff" className="dashboard-button">Sign in as staff</Link></section></main></div>;

  return <div className="dashboard-page"><Nav userRole="staff" /><main className="dashboard-main"><header className="dashboard-heading"><div><span className="dashboard-kicker">Election operations</span><h1>Staff dashboard</h1><p>Register eligible voters and create their secure ballot sign-in credentials.</p></div><span className="dashboard-role">Election staff</span></header>
    <section className="dashboard-stat-grid"><article className="dashboard-stat"><span>Workspace</span><strong>Voter registration</strong><small>University election operations</small></article><article className="dashboard-stat"><span>Institution</span><strong>{user.universityId || 'Not assigned'}</strong><small>Assigned university</small></article><article className="dashboard-stat"><span>Next step</span><strong>Approvals</strong><small>Pending voters must be approved before voting</small></article></section>
    <div className="dashboard-grid dashboard-grid-two">
      <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">New participant</span><h2>Register a voter</h2></div></div>
        <form onSubmit={register} className="public-form">
          <div className="form-two-column">
            <div className="form-field"><label>First name</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
            <div className="form-field"><label>Surname</label><input value={secondName} onChange={(e) => setSecondName(e.target.value)} required /></div>
            <div className="form-field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="form-field"><label>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="form-field"><label>Username</label><input value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
            <div className="form-field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          </div>
          {message && <p className="form-message" role="status">{message}</p>}
          <button className="dashboard-button" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Register voter'}</button>
        </form>
      </section>
      <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Staff resources</span><h2>Voter management</h2></div><span className="dashboard-badge">Ready</span></div>
        <ul className="dashboard-list"><li>Register approved voters with an institutional email.</li><li>Set a unique voter username and password for ballot sign-in.</li><li>Approve each voter before the election opens.</li></ul>
      </section>
    </div>
  </main></div>;
}
