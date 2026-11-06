import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type ObserverUser = { role?: string; universityId?: string };
type Election = { id: string; title: string; description?: string | null; startAt: string; endAt: string; status: string };
type Tally = { approvedVoters: number; votersVoted: number; votersRemaining: number; totalBallotsCast: number; turnoutPercentage: number };

export default function ObserverDashboardPage() {
  const [user, setUser] = useState<ObserverUser | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [tallies, setTallies] = useState<Record<string, Tally>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const result = await apiFetch('/observer/elections');
    if (!result.ok) { setError(result.body?.error || 'Could not load elections.'); return; }
    const list: Election[] = result.body?.elections || [];
    setElections(list);
    const tallyResults = await Promise.all(list.map(async (election) => {
      const response = await apiFetch(`/observer/elections/${election.id}/tally`);
      return response.ok ? [election.id, response.body.summary as Tally] as const : null;
    }));
    setTallies(Object.fromEntries(tallyResults.filter((item): item is NonNullable<typeof item> => Boolean(item))));
    setError('');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch('/auth/me');
        if (!me.ok || me.body?.user?.role !== 'observer') { setError('Sign in with an observer account to view election monitoring.'); return; }
        setUser(me.body.user);
        await refresh();
      } catch { setError('Could not connect to the election monitoring service.'); }
      finally { setLoading(false); }
    })();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const interval = window.setInterval(() => { void refresh(); }, 15000);
    return () => window.clearInterval(interval);
  }, [user, refresh]);

  if (loading) return <div className="dashboard-page"><Nav userRole="observer" /><main className="dashboard-main"><p className="dashboard-state">Loading observer dashboard…</p></main></div>;
  if (!user) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><h1>Observer access required</h1><p>{error}</p></section></main></div>;

  const approved = Object.values(tallies).reduce((max, tally) => Math.max(max, tally.approvedVoters), 0);
  const activeElections = elections.filter((election) => election.status === 'open');
  const allVoted = activeElections.reduce((sum, election) => sum + (tallies[election.id]?.votersVoted || 0), 0);

  return <div className="dashboard-page"><Nav userRole="observer" /><main className="dashboard-main">
    <header className="dashboard-heading"><div><span className="dashboard-kicker">Independent election oversight</span><h1>Observer dashboard</h1><p>Review election status and turnout for your university. Tallies refresh automatically.</p></div><span className="dashboard-role">Observer</span></header>
    {error && <p className="form-message" role="alert">{error}</p>}
    <section className="dashboard-stat-grid"><article className="dashboard-stat"><span>Approved voters</span><strong>{approved.toLocaleString()}</strong><small>Eligible voters at this university</small></article><article className="dashboard-stat"><span>Open elections</span><strong>{activeElections.length.toLocaleString()}</strong><small>Currently accepting votes</small></article><article className="dashboard-stat"><span>Votes in open elections</span><strong>{allVoted.toLocaleString()}</strong><small>Participation counts can overlap across elections</small></article></section>
    <section className="dashboard-card" style={{ marginTop: 20 }}><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Election monitoring</span><h2>University elections</h2></div><button className="dashboard-button" onClick={() => void refresh()}>Refresh</button></div>
      {!elections.length ? <p>No elections are available for this university.</p> : elections.map((election) => { const tally = tallies[election.id]; return <article className="dashboard-list-item" key={election.id} style={{ marginTop: 14 }}><div><strong>{election.title}</strong><p>{new Date(election.startAt).toLocaleString()} – {new Date(election.endAt).toLocaleString()}</p><p>Status: <strong>{election.status}</strong>{tally ? ` · ${tally.turnoutPercentage}% turnout · ${tally.votersVoted} voted · ${tally.votersRemaining} yet to vote` : ''}</p></div><Link className="dashboard-button dashboard-button-link" href={`/observer/live-tally?electionId=${encodeURIComponent(election.id)}`}>View live tally →</Link></article>; })}
    </section>
  </main><footer className="dashboard-footer">Secure E-Voting · Independent oversight</footer></div>;
}
