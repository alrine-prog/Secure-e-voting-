import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type Election = { id: string; title: string; status: string };
type CandidateTally = { id: string; name: string; description: string | null; votes: number; percentage: number };
type PositionTally = { position: string; totalVotes: number; candidates: CandidateTally[] };
type Tally = {
  election: { id: string; title: string; description: string | null; startAt: string; endAt: string; status: string };
  summary: { approvedVoters: number; votersVoted: number; votersRemaining: number; totalBallotsCast: number; turnoutPercentage: number };
  positions: PositionTally[];
  refreshedAt: string;
};

export default function LiveTallyPage() {
  const router = useRouter();
  const electionId = typeof router.query.electionId === 'string' ? router.query.electionId : '';
  const [elections, setElections] = useState<Election[]>([]);
  const [tally, setTally] = useState<Tally | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const listResult = await apiFetch('/observer/elections');
      if (!listResult.ok) { setError(listResult.body?.error || 'Observer access is required.'); return; }
      const list: Election[] = listResult.body?.elections || [];
      setElections(list);
      const selectedId = electionId || list.find((item) => item.status === 'open')?.id || list[0]?.id;
      if (!selectedId) { setTally(null); setError('No elections are available for monitoring.'); return; }
      if (!electionId && router.isReady) void router.replace({ pathname: '/observer/live-tally', query: { electionId: selectedId } }, undefined, { shallow: true });
      const result = await apiFetch(`/observer/elections/${selectedId}/tally`);
      if (!result.ok) { setError(result.body?.error || 'Could not load election tally.'); return; }
      setTally(result.body as Tally);
      setError('');
    } catch { setError('Could not connect to the tally service.'); }
    finally { setLoading(false); }
  }, [electionId, router]);

  useEffect(() => { if (router.isReady) void refresh(); }, [router.isReady, electionId, refresh]);
  useEffect(() => {
    if (!isLive) return;
    const interval = window.setInterval(() => { void refresh(); }, 5000);
    return () => window.clearInterval(interval);
  }, [isLive, refresh]);

  return <div className="dashboard-page"><Nav userRole="observer" /><main className="dashboard-main">
    <header className="dashboard-heading"><div><span className="dashboard-kicker">Independent election oversight</span><h1>Live election tally</h1><p>Results are grouped by election post and refresh from recorded ballots.</p></div><span className="dashboard-role">{isLive ? 'LIVE' : 'PAUSED'}</span></header>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}><label htmlFor="election-select">Election</label><select id="election-select" value={tally?.election.id || electionId} onChange={(event) => { void router.push({ pathname: '/observer/live-tally', query: { electionId: event.target.value } }); }}><option value="" disabled>Select election</option>{elections.map((item) => <option key={item.id} value={item.id}>{item.title} ({item.status})</option>)}</select><button className="dashboard-button" type="button" onClick={() => void refresh()}>Refresh now</button><button className="dashboard-button" type="button" onClick={() => setIsLive((value) => !value)}>{isLive ? 'Pause updates' : 'Resume updates'}</button><Link href="/observer/dashboard">← Observer dashboard</Link></div>
    {error && <p className="form-message" role="alert">{error}</p>}
    {loading && !tally ? <p className="dashboard-state">Loading live tally…</p> : tally && <>
      <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">{tally.election.status}</span><h2>{tally.election.title}</h2><p>{new Date(tally.election.startAt).toLocaleString()} – {new Date(tally.election.endAt).toLocaleString()}</p></div><small>Last updated {new Date(tally.refreshedAt).toLocaleTimeString()}</small></div></section>
      <section className="dashboard-stat-grid" style={{ marginTop: 16 }}><article className="dashboard-stat"><span>Approved voters</span><strong>{tally.summary.approvedVoters.toLocaleString()}</strong><small>Eligible university voters</small></article><article className="dashboard-stat"><span>Voters who have voted</span><strong>{tally.summary.votersVoted.toLocaleString()}</strong><small>{tally.summary.turnoutPercentage}% turnout</small></article><article className="dashboard-stat"><span>Voters yet to vote</span><strong>{tally.summary.votersRemaining.toLocaleString()}</strong><small>Approved voters with no recorded ballot</small></article><article className="dashboard-stat"><span>Total ballots cast</span><strong>{tally.summary.totalBallotsCast.toLocaleString()}</strong><small>Votes counted across all posts</small></article></section>
      {!tally.positions.length ? <section className="dashboard-card" style={{ marginTop: 20 }}><h2>No candidates registered</h2><p>Candidate results will appear here after candidates are added and votes are cast.</p></section> : tally.positions.map((position) => <section className="dashboard-card" key={position.position} style={{ marginTop: 20 }}><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Post</span><h2>{position.position}</h2></div><strong>{position.totalVotes.toLocaleString()} votes</strong></div>{position.candidates.map((candidate) => <article key={candidate.id} style={{ marginTop: 18 }}><div className="dashboard-card-heading"><div><strong>{candidate.name}</strong>{candidate.description && <p>{candidate.description}</p>}</div><strong>{candidate.votes.toLocaleString()} · {candidate.percentage}%</strong></div><div role="progressbar" aria-label={`${candidate.name} vote share for ${position.position}`} aria-valuenow={candidate.percentage} aria-valuemin={0} aria-valuemax={100} style={{ height: 10, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}><div style={{ width: `${candidate.percentage}%`, height: '100%', background: '#2563eb', transition: 'width 300ms ease' }} /></div></article>)}</section>)}
    </>}
  </main><footer className="dashboard-footer">Secure E-Voting · Independent oversight</footer></div>;
}
