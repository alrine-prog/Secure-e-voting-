import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type Election = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  candidates: Candidate[];
};

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

type User = { role?: string; universityId?: string | null };

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d5dbe5', borderRadius: 8, marginTop: 5, marginBottom: 14, boxSizing: 'border-box' as const };
const labelStyle = { display: 'block', fontWeight: 600, fontSize: 14 };

export default function CandidateManagementPage() {
  const [user, setUser] = useState<User | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const loadElections = useCallback(async (universityId: string) => {
    const response = await apiFetch(`/elections/${universityId}`);
    if (!response.ok) throw new Error(response.body?.error || 'Could not load elections.');
    const rows = response.body?.elections || [];
    setElections(rows);
    setSelectedElectionId((current) => rows.some((election: Election) => election.id === current) ? current : rows[0]?.id || '');
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await apiFetch('/auth/me');
        if (!response.ok || !response.body?.user) throw new Error('Please sign in as a university administrator.');
        const currentUser = response.body.user as User;
        if (!['university_admin', 'uni_admin'].includes(currentUser.role || '') || !currentUser.universityId) {
          throw new Error('University administrator access is required.');
        }
        if (!mounted) return;
        setUser(currentUser);
        await loadElections(currentUser.universityId);
      } catch (error) {
        if (mounted) setMessage(error instanceof Error ? error.message : 'Could not load the candidate workspace.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [loadElections]);

  const selectedElection = elections.find((election) => election.id === selectedElectionId);

  const createElection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.universityId) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    try {
      const response = await apiFetch(`/elections/${user.universityId}/create`, {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          startAt: form.get('startAt'),
          endAt: form.get('endAt'),
        }),
      });
      if (!response.ok) throw new Error(response.body?.error || 'Could not create election.');
      await loadElections(user.universityId);
      setMessage('Election created. You can now add its candidates.');
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create election.');
    } finally {
      setBusy(false);
    }
  };

  const saveCandidate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedElectionId) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    try {
      const editing = editingCandidate;
      const url = editing
        ? `/elections/${selectedElectionId}/candidates/${editing.id}`
        : `/elections/${selectedElectionId}/candidates`;
      const response = await apiFetch(url, { method: editing ? 'PUT' : 'POST', body: form });
      if (!response.ok) throw new Error(response.body?.error || 'Could not save candidate.');
      if (user?.universityId) await loadElections(user.universityId);
      setEditingCandidate(null);
      event.currentTarget.reset();
      setMessage(editing ? 'Candidate updated.' : 'Candidate added.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save candidate.');
    } finally {
      setBusy(false);
    }
  };

  const beginEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div style={{ maxWidth: 1050, margin: '0 auto', padding: 24 }}><Nav /><p>Loading candidate workspace…</p></div>;

  return (
    <main style={{ maxWidth: 1050, margin: '0 auto', padding: '24px 20px 60px', color: '#18263b' }}>
      <Nav userRole="uni_admin" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', margin: '22px 0' }}>
        <div><p style={{ color: '#6654e8', fontWeight: 700, marginBottom: 4 }}>University administration</p><h1 style={{ margin: 0 }}>Candidates and positions</h1></div>
        <Link href="/admin" style={{ color: '#5d4bd9' }}>Back to dashboard</Link>
      </div>
      <p>Manage candidates for your university elections. Enter each candidate’s profile and upload an optional JPEG, PNG, or WebP photo (up to 5 MB).</p>
      {message && <p role="status" style={{ padding: 12, borderRadius: 8, background: '#f2f0ff', color: '#4234ae' }}>{message}</p>}

      <section style={{ marginTop: 24, padding: 22, border: '1px solid #e4e8ef', borderRadius: 14 }}>
        <h2 style={{ marginTop: 0 }}>Create an election</h2>
        <form onSubmit={createElection}>
          <label style={labelStyle}>Election title<input style={inputStyle} name="title" required /></label>
          <label style={labelStyle}>Starts at<input style={inputStyle} name="startAt" type="datetime-local" required /></label>
          <label style={labelStyle}>Ends at<input style={inputStyle} name="endAt" type="datetime-local" required /></label>
          <button type="submit" disabled={busy} style={{ padding: '10px 16px' }}>{busy ? 'Saving…' : 'Create election'}</button>
        </form>
      </section>

      <section style={{ marginTop: 24, padding: 22, border: '1px solid #e4e8ef', borderRadius: 14 }}>
        <h2 style={{ marginTop: 0 }}>{editingCandidate ? 'Update candidate' : 'Add candidate'}</h2>
        {!elections.length ? <p>Create an election first to add candidate profiles.</p> : <>
          <label style={labelStyle}>Election
            <select style={inputStyle} value={selectedElectionId} onChange={(event) => { setSelectedElectionId(event.target.value); setEditingCandidate(null); }}>
              {elections.map((election) => <option key={election.id} value={election.id}>{election.title} · {election.status}</option>)}
            </select>
          </label>
          <form key={`${selectedElectionId}-${editingCandidate?.id || 'new'}`} onSubmit={saveCandidate}>
            <label style={labelStyle}>Full name<input style={inputStyle} name="fullName" defaultValue={editingCandidate?.fullName || ''} required /></label>
            <label style={labelStyle}>Position<input style={inputStyle} name="position" placeholder="e.g. President, Secretary" defaultValue={editingCandidate?.position || ''} required /></label>
            <label style={labelStyle}>Faculty<input style={inputStyle} name="faculty" defaultValue={editingCandidate?.faculty || ''} required /></label>
            <label style={labelStyle}>College<input style={inputStyle} name="college" defaultValue={editingCandidate?.college || ''} required /></label>
            <label style={labelStyle}>Party<input style={inputStyle} name="party" defaultValue={editingCandidate?.party || ''} required /></label>
            <label style={labelStyle}>Party symbol<input style={inputStyle} name="symbol" defaultValue={editingCandidate?.symbol || ''} required /></label>
            <label style={labelStyle}>Additional details<textarea style={{ ...inputStyle, minHeight: 85 }} name="description" defaultValue={editingCandidate?.description || ''} /></label>
            {editingCandidate?.photoUrl && <p>Current photo: <a href={editingCandidate.photoUrl} target="_blank" rel="noreferrer">View photo</a>. Upload a new image to replace it.</p>}
            <label style={labelStyle}>Candidate photo (optional)<input style={inputStyle} name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
            <button type="submit" disabled={busy} style={{ padding: '10px 16px' }}>{busy ? 'Saving…' : editingCandidate ? 'Save changes' : 'Add candidate'}</button>
            {editingCandidate && <button type="button" onClick={() => setEditingCandidate(null)} style={{ marginLeft: 10, padding: '10px 16px' }}>Cancel edit</button>}
          </form>
        </>}
      </section>

      {selectedElection && <section style={{ marginTop: 24 }}>
        <h2>{selectedElection.title} candidates</h2>
        {!selectedElection.candidates?.length ? <p>No candidates have been added to this election yet.</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {selectedElection.candidates.map((candidate) => <article key={candidate.id} style={{ padding: 16, border: '1px solid #e4e8ef', borderRadius: 14, display: 'flex', gap: 14 }}>
            {candidate.photoUrl ? <img src={candidate.photoUrl} alt={`${candidate.fullName}`} style={{ width: 82, height: 96, objectFit: 'cover', borderRadius: 10 }} /> : <div aria-label="No candidate photo" style={{ width: 82, height: 96, borderRadius: 10, background: '#f0effb', display: 'grid', placeItems: 'center', color: '#6654e8' }}>Photo</div>}
            <div><h3 style={{ margin: '0 0 5px' }}>{candidate.fullName}</h3><p style={{ margin: '0 0 5px' }}><strong>{candidate.position}</strong></p><p style={{ margin: '0 0 5px', color: '#637087' }}>{candidate.faculty} · {candidate.college}</p><p style={{ margin: '0 0 10px', color: '#637087' }}>{candidate.party} · Symbol: {candidate.symbol}</p><button type="button" onClick={() => beginEdit(candidate)}>Edit profile</button></div>
          </article>)}
        </div>}
      </section>}
    </main>
  );
}
