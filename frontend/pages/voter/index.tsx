import Link from 'next/link';
import Nav from '../../components/Nav';

export default function VoterDashboard() {
  return (
    <div className="container">
      <Nav />
      <h2>Voter Portal</h2>
      <p>Welcome — here you can view active elections and cast your vote when eligible.</p>

      <section style={{ marginTop: 18, display: 'grid', gap: 12 }}>
        <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3>Active Elections</h3>
          <p>No active elections found. When an election is published it will appear here.</p>
          <Link href="/voter/elections"><a>View elections</a></Link>
        </div>

        <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3>My Ballots</h3>
          <p>Access ballots you are eligible for and view voting status.</p>
          <Link href="/voter/ballots"><a>View ballots</a></Link>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h3>Support</h3>
        <p>If you have trouble logging in or accessing an election, contact your institution's election office via the Contact page.</p>
      </section>
    </div>
  );
}
