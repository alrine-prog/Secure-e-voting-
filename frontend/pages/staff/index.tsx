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
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me').then((res) => { if (res.ok) setUser(res.body?.user || null); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.universityId) { setMessage('Your account is not associated with a university. Contact your administrator.'); return; }
    if (!firstName.trim() || !secondName.trim() || !email.trim()) { setMessage('Please provide the voter’s first name, surname, and email.'); return; }
    setSubmitting(true); setMessage('');
    try {
      const result = await apiFetch(`/staff/${user.universityId}/voters`, {
        method: 'POST',
        body: JSON.stringify({ firstName: firstName.trim(), secondName: secondName.trim(), email: email.trim(), phone: phone.trim() || undefined })
      });
      if (!result.ok) setMessage(result.body?.error || 'Voter registration failed.');
      else {
        setMessage(result.body?.credentialEmailSent === false
          ? 'Voter registered and awaiting approval, but credential email delivery failed. Ask the voter to use Forgot password; do not create or share a password manually.'
          : 'Voter registered and awaiting approval. Sign-in instructions were sent to the voter’s email.');
        setFirstName(''); setSecondName(''); setEmail(''); setPhone('');
      }
    } catch { setMessage('Could not connect to the registration service.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><p className="dashboard-state">Loading your workspace…</p></main></div>;
  if (!user || user.role !== 'staff') return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><span className="dashboard-kicker">Access required</span><h2>Staff access only</h2><p>This page is for election staff accounts.</p><Link href="/login?role=staff" className="dashboard-button">Sign in as staff</Link></section></main></div>;

  return <div className="dashboard-page"><Nav userRole="staff" /><main className="dashboard-main">
    <header className="dashboard-heading"><div><span className="dashboard-kicker">Election operations</span><h1>Staff dashboard</h1><p>Register eligible voters. The system emails each voter a temporary password and requires them to change it after sign-in.</p></div><span className="dashboard-role">Election staff</span></header>
    <section className="dashboard-stat-grid"><article className="dashboard-stat"><span>Workspace</span><strong>Voter registration</strong><small>University election operations</small></article><article className="dashboard-stat"><span>Institution</span><strong>{user.universityId || 'Not assigned'}</strong><small>Assigned university</small></article><article className="dashboard-stat"><span>Next step</span><strong>Approvals</strong><small>Voters must be approved before they can vote</small></article></section>
    <div className="dashboard-grid dashboard-grid-two"><section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">New participant</span><h2>Register a voter</h2></div></div>
      <form onSubmit={register} className="public-form"><div className="form-two-column">
        <div className="form-field"><label htmlFor="voter-first-name">First name</label><input id="voter-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required /></div>
        <div className="form-field"><label htmlFor="voter-surname">Surname</label><input id="voter-surname" value={secondName} onChange={(event) => setSecondName(event.target.value)} autoComplete="family-name" required /></div>
        <div className="form-field"><label htmlFor="voter-email">Email</label><input id="voter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
        <div className="form-field"><label htmlFor="voter-phone">Phone (optional)</label><input id="voter-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" /></div>
      </div>
      <p className="dashboard-muted">The temporary password is sent only to the voter’s email. Staff cannot view it. The voter must change it before accessing the system.</p>
      {message && <p className="form-message" role="status">{message}</p>}
      <button className="dashboard-button" type="submit" disabled={submitting}>{submitting ? 'Registering…' : 'Register voter'}</button></form>
    </section>
    <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Staff resources</span><h2>Voter account process</h2></div><span className="dashboard-badge">Ready</span></div><ul className="dashboard-list"><li>Enter the voter’s valid email address; it is their sign-in identifier.</li><li>The system generates a temporary password and emails it to the voter.</li><li>The voter must change the temporary password after first sign-in.</li><li>The voter can cast ballots only after registration approval.</li></ul></section></div>
  </main></div>;
}
