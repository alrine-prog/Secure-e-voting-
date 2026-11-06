import { useCallback, useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type AdminUser = { email?: string; role?: string; universityId?: string };
type Account = { id: string; firstName: string; secondName: string; email: string; role: 'staff' | 'observer'; isActive: boolean; createdAt: string };
type Candidate = { id: string; name: string; position: string; description?: string | null };
type Election = { id: string; title: string; description?: string | null; startAt: string; endAt: string; status: string; candidates: Candidate[] };
type AuditLog = { id: string; action: string; resourceType?: string | null; resourceId?: string | null; details?: Record<string, unknown> | null; createdAt: string; user?: { firstName: string; secondName: string; email: string; role: string } | null };

export default function UniversityAdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [observerName, setObserverName] = useState('');
  const [observerEmail, setObserverEmail] = useState('');
  const [electionTitle, setElectionTitle] = useState('');
  const [electionDescription, setElectionDescription] = useState('');
  const [electionStart, setElectionStart] = useState('');
  const [electionEnd, setElectionEnd] = useState('');
  const [candidateForms, setCandidateForms] = useState<Record<string, { name: string; position: string }>>({});

  const refresh = useCallback(async (universityId: string) => {
    const [accountRes, electionRes, logRes] = await Promise.all([
      apiFetch(`/admin/universities/${universityId}/accounts`),
      apiFetch(`/elections/${universityId}`),
      apiFetch(`/admin/universities/${universityId}/audit-logs`)
    ]);
    if (accountRes.ok) setAccounts(accountRes.body?.accounts || []);
    if (electionRes.ok) setElections(electionRes.body?.elections || []);
    if (logRes.ok) setLogs(logRes.body?.logs || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch('/auth/me');
        if (me.ok && me.body?.user) {
          setUser(me.body.user);
          if (me.body.user.universityId) await refresh(me.body.user.universityId);
        }
      } catch { setMessage('Could not load your university workspace.'); }
      finally { setLoading(false); }
    })();
  }, [refresh]);

  const addAccount = async (event: React.FormEvent, role: 'staff' | 'observers') => {
    event.preventDefault();
    if (!user?.universityId) return;
    const isStaff = role === 'staff';
    const name = isStaff ? staffName : observerName;
    const email = isStaff ? staffEmail : observerEmail;
    setMessage('');
    const result = await apiFetch(`/admin/universities/${user.universityId}/${role}`, { method: 'POST', body: JSON.stringify({ name, email }) });
    if (!result.ok) { setMessage(result.body?.error || 'Could not create account.'); return; }
    setMessage(`${isStaff ? 'Staff' : 'Observer'} account created.${result.body?.notificationSent === false ? ' Email delivery failed; ask the user to use Forgot password.' : ' Sign-in instructions were emailed.'}`);
    if (isStaff) { setStaffName(''); setStaffEmail(''); } else { setObserverName(''); setObserverEmail(''); }
    await refresh(user.universityId);
  };

  const createElection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.universityId) return;
    setMessage('');
    const result = await apiFetch(`/elections/${user.universityId}/create`, { method: 'POST', body: JSON.stringify({ title: electionTitle, description: electionDescription, startAt: new Date(electionStart).toISOString(), endAt: new Date(electionEnd).toISOString() }) });
    if (!result.ok) { setMessage(result.body?.error || 'Could not create election.'); return; }
    setElectionTitle(''); setElectionDescription(''); setElectionStart(''); setElectionEnd('');
    setMessage('Election created as a draft. Register candidates for each post before opening it.');
    await refresh(user.universityId);
  };

  const addCandidate = async (event: React.FormEvent, electionId: string) => {
    event.preventDefault();
    if (!user?.universityId) return;
    const form = candidateForms[electionId] || { name: '', position: '' };
    const result = await apiFetch(`/elections/${electionId}/candidates`, { method: 'POST', body: JSON.stringify(form) });
    if (!result.ok) { setMessage(result.body?.error || 'Could not register candidate.'); return; }
    setCandidateForms((current) => ({ ...current, [electionId]: { name: '', position: '' } }));
    setMessage(`${form.name} registered for ${form.position}.`);
    await refresh(user.universityId);
  };

  const electionAction = async (election: Election, action: 'open' | 'close' | 'notify') => {
    if (!user?.universityId) return;
    setMessage('');
    const isNotify = action === 'notify';
    if (isNotify && !window.confirm(`Notify approved voters about “${election.title}”?`)) return;
    const url = isNotify ? `/admin/universities/${user.universityId}/elections/${election.id}/notify` : `/elections/${election.id}/${action}`;
    const result = await apiFetch(url, { method: 'POST', body: JSON.stringify({}) });
    if (!result.ok) { setMessage(result.body?.error || `Could not ${action} election.`); return; }
    setMessage(isNotify ? `Election notice sent to ${result.body?.sent ?? 0} contact(s); ${result.body?.failed ?? 0} delivery failures.` : `Election ${action === 'open' ? 'opened' : 'closed'}.`);
    await refresh(user.universityId);
  };

  const accountAction = async (account: Account) => {
    if (!user?.universityId) return;
    const suspend = account.isActive;
    const reason = suspend ? window.prompt(`Why are you suspending ${account.firstName} ${account.secondName}?`) : '';
    if (suspend && !reason) return;
    const result = await apiFetch(`/admin/universities/${user.universityId}/accounts/${account.id}/${suspend ? 'suspend' : 'reactivate'}`, { method: 'POST', body: JSON.stringify({ reason }) });
    if (!result.ok) { setMessage(result.body?.error || 'Could not update account.'); return; }
    setMessage(`${account.role === 'staff' ? 'Staff' : 'Observer'} account ${suspend ? 'suspended' : 'reactivated'}.`);
    await refresh(user.universityId);
  };

  if (loading) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><p className="dashboard-state">Loading your workspace…</p></main></div>;
  if (!user || !['university_admin', 'uni_admin'].includes(user.role || '')) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><h1>University administrator access required</h1><p>Sign in with an administrator account to manage your university.</p></section></main></div>;

  return (
    <div className="dashboard-page">
      <Nav userRole="uni_admin" />
      <main className="dashboard-main">
        <header className="dashboard-heading"><div><span className="dashboard-kicker">Institution workspace</span><h1>University dashboard</h1><p>Manage staff, observers, elections, candidates, voter notices, and activity.</p></div><span className="dashboard-role">Administrator</span></header>
        {message && <p className="form-message" role="status">{message}</p>}

        <section className="dashboard-grid dashboard-grid-two">
          <article className="dashboard-card"><span className="dashboard-kicker">Team management</span><h2>Register staff member</h2><form className="public-form" onSubmit={(event) => addAccount(event, 'staff')}><label>Full name<input required value={staffName} onChange={(event) => setStaffName(event.target.value)} /></label><label>Email address<input required type="email" value={staffEmail} onChange={(event) => setStaffEmail(event.target.value)} /></label><button className="dashboard-button" type="submit">Create staff account</button></form></article>
          <article className="dashboard-card"><span className="dashboard-kicker">Independent oversight</span><h2>Register observer</h2><form className="public-form" onSubmit={(event) => addAccount(event, 'observers')}><label>Full name<input required value={observerName} onChange={(event) => setObserverName(event.target.value)} /></label><label>Email address<input required type="email" value={observerEmail} onChange={(event) => setObserverEmail(event.target.value)} /></label><button className="dashboard-button" type="submit">Create observer account</button></form></article>
        </section>

        <section className="dashboard-card" style={{ marginTop: 20 }}><span className="dashboard-kicker">People and access</span><h2>Staff and observers</h2>{accounts.length === 0 ? <p>No staff or observer accounts yet.</p> : <div className="dashboard-list">{accounts.map((account) => <article key={account.id} className="dashboard-list-item"><div><strong>{account.firstName} {account.secondName}</strong><p>{account.email} · {account.role} · {account.isActive ? 'Active' : 'Suspended'}</p></div><button type="button" className="dashboard-button" onClick={() => accountAction(account)}>{account.isActive ? 'Suspend' : 'Reactivate'}</button></article>)}</div>}</section>

        <section className="dashboard-card" style={{ marginTop: 20 }}><span className="dashboard-kicker">Election setup</span><h2>Create election</h2><form className="public-form" onSubmit={createElection}><label>Election name<input required value={electionTitle} onChange={(event) => setElectionTitle(event.target.value)} placeholder="Guild elections 2026" /></label><label>Description<input value={electionDescription} onChange={(event) => setElectionDescription(event.target.value)} /></label><label>Voting starts<input required type="datetime-local" value={electionStart} onChange={(event) => setElectionStart(event.target.value)} /></label><label>Voting ends<input required type="datetime-local" value={electionEnd} onChange={(event) => setElectionEnd(event.target.value)} /></label><button className="dashboard-button" type="submit">Create draft election</button></form></section>

        <section className="dashboard-card" style={{ marginTop: 20 }}><span className="dashboard-kicker">Election management</span><h2>Open and closed elections</h2>{elections.length === 0 ? <p>No elections created yet.</p> : elections.map((election) => <article key={election.id} className="dashboard-list-item" style={{ display: 'block', marginTop: 16 }}><div className="dashboard-card-heading"><div><h3>{election.title}</h3><p>{new Date(election.startAt).toLocaleString()} – {new Date(election.endAt).toLocaleString()} · <strong>{election.status}</strong></p>{election.description && <p>{election.description}</p>}</div><div>{election.status === 'draft' && <button className="dashboard-button" onClick={() => electionAction(election, 'open')}>Open election</button>}{election.status === 'open' && <button className="dashboard-button" onClick={() => electionAction(election, 'close')}>Close election</button>}{election.status !== 'closed' && <button className="dashboard-button" style={{ marginLeft: 8 }} onClick={() => electionAction(election, 'notify')}>Notify voters</button>}</div></div><h4>Candidates by post</h4>{election.candidates.length ? <ul>{election.candidates.map((candidate) => <li key={candidate.id}><strong>{candidate.position}:</strong> {candidate.name}{candidate.description ? ` — ${candidate.description}` : ''}</li>)}</ul> : <p>No candidates registered.</p>}{election.status === 'draft' && <form className="public-form" onSubmit={(event) => addCandidate(event, election.id)}><label>Candidate name<input required value={candidateForms[election.id]?.name || ''} onChange={(event) => setCandidateForms((current) => ({ ...current, [election.id]: { name: event.target.value, position: current[election.id]?.position || '' } }))} /></label><label>Post / position<input required placeholder="Guild President" value={candidateForms[election.id]?.position || ''} onChange={(event) => setCandidateForms((current) => ({ ...current, [election.id]: { name: current[election.id]?.name || '', position: event.target.value } }))} /></label><button className="dashboard-button" type="submit">Register candidate</button></form>}</article>)}</section>

        <section className="dashboard-card" style={{ marginTop: 20 }}><span className="dashboard-kicker">Accountability</span><h2>University activity log</h2>{logs.length === 0 ? <p>No activity recorded yet.</p> : <div className="dashboard-list">{logs.map((log) => <article key={log.id} className="dashboard-list-item"><div><strong>{log.action.replace(/_/g, ' ')}</strong><p>{log.user ? `${log.user.firstName} ${log.user.secondName} (${log.user.role})` : 'System'} · {log.resourceType || 'record'} · {new Date(log.createdAt).toLocaleString()}</p>{typeof log.details?.reason === 'string' && <p>Reason: {log.details.reason}</p>}</div></article>)}</div>}</section>
      </main>
      <footer className="dashboard-footer">Secure E-Voting · University administration</footer>
    </div>
  );
}
