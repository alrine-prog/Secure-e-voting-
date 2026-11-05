import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import { apiFetch } from '../../../lib/api';

type AdminInfo = { username?: string; firstName?: string; secondName?: string; email?: string; phone?: string };
type University = { id: string; name: string; country?: string; districtCity?: string; email?: string; createdAt?: string; status?: string; admin?: AdminInfo };

export default function PendingUniversitiesPage() {
  const [list, setList] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/universities/pending');
      if (res.ok) {
        const universities = res.body?.universities || (Array.isArray(res.body) ? res.body : []);
        setList(universities);
        setMessage(null);
      } else {
        setList([]);
        setMessage({ text: res.body?.error || 'Could not load university registrations.', type: 'error' });
      }
    } catch { setList([]); setMessage({ text: 'An unexpected error occurred while loading.', type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    apiFetch('/auth/me').then((res) => {
      if (res.ok && res.body?.user?.role === 'system_owner') { setAuthorized(true); return load(); }
      window.location.assign(res.ok ? '/unauthorized' : '/login?role=system_owner');
      setLoading(false);
    }).catch(() => { window.location.assign('/login?role=system_owner'); setLoading(false); });
  }, []);

  const doAction = async (id: string, action: 'approve' | 'reject') => {
    if (!window.confirm(`Are you sure you want to ${action} this university?`)) return;
    setMessage(null);
    try {
      const res = await apiFetch(`/admin/universities/${id}/${action}`, { method: 'POST' });
      if (!res.ok) { setMessage({ text: res.body?.error || `${action} failed.`, type: 'error' }); return; }
      setMessage({ text: `University successfully ${action === 'approve' ? 'approved' : 'rejected'}.`, type: 'success' });
      setList((current) => current.filter((university) => university.id !== id));
    } catch { setMessage({ text: `An error occurred while trying to ${action}.`, type: 'error' }); }
  };

  return <div className="dashboard-page"><Nav userRole={authorized ? 'system_owner' : null} /><main className="dashboard-main"><header className="dashboard-heading"><div><span className="dashboard-kicker">System owner · institution governance</span><h1>University registration approvals</h1><p>Review new university registrations and approve eligible institutions. This area is limited to registration review—not university administration.</p></div><span className="dashboard-role">System owner</span></header>
    {message && <p className={`dashboard-notice ${message.type}`} role="status">{message.text}</p>}
    <section className="dashboard-stat-grid"><article className="dashboard-stat"><span>Awaiting review</span><strong>{loading ? '…' : list.length}</strong><small>Pending registrations</small></article><article className="dashboard-stat"><span>Access scope</span><strong>Approvals only</strong><small>No university admin workspace access</small></article><article className="dashboard-stat"><span>Registration flow</span><strong>Review → approve</strong><small>University admin activates after approval</small></article></section>
    <section className="dashboard-card approval-list-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Registration queue</span><h2>Pending universities</h2></div><button className="dashboard-button dashboard-button-subtle" type="button" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh list'}</button></div>
      {!authorized ? <p className="dashboard-state">Verifying system owner access…</p> : loading ? <p className="dashboard-state">Loading registrations…</p> : list.length === 0 ? <div className="dashboard-empty"><span aria-hidden="true">✓</span><h3>All caught up</h3><p>There are no university registrations awaiting review.</p></div> : <div className="approval-list">{list.map((university) => <article className="approval-item" key={university.id}><div className="approval-item-main"><div className="approval-avatar" aria-hidden="true">{university.name.slice(0, 1).toUpperCase()}</div><div><div className="approval-title-row"><h3>{university.name}</h3><span className="approval-status">Pending review</span></div><p>{[university.districtCity, university.country].filter(Boolean).join(', ') || 'Location not provided'}</p>{university.admin?.email && <small>Administrator: {university.admin.firstName || university.admin.username || 'Initial admin'} · {university.admin.email}</small>}{university.createdAt && <small>Registered {new Date(university.createdAt).toLocaleDateString()}</small>}</div></div><div className="approval-actions"><button className="approval-button approve" type="button" onClick={() => doAction(university.id, 'approve')}>Approve</button><button className="approval-button reject" type="button" onClick={() => doAction(university.id, 'reject')}>Reject</button></div></article>)}</div>}
    </section><div className="dashboard-owner-note"><strong>System owner access boundary</strong><span>You can review registrations and approve or reject institutions. University election management belongs to that university’s administrator after approval.</span></div></main><footer className="dashboard-footer">Secure E-Voting · System owner registration review</footer></div>;
}
