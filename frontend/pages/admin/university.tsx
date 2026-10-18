// frontend/pages/admin/university.tsx
import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

export default function UniversityAdminPage() {
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Example: fetch a university summary endpoint (adjust path if needed)
      const res = await apiFetch('/admin/university/summary');
      if (!mounted) return;
      if (res.ok) setSummary(res.body);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container">
      <Nav />
      <h2>University Admin Dashboard</h2>
      <p>Manage voters, approvals, and elections for your university.</p>

      <section style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h4>University Summary</h4>
            <p>{summary ? `Total voters: ${summary.totalVoters}` : 'Loading summary...'}</p>
            <Link href="/admin/universities"><a>View details</a></Link>
          </div>

          <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h4>Manage Elections</h4>
            <p>Create and manage elections for your university.</p>
            <Link href="/admin/universities/elections"><a>Manage elections</a></Link>
          </div>

          <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h4>Voter Approvals</h4>
            <p>Approve or reject voter registrations.</p>
            <Link href="/admin/universities/voters"><a>Manage voters</a></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
