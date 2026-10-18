import Link from 'next/link';
import Nav from '../../components/Nav';

export default function AdminDashboard() {
  return (
    <div className="container">
      <Nav />
      <h2>Admin Dashboard</h2>
      <p>Welcome, Administrator — use the links below to manage the election system.</p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 20 }}>
        <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3>Pending Universities</h3>
          <p>Review and approve registered universities awaiting activation.</p>
          <Link href="/admin/universities/pending"><a>Review pending</a></Link>
        </div>

        <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3>Manage Elections</h3>
          <p>Create, edit, and publish elections for institutions.</p>
          <Link href="/admin/elections"><a>View elections</a></Link>
        </div>

        <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3>Staff & Admins</h3>
          <p>Invite or remove staff members and manage administrative roles.</p>
          <Link href="/admin/staff"><a>Manage staff</a></Link>
        </div>
      </section>

      <hr style={{ margin: '24px 0' }} />

      <section>
        <h3>System Summary</h3>
        <ul>
          <li>Total universities: <strong>—</strong></li>
          <li>Active elections: <strong>—</strong></li>
          <li>Pending approvals: <strong>—</strong></li>
        </ul>
        <p style={{ color: '#6b7280' }}>Connect to the API to fetch live metrics and logs.</p>
      </section>
    </div>
  );
}
