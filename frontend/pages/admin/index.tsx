import { useCallback, useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type AdminUser = { email?: string; role?: string; universityId?: string; organizationName?: string | null };
type Account = { id: string; firstName: string; secondName: string; username: string; email: string; photoUrl?: string | null; role: 'staff' | 'observer'; isActive: boolean };
type Candidate = { id: string; name: string; position: string; description?: string | null };
type Election = { id: string; title: string; description?: string | null; startAt: string; endAt: string; status: string; candidates: Candidate[] };
type AuditLog = { id: string; action: string; resourceType?: string | null; resourceId?: string | null; details?: Record<string, unknown> | null; createdAt: string; user?: { firstName: string; secondName: string; email: string; role: string } | null };
const fieldStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d5dbe5', borderRadius: 8, boxSizing: 'border-box' as const };

export default function UniversityAdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [staffName, setStaffName] = useState(''); const [staffUsername, setStaffUsername] = useState(''); const [staffEmail, setStaffEmail] = useState(''); const [staffPhoto, setStaffPhoto] = useState<File | null>(null);
  const [observerName, setObserverName] = useState(''); const [observerUsername, setObserverUsername] = useState(''); const [observerEmail, setObserverEmail] = useState(''); const [observerPhoto, setObserverPhoto] = useState<File | null>(null);
  const [electionTitle, setElectionTitle] = useState(''); const [electionDescription, setElectionDescription] = useState(''); const [electionStart, setElectionStart] = useState(''); const [electionEnd, setElectionEnd] = useState('');
  const [candidateForms, setCandidateForms] = useState<Record<string, { name: string; position: string }>>({});

  const refresh = useCallback(async (universityId: string) => {
    const [accountRes, electionRes, logRes] = await Promise.all([
      apiFetch(`/admin/universities/${universityId}/accounts`), apiFetch(`/elections/${universityId}`), apiFetch(`/admin/universities/${universityId}/audit-logs`)
    ]);
    if (accountRes.ok) setAccounts(accountRes.body?.accounts || []);
    if (electionRes.ok) setElections(electionRes.body?.elections || []);
    if (logRes.ok) setLogs(logRes.body?.logs || []);
  }, []);

  useEffect(() => {
    (async () => { try { const me = await apiFetch('/auth/me'); if (me.ok && me.body?.user) { setUser(me.body.user); if (me.body.user.universityId) await refresh(me.body.user.universityId); } }
      catch { setMessage('Could not load your university workspace.'); } finally { setLoading(false); } })();
  }, [refresh]);

  const addAccount = async (event: React.FormEvent, role: 'staff' | 'observers') => {
    event.preventDefault();
    if (!user?.universityId) return;
    const isStaff = role === 'staff';
    const name = isStaff ? staffName.trim() : observerName.trim();
    const username = isStaff ? staffUsername.trim() : observerUsername.trim();
    const email = isStaff ? staffEmail.trim() : observerEmail.trim();
    const photo = isStaff ? staffPhoto : observerPhoto;
    if (!photo) { setMessage('Choose a profile photo for this account.'); return; }
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) { setMessage('Username must be 3–30 letters, numbers, dots, underscores, or hyphens.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 5 * 1024 * 1024) { setMessage('Photo must be JPEG, PNG, or WebP and no larger than 5 MB.'); return; }
    setMessage('');
    const form = new FormData(); form.append('name', name); form.append('username', username); form.append('email', email); form.append('photo', photo);
    const result = await apiFetch(`/admin/universities/${user.universityId}/${role}`, { method: 'POST', body: form });
    if (!result.ok) { setMessage(result.body?.error || 'Could not create account.'); return; }
    setMessage(`${isStaff ? 'Staff' : 'Observer'} account created.${result.body?.notificationSent === false ? ' Email delivery failed; ask the user to use Forgot password.' : ' Sign-in instructions were emailed.'}`);
    if (isStaff) { setStaffName(''); setStaffUsername(''); setStaffEmail(''); setStaffPhoto(null); } else { setObserverName(''); setObserverUsername(''); setObserverEmail(''); setObserverPhoto(null); }
    await refresh(user.universityId);
  };

  const createElection = async (event: React.FormEvent) => {
    event.preventDefault(); if (!user?.universityId) return;
    const result = await apiFetch(`/elections/${user.universityId}/create`, { method: 'POST', body: JSON.stringify({ title: electionTitle, description: electionDescription, startAt: new Date(electionStart).toISOString(), endAt: new Date(electionEnd).toISOString() }) });
    if (!result.ok) { setMessage(result.body?.error || 'Could not create election.'); return; }
    setElectionTitle(''); setElectionDescription(''); setElectionStart(''); setElectionEnd(''); setMessage('Election created as a draft. Add candidate profiles and positions before opening it.'); await refresh(user.universityId);
  };

  const addCandidate = async (event: React.FormEvent, electionId: string) => {
    event.preventDefault(); if (!user?.universityId) return;
    const form = candidateForms[electionId] || { name: '', position: '' };
    const result = await apiFetch(`/elections/${electionId}/candidates`, { method: 'POST', body: JSON.stringify({ fullName: form.name, position: form.position, faculty: 'Not specified', college: 'Not specified', party: 'Independent', symbol: form.position }) });
    if (!result.ok) { setMessage(result.body?.error || 'Could not register candidate. Use Candidates & positions to add full profiles and photos.'); return; }
    setCandidateForms((current) => ({ ...current, [electionId]: { name: '', position: '' } })); setMessage(`${form.name} registered for ${form.position}.`); await refresh(user.universityId);
  };

  const electionAction = async (election: Election, action: 'open' | 'close' | 'notify') => {
    if (!user?.universityId) return;
    if (action === 'notify' && !window.confirm(`Notify approved voters about “${election.title}”?`)) return;
    const url = action === 'notify' ? `/admin/universities/${user.universityId}/elections/${election.id}/notify` : `/elections/${election.id}/${action}`;
    const result = await apiFetch(url, { method: 'POST', body: JSON.stringify({}) });
    if (!result.ok) { setMessage(result.body?.error || `Could not ${action} election.`); return; }
    setMessage(action === 'notify' ? `Election notice sent to ${result.body?.sent ?? 0} contact(s); ${result.body?.failed ?? 0} delivery failures.` : `Election ${action === 'open' ? 'opened' : 'closed'}.`); await refresh(user.universityId);
  };

  const accountAction = async (account: Account) => {
    if (!user?.universityId) return;
    const suspend = account.isActive; const reason = suspend ? window.prompt(`Why are you suspending ${account.firstName} ${account.secondName}?`) : '';
    if (suspend && !reason) return;
    const result = await apiFetch(`/admin/universities/${user.universityId}/accounts/${account.id}/${suspend ? 'suspend' : 'reactivate'}`, { method: 'POST', body: JSON.stringify({ reason }) });
    if (!result.ok) { setMessage(result.body?.error || 'Could not update account.'); return; }
    setMessage(`${account.role} account ${suspend ? 'suspended' : 'reactivated'}.`); await refresh(user.universityId);
  };

  if (loading) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><p className="dashboard-state">Loading your workspace…</p></main></div>;
  if (!user || !['university_admin', 'uni_admin'].includes(user.role || '')) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><h1>University administrator access required</h1><p>Sign in with an administrator account to manage your university.</p></section></main></div>;

  const accountForm = (role: 'staff' | 'observers') => {
    const staff = role === 'staff';
    return <article className="dashboard-card"><span className="dashboard-kicker">{staff ? 'Team management' : 'Independent oversight'}</span><h2>Register {staff ? 'staff member' : 'observer'}</h2>
      <form className="public-form" onSubmit={(event) => addAccount(event, role)}>
        <label>Full name<input required value={staff ? staffName : observerName} onChange={(event) => staff ? setStaffName(event.target.value) : setObserverName(event.target.value)} /></label>
        <label>Username<input required minLength={3} maxLength={30} value={staff ? staffUsername : observerUsername} onChange={(event) => staff ? setStaffUsername(event.target.value) : setObserverUsername(event.target.value)} /></label>
        <label>Email address<input required type="email" value={staff ? staffEmail : observerEmail} onChange={(event) => staff ? setStaffEmail(event.target.value) : setObserverEmail(event.target.value)} /></label>
        <label>Organization<input readOnly value={user.organizationName || 'Your university'} /></label>
        <label>Profile photo (JPEG, PNG, WebP; max 5 MB)<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => staff ? setStaffPhoto(event.target.files?.[0] || null) : setObserverPhoto(event.target.files?.[0] || null)} /></label>
        <button className="dashboard-button" type="submit">Create {staff ? 'staff' : 'observer'} account</button>
      </form></article>;
  };

  return <div className="dashboard-page"><Nav userRole="uni_admin" /><main className="dashboard-main">
    <header className="dashboard-heading"><div><span className="dashboard-kicker">Institution workspace</span><h1>University dashboard</h1><p>{user.organizationName || 'Your organization'} · Manage people, elections, candidates, and activity.</p></div><span className="dashboard-role">Administrator</span></header>
    {message && <p className="form-message" role="status">{message}</p>}
    <section className="dashboard-grid dashboard-grid-two">{accountForm('staff')}{accountForm('observers')}</section>
    <section className="dashboard-card" style={{ marginTop: 20 }}><span className="dashboard-kicker">People and access</span><h2>Staff and observers</h2>{accounts.length === 0 ? <p>No accounts yet.</p> : <div className="dashboard-list">{accounts.map((account) => <article key={account.id} className="dashboard-list-item" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {account.photoUrl ? <img src={account.photoUrl} alt={`${account.firstName} ${account.secondName}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%' }} /> : <span aria-hidden="true">👤</span>}
      <div style={{ flex: 1 }}><strong>{account.firstName} {account.secondName}</strong><p>@{account.username} · {account.email} · {account.role} · {account.isActive ? 'Active' : 'Suspended'}</p><small>{user.organizationName || 'University'}</small></div>
      <button type="button" className="dashboard-button" onClick={() => accountAction(account)}>{account.isActive ? 'Suspend' : 'Reactivate'}</button></article>)}</div>}</section>
    <section className="dashboard-card" style={{ marginTop: 20 }}><h2>Create election</h2><form className="public-form" onSubmit={createElection}><label>Election name<input required value={electionTitle} onChange={(e) => setElectionTitle(e.target.value)} /></label><label>Description<input value={electionDescription} onChange={(e) => setElectionDescription(e.target.value)} /></label><label>Voting starts<input required type="datetime-local" value={electionStart} onChange={(e) => setElectionStart(e.target.value)} /></label><label>Voting ends<input required type="datetime-local" value={electionEnd} onChange={(e) => setElectionEnd(e.target.value)} /></label><button className="dashboard-button">Create draft election</button></form></section>
    <section className="dashboard-card" style={{ marginTop: 20 }}><h2>Election management</h2><p><a href="/admin/candidates">Open Candidates &amp; positions</a> to register candidate profiles, photos, and posts, or download the CSV template there.</p>{elections.map((election) => <article key={election.id} className="dashboard-list-item" style={{ display: 'block', marginTop: 12 }}><strong>{election.title}</strong><p>{new Date(election.startAt).toLocaleString()} – {new Date(election.endAt).toLocaleString()} · {election.status}</p>{election.status === 'draft' && <button className="dashboard-button" onClick={() => electionAction(election, 'open')}>Open election</button>}{election.status === 'open' && <button className="dashboard-button" onClick={() => electionAction(election, 'close')}>Close election</button>}{election.status !== 'closed' && <button className="dashboard-button" style={{ marginLeft: 8 }} onClick={() => electionAction(election, 'notify')}>Notify voters</button>}<h3>Candidates</h3>{election.candidates.map((candidate) => <p key={candidate.id}>{candidate.position}: {candidate.name}</p>)}{election.status === 'draft' && <form className="public-form" onSubmit={(event) => addCandidate(event, election.id)}><label>Candidate name<input required value={candidateForms[election.id]?.name || ''} onChange={(event) => setCandidateForms((current) => ({ ...current, [election.id]: { name: event.target.value, position: current[election.id]?.position || '' } }))} /></label><label>Position<input required placeholder="President, Secretary, etc." value={candidateForms[election.id]?.position || ''} onChange={(event) => setCandidateForms((current) => ({ ...current, [election.id]: { name: current[election.id]?.name || '', position: event.target.value } }))} /></label><button className="dashboard-button">Add basic candidate</button></form>}</article>)}</section>
    <section className="dashboard-card" style={{ marginTop: 20 }}><h2>University activity log</h2>{logs.map((log) => <article key={log.id} className="dashboard-list-item"><strong>{log.action.replace(/_/g, ' ')}</strong><p>{log.user ? `${log.user.firstName} ${log.user.secondName} (${log.user.role})` : 'System'} · {log.resourceType || 'record'} · {new Date(log.createdAt).toLocaleString()}</p></article>)}</section>
  </main><footer className="dashboard-footer">Secure E-Voting · University administration</footer></div>;
}
