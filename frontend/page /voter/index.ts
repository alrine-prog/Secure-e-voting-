import { useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

export default function VoterPage() {
  const [electionId, setElectionId] = useState('');
  const [token, setToken] = useState('');
  const [candidate, setCandidate] = useState('');
  const [message, setMessage] = useState('');

  const cast = async (e: any) => {
    e.preventDefault();
    setMessage('');
    const res = await apiFetch(`/elections/${encodeURIComponent(electionId)}/cast`, {
      method: 'POST',
      body: JSON.stringify({ token, candidate })
    });
    if (!res.ok) setMessage(res.body?.error || 'Failed to cast vote');
    else setMessage('Vote submitted. Thank you.');
  };

  return (
    <div className="container">
      <Nav />
      <h2>Voter ballot</h2>
      <form onSubmit={cast}>
        <input className="input" placeholder="Election ID" value={electionId} onChange={(e) => setElectionId(e.target.value)} />
        <input className="input" placeholder="Your vote token" value={token} onChange={(e) => setToken(e.target.value)} />
        <input className="input" placeholder="Candidate name" value={candidate} onChange={(e) => setCandidate(e.target.value)} />
        <button type="submit">Cast vote</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
