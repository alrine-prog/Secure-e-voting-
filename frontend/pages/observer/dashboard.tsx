import Link from 'next/link';
import { useState } from 'react';
import Nav from '../../components/Nav';

interface PrecinctStatus { id: string; name: string; votesCast: number; totalVoters: number; status: 'active' | 'synced' | 'flagged'; }

export default function ObserverDashboardPage() {
  const [precincts] = useState<PrecinctStatus[]>([
    { id: '1', name: 'Main Campus - Library', votesCast: 4230, totalVoters: 5500, status: 'synced' },
    { id: '2', name: 'North Hall Precinct', votesCast: 3120, totalVoters: 4000, status: 'synced' },
    { id: '3', name: 'Engineering Quad', votesCast: 5890, totalVoters: 7200, status: 'active' },
    { id: '4', name: 'West Annex Gym', votesCast: 1420, totalVoters: 2500, status: 'flagged' },
  ]);
  const totalVotes = precincts.reduce((sum, precinct) => sum + precinct.votesCast, 0);
  const turnout = (precincts.reduce((sum, precinct) => sum + precinct.totalVoters, 0) ? totalVotes / precincts.reduce((sum, precinct) => sum + precinct.totalVoters, 0) * 100 : 0).toFixed(1);

  return <div className="dashboard-page"><Nav userRole="observer" /><main className="dashboard-main"><header className="dashboard-heading"><div><span className="dashboard-kicker">Independent election oversight</span><h1>Observer dashboard</h1><p>Review election monitoring indicators and precinct reporting status.</p></div><Link className="dashboard-button dashboard-button-link" href="/observer/live-tally">Open live tally <span>→</span></Link></header>
    <section className="dashboard-stat-grid"><article className="dashboard-stat"><span>Ballots reported</span><strong>{totalVotes.toLocaleString()}</strong><small>Illustrative dashboard data</small></article><article className="dashboard-stat"><span>Overall turnout</span><strong>{turnout}%</strong><small>Across listed precincts</small></article><article className="dashboard-stat"><span>Precincts reporting</span><strong>{precincts.length} / {precincts.length}</strong><small>Listed precincts</small></article><article className="dashboard-stat"><span>Review flags</span><strong>{precincts.filter((precinct) => precinct.status === 'flagged').length}</strong><small>Items marked for review</small></article></section>
    <section className="dashboard-card"><div className="dashboard-card-heading"><div><span className="dashboard-kicker">Monitoring</span><h2>Precinct turnout &amp; status</h2></div><span className="dashboard-role">Sample data</span></div><p className="dashboard-muted">The figures below are sample dashboard data, not a live election feed.</p><div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Precinct</th><th>Votes cast</th><th>Registered</th><th>Turnout</th><th>Status</th></tr></thead><tbody>{precincts.map((precinct) => { const pct = (precinct.votesCast / precinct.totalVoters * 100).toFixed(1); return <tr key={precinct.id}><td>{precinct.name}</td><td>{precinct.votesCast.toLocaleString()}</td><td>{precinct.totalVoters.toLocaleString()}</td><td><span className="table-progress"><i style={{ width: `${pct}%` }} /></span>{pct}%</td><td><span className={`table-status ${precinct.status}`}>{precinct.status === 'flagged' ? 'Review needed' : precinct.status}</span></td></tr>; })}</tbody></table></div></section>
    <div className="dashboard-grid dashboard-grid-two"><section className="dashboard-card"><span className="dashboard-kicker">Results review</span><h2>Live tally</h2><p className="dashboard-muted">Open the tally view to inspect its current election summary.</p><Link className="dashboard-link" href="/observer/live-tally">View election tally →</Link></section><section className="dashboard-card"><span className="dashboard-kicker">Need assistance?</span><h2>Contact support</h2><p className="dashboard-muted">Contact the election team if you notice a reporting issue or need access assistance.</p><Link className="dashboard-link" href="/contact">Contact support →</Link></section></div></main><footer className="dashboard-footer">Secure E-Voting · Observer workspace</footer></div>;
}
