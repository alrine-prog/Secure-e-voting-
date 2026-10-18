// frontend/pages/admin/system-owner.tsx
import Link from 'next/link';
import Nav from '../../components/Nav';

export default function SystemOwnerPage() {
  return (
    <div className="container">
      <Nav />
      <h2>System Owner Dashboard</h2>
      <p>Welcome — system owner controls and global management.</p>

      <section style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h4>Approve Universities</h4>
            <p>Review pending university registrations and approve or reject them.</p>
            <Link href="/admin/universities/pending"><a>View pending</a></Link>
          </div>

          <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h4>System Users</h4>
            <p>Invite/remove system admins and manage roles.</p>
            <Link href="/admin/staff"><a>Manage staff</a></Link>
          </div>

          <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h4>Audit Logs</h4>
            <p>View system events and activity.</p>
            <Link href="/admin/logs"><a>View logs</a></Link>
          </div>

          <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h4>System Settings</h4>
            <p>Global settings and policies.</p>
            <Link href="/admin/settings"><a>Open settings</a></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
