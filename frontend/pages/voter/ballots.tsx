import { useCallback, useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type Candidate = { id: string; name: string; description?: string | null };
type PostBallot = { position: string; voted: boolean; candidates: Candidate[] };
type ElectionBallot = { id: string; title: string; description?: string | null; startAt: string; endAt: string; positions: PostBallot[] };

export default function VoterBallotsPage() {
  const [ballots, setBallots] = useState<ElectionBallot[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    try {
      const response = await apiFetch('/voting/ballots');
      if (!response.ok) { setError(response.body?.error || 'Could not load your ballots.'); return; }
      setBallots(response.body?.ballots || []);
      setError('');
    } catch { setError('Could not connect to the voting service.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const castVote = async (election: ElectionBallot, post: PostBallot) => {
    const key = `${election.id}:${post.position}`;
    const candidateId = selections[key];
    if (post.voted || submitting[key] || !candidateId) return;
    const candidate = post.candidates.find((item) => item.id === candidateId);
    if (!candidate || !window.confirm(`Confirm your vote for ${candidate.name} for ${post.position}? This cannot be changed.`)) return;
    setSubmitting((current) => ({ ...current, [key]: true }));
    setNotice('');
    try {
      const response = await apiFetch(`/voting/${election.id}/ballot`, {
        method: 'POST',
        body: JSON.stringify({ position: post.position, candidateId })
      });
      if (!response.ok) {
        setError(response.body?.error || 'Your vote could not be recorded.');
        return;
      }
      setNotice(`Your vote for ${post.position} was recorded.`);
      setError('');
      await refresh();
    } catch { setError('Could not connect to the voting service. Please check your ballot status before retrying.'); }
    finally { setSubmitting((current) => ({ ...current, [key]: false })); }
  };

  if (loading) return <div className="dashboard-page"><Nav userRole="voter" /><main className="dashboard-main"><p className="dashboard-state">Loading your ballots…</p></main></div>;

  return <div className="dashboard-page"><Nav userRole="voter" /><main className="dashboard-main">
    <header className="dashboard-heading"><div><span className="dashboard-kicker">Secure ballot</span><h1>Your election ballots</h1><p>Choose one candidate for each post. Each post has a separate single-use vote token.</p></div><span className="dashboard-role">Voter</span></header>
    {error && <p className="form-message error-message" role="alert">{error}</p>}
    {notice && <p className="form-message" role="status">{notice}</p>}
    {!ballots.length && !error ? <section className="dashboard-card"><h2>No open ballots</h2><p>There are no elections currently open for voting.</p></section> : ballots.map((election) => <section className="dashboard-card" key={election.id} style={{ marginTop: 18 }}>
      <div className="dashboard-card-heading"><div><span className="dashboard-kicker">Election</span><h2>{election.title}</h2><p>{new Date(election.startAt).toLocaleString()} – {new Date(election.endAt).toLocaleString()}</p>{election.description && <p>{election.description}</p>}</div></div>
      {election.positions.map((post) => {
        const key = `${election.id}:${post.position}`;
        return <article key={post.position} className="dashboard-list-item" style={{ display: 'block', marginTop: 16 }}><h3>{post.position}</h3>
          {post.voted ? <p role="status">Vote recorded for this post. Your choice remains private.</p> : <form onSubmit={(event) => { event.preventDefault(); void castVote(election, post); }}>
            <fieldset disabled={submitting[key]} style={{ border: 0, padding: 0, margin: 0 }}><legend className="dashboard-muted">Select one candidate</legend>
              {post.candidates.map((candidate) => <label key={candidate.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}><input type="radio" name={`candidate-${key}`} value={candidate.id} checked={selections[key] === candidate.id} onChange={() => setSelections((current) => ({ ...current, [key]: candidate.id }))} required /><span><strong>{candidate.name}</strong>{candidate.description && <small style={{ display: 'block' }}>{candidate.description}</small>}</span></label>)}
            </fieldset><button type="submit" className="dashboard-button" disabled={!selections[key] || submitting[key]}>{submitting[key] ? 'Submitting…' : `Submit vote for ${post.position}`}</button>
          </form>}
        </article>;
      })}
    </section>)}
  </main><footer className="dashboard-footer">Secure E-Voting · Your vote is private</footer></div>;
}
