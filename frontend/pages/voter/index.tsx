import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type Candidate = {
  id: string;
  fullName: string;
  position: string;
  faculty: string;
  college: string;
  party: string;
  symbol: string;
  photoUrl?: string | null;
  description?: string | null;
};

type Election = {
  id: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  candidates: Candidate[];
};

const cardStyle = { border: '1px solid #e4e8ef', borderRadius: 14, padding: 18, background: '#fff' };

export default function VoterDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyElection, setBusyElection] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    apiFetch('/voting/available')
      .then((response) => {
        if (!mounted) return;
        if (!response.ok) throw new Error(response.body?.error || 'Could not load available elections.');
        setElections(response.body?.elections || []);
      })
      .catch((error) => { if (mounted) setMessage(error instanceof Error ? error.message : 'Could not load available elections.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const castVote = async (election: Election) => {
    const token = tokens[election.id]?.trim();
    const candidateId = selectedCandidates[election.id];
    if (!token || !candidateId) {
      setMessage('Select a candidate and enter your voting token before submitting.');
      return;
    }
    setBusyElection(election.id);
    setMessage('');
    const response = await apiFetch(`/voting/${election.id}/cast`, {
      method: 'POST',
      body: JSON.stringify({ token, candidate: candidateId }),
    });
    setBusyElection('');
    if (!response.ok) {
      setMessage(response.body?.error || 'Your vote could not be submitted.');
      return;
    }
    setElections((current) => current.filter((item) => item.id !== election.id));
    setMessage('Your vote was submitted successfully. Your single-use token cannot be used again.');
  };

  return (
    <div className="dashboard-page">
      <Nav userRole="voter" />
      <main className="dashboard-main">
        <header className="dashboard-heading">
          <div><span className="dashboard-kicker">Your voting workspace</span><h1>Available elections</h1><p>Review candidate profiles, choose one candidate for each election, and submit your single-use voting token.</p></div>
        </header>
        {message && <p role="status" className="dashboard-card" style={{ color: '#4234ae' }}>{message}</p>}
        {loading ? <p className="dashboard-state">Loading elections…</p> : elections.length === 0 ? (
          <section className="dashboard-card"><h2>No elections available</h2><p>There are no elections open for voting at your university right now.</p></section>
        ) : <div style={{ display: 'grid', gap: 22 }}>
          {elections.map((election) => <section key={election.id} className="dashboard-card" style={cardStyle}>
            <h2>{election.title}</h2>
            {election.description && <p>{election.description}</p>}
            <p>Voting closes {new Date(election.endAt).toLocaleString()}</p>
            {!election.candidates.length ? <p>No candidates have been listed for this election yet.</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
              {election.candidates.map((candidate) => <label key={candidate.id} style={{ ...cardStyle, cursor: 'pointer', borderColor: selectedCandidates[election.id] === candidate.id ? '#6654e8' : '#e4e8ef' }}>
                <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                  <input type="radio" name={`candidate-${election.id}`} value={candidate.id} checked={selectedCandidates[election.id] === candidate.id} onChange={() => setSelectedCandidates((current) => ({ ...current, [election.id]: candidate.id }))} aria-label={`Vote for ${candidate.fullName}`} />
                  {candidate.photoUrl ? <img src={candidate.photoUrl} alt={candidate.fullName} style={{ width: 76, height: 88, objectFit: 'cover', borderRadius: 9 }} /> : <div aria-label="No candidate photo" style={{ width: 76, height: 88, borderRadius: 9, background: '#f0effb', display: 'grid', placeItems: 'center', color: '#6654e8' }}>Photo</div>}
                  <div><h3 style={{ margin: '0 0 6px' }}>{candidate.fullName}</h3><p style={{ margin: '0 0 5px' }}><strong>{candidate.position}</strong></p><p style={{ margin: '0 0 5px' }}>{candidate.faculty} · {candidate.college}</p><p style={{ margin: '0 0 5px' }}>{candidate.party} · Symbol: <strong>{candidate.symbol}</strong></p>{candidate.description && <p style={{ margin: 0 }}>{candidate.description}</p>}</div>
                </div>
              </label>)}
            </div>}
            {election.candidates.length > 0 && <div style={{ marginTop: 18, maxWidth: 450 }}>
              <label style={{ display: 'block', fontWeight: 600 }} htmlFor={`token-${election.id}`}>Single-use voting token</label>
              <input id={`token-${election.id}`} type="password" autoComplete="off" value={tokens[election.id] || ''} onChange={(event) => setTokens((current) => ({ ...current, [election.id]: event.target.value }))} style={{ display: 'block', width: '100%', padding: 11, margin: '7px 0 12px', border: '1px solid #d5dbe5', borderRadius: 8 }} />
              <button type="button" disabled={busyElection === election.id} onClick={() => castVote(election)}>{busyElection === election.id ? 'Submitting…' : 'Submit vote'}</button>
            </div>}
          </section>)}
        </div>}
      </main>
    </div>
  );
}
