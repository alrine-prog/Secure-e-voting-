import { useEffect, useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

type VoteBallot = { id: string; title: string; description?: string | null; startAt: string; endAt: string; positions: { position: string; voted: boolean; candidates: { id: string; name: string; description?: string | null }[] }[] };

export default function VoterDashboard() {
  const [user, setUser] = useState<any>(null);
  const [ballots, setBallots] = useState<VoteBallot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiFetch('/auth/me');
        if (!me.ok) { setLoading(false); return; }
        setUser(me.body?.user || null);
        const res = await apiFetch('/voting/ballots');
        if (!res.ok) {
          setError(res.body?.error || 'You do not have any active ballots right now.');
        } else {
          setBallots(res.body?.ballots || []);
        }
      } catch {
        setError('Could not load your voting dashboard.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><p className="dashboard-state">Loading your voting workspace…</p></main></div>;
  if (!user || user.role !== 'voter') return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><span className="dashboard-kicker">Access required</span><h2>Voter access only</h2><p>Please sign in with a voter account to see your ballots.</p></section></main></div>;

  return <div className="dashboard-page"><Nav userRole="voter" /><main className="dashboard-main">
    <header className="dashboard-heading"><div><span className="dashboard-kicker">Your voting workspace</span><h1>Voter portal</h1><p>Check election availability and access ballots you’re eligible to cast.</p></div><span className="dashboard-role">Voter</span></header>
    <section className="dashboard-stat-grid"><article className="dashboard-stat"><span>Participation</span><strong>Ready when you are</strong><small>Check for active elections</small></article><article className="dashboard-stat"><span>Ballot privacy</span><strong>Vote privately</strong><small>Follow your institution’s election guidance</small></article><article className="dashboard-stat"><span>Need assistance?</span><strong>Support is available</strong><small>Contact your election office</small></article></section>
    {error && <p className="form-message error-message" role="alert">{error}</p>}
    <div className="dashboard-grid dashboard-grid-two">
      <section className="dashboard-card voter-action-card"><span className="dashboard-card-icon">01</span><span className="dashboard-kicker">Find an election</span><h2>Active ballots</h2><p className="dashboard-muted">Open elections assigned to your institution will appear here.</p><a className="dashboard-button dashboard-button-link" href="/voter/ballots">View my ballots <span>→</span></a></section>
      <section className="dashboard-card voter-action-card"><span className="dashboard-card-icon">02</span><span className="dashboard-kicker">Your participation</span><h2>My status</h2><p className="dashboard-muted">Your account must be approved before you can cast a ballot.</p><a className="dashboard-button dashboard-button-link" href="/voter/ballots">Check status <span>→</span></a></section>
    </div>
    {ballots.length > 0 && <section className="dashboard-card" style={{ marginTop: 20 }}><h2>Open ballots</h2>{ballots.map((election) => <div key={election.id}><h3>{election.title}</h3><p>{new Date(election.startAt).toLocaleString()} - {new Date(election.endAt).toLocaleString()}</p>{election.positions.map((post) => <div key={`${election.id}-${post.position}`}><strong>{post.position}</strong> - {post.voted ? 'Vote recorded' : 'Open for voting'}</div>)}</div>)}</section>}
  </main></div>;
}
