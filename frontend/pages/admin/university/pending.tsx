import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import { apiFetch } from '../../../lib/api';

type AdminInfo = {
  username?: string;
  firstName?: string;
  secondName?: string;
  email?: string;
  phone?: string;
};

type University = {
  id: string;
  name: string;
  country?: string;
  districtCity?: string;
  email?: string;
  createdAt?: string;
  status?: string;
  admin?: AdminInfo;
};

export default function PendingUniversitiesPage() {
  const [list, setList] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch('/admin/universities/pending');
      if (res.ok) {
        setList(res.body || []);
      } else {
        setList([]);
        setMessage({
          text: res.body?.error || 'Failed to load pending universities',
          type: 'error',
        });
      }
    } catch (err) {
      setList([]);
      setMessage({ text: 'An unexpected error occurred while loading.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doAction = async (id: string, action: 'approve' | 'reject') => {
    setMessage(null);
    if (!confirm(`Are you sure you want to ${action} this university?`)) return;

    try {
      const res = await apiFetch(`/admin/universities/${id}/${action}`, { method: 'POST' });
      if (!res.ok) {
        setMessage({
          text: res.body?.error || `${action.toUpperCase()} failed`,
          type: 'error',
        });
        return;
      }

      const statusText = action === 'approve' ? 'approved' : 'rejected';
      setMessage({ text: `University successfully ${statusText}.`, type: 'success' });
      setList((s) => s.filter((u) => u.id !== id));
    } catch (err) {
      setMessage({ text: `An error occurred while trying to ${action}.`, type: 'error' });
    }
  };

  return (
    <div className="container">
      <Nav />
      <h2>Pending Universities</h2>
      <p>Universities that have registered and are awaiting approval.</p>

      {message && (
        <p style={{ color: message.type === 'success' ? '#16a34a' : '#dc2626', margin: '12px 0' }}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : list.length === 0 ? (
        <p>No pending universities.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
          {list.map((u) => (
            <li
              key={u.id}
              style={{
                padding: '16px 12px',
                borderBottom: '1px solid #e6e6e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div>
                <strong style={{ fontSize: 16 }}>{u.name}</strong>
                {(u.country || u.districtCity) && (
                  <div style={{ color: '#4b5563', fontSize: 14 }}>
                    {u.districtCity}{u.districtCity && u.country ? ', ' : ''}{u.country}
                  </div>
                )}
                {u.admin?.email && (
                  <div style={{ color: '#6b7280', fontSize: 13 }}>
                    Admin: {u.admin.firstName} ({u.admin.email})
                  </div>
                )}
                {u.createdAt && (
                  <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                    Registered: {new Date(u.createdAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => doAction(u.id, 'approve')}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() => doAction(u.id, 'reject')}
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Reject
                </button>

                <Link
                  href={`/admin/universities/${u.id}`}
                  style={{
                    marginLeft: 8,
                    color: '#2563eb',
                    textDecoration: 'underline',
                    fontSize: 14,
                  }}
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
