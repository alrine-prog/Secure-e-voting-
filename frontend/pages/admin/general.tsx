import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

export default function UniversityAdminPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Staff Form state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffMessage, setStaffMessage] = useState('');

  // Observer Form state
  const [observerEmail, setObserverEmail] = useState('');
  const [observerName, setObserverName] = useState('');
  const [organization, setOrganization] = useState('');
  const [observerMessage, setObserverMessage] = useState('');

  useEffect(() => {
    (async () => {
      const res = await apiFetch('/auth/me');
      if (res.ok) setUser(res.body?.user || null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container"><Nav /><p>Loading...</p></div>;

  if (!user || (user.role !== 'university_admin' && user.role !== 'uni_admin')) {
    return (
      <div className="container">
        <Nav />
        <p>Access denied. University Admin access required.</p>
      </div>
    );
  }

  const universityId = user.universityId;

  // Handle Staff Registration
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffMessage('');

    const res = await apiFetch(`/admin/universities/${universityId}/staff`, {
      method: 'POST',
      body: JSON.stringify({ email: staffEmail, name: staffName }),
    });

    if (!res.ok) {
      setStaffMessage(res.body?.error || 'Failed to add staff member');
    } else {
      setStaffMessage('Staff member created successfully');
      setStaffEmail('');
      setStaffName('');
    }
  };

  // Handle Observer Registration
  const handleAddObserver = async (e: React.FormEvent) => {
    e.preventDefault();
    setObserverMessage('');

    const res = await apiFetch(`/admin/universities/${universityId}/observers`, {
      method: 'POST',
      body: JSON.stringify({
        email: observerEmail,
        name: observerName,
        organization,
      }),
    });

    if (!res.ok) {
      setObserverMessage(res.body?.error || 'Failed to add observer');
    } else {
      setObserverMessage('Observer registered successfully');
      setObserverEmail('');
      setObserverName('');
      setOrganization('');
    }
  };

  return (
    <div className="container">
      <Nav />
      <h2>University Admin Dashboard</h2>
      <p>Welcome, {user.email}. Institution ID: {universityId}</p>

      {/* Staff Registration Section */}
      <section style={{ marginTop: 24, padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Register Staff Member</h3>
        <form onSubmit={handleAddStaff}>
          <div>
            <label>Full Name</label>
            <input
              className="input"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Email Address</label>
            <input
              type="email"
              className="input"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit">Create Staff Account</button>
          </div>
        </form>
        {staffMessage && <p style={{ marginTop: 12 }}>{staffMessage}</p>}
      </section>

      {/* Observer Registration Section */}
      <section style={{ marginTop: 24, padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Register Election Observer</h3>
        <form onSubmit={handleAddObserver}>
          <div>
            <label>Full Name</label>
            <input
              className="input"
              value={observerName}
              onChange={(e) => setObserverName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Email Address</label>
            <input
              type="email"
              className="input"
              value={observerEmail}
              onChange={(e) => setObserverEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Organization / Body (Optional)</label>
            <input
              className="input"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Electoral Commission, Student Union Body"
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit">Create Observer Account</button>
          </div>
        </form>
        {observerMessage && <p style={{ marginTop: 12 }}>{observerMessage}</p>}
      </section>
    </div>
  );
}
