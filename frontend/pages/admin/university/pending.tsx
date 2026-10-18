// frontend/pages/admin/universities/pending.tsx
import { useEffect, useState } from 'react';
import Link from '../../../components/Nav'; // not used, but keep consistent import style
import Nav from '../../../components/Nav';
import { apiFetch } from '../../../lib/api';

type University = {
  id: string;
  name: string;
  email?: string;
  createdAt?: string;
  status?: string;
};

export default function PendingUniversitiesPage() {
  const [list, setList] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    const res = await apiFetch('/admin/universities/pending');
    if (res.ok) setList(res.body || []);
    else {
      setList([]);
      setMessage(res.body?.error || 'Failed to load pending universities');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const doAction = async (id: string, action: 'approve' | 'reject') => {
    setMessage(null);
    if (!confirm(`Are you sure you want to ${action} this university?`)) return;
    const res = await apiFetch(`/admin/universities/${id}/${action}`, { method: 'POST' });
    if (!res.ok) {
      setMessage(res.body?.error || `${action} failed`);
      return;
    }
    setMessage(`University ${action}d`);
    setList((s) => s.filter((u) => u.id !== id));
  };

  return (
    <div className="container">
      <Nav />
      <h2>Pending Universities</h2>
      <p>Universities that have registered and are awaiting approval.</p>

      {message && <p style={{ color: '#dc2626' }}>{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : list.length === 0 ? (
        <p>No pending universities.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {list.map((u) => (
            <li
              key={u.id}
              style={{
                padding: 12,
                borderBottom: '1px solid #e6e6e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{u.name}</strong>
                {u.email && <div style={{ color: '#6b7280' }}>{u.email}</div>}
                {u.createdAt && (
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>
                    Registered: {new Date(u.createdAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => doAction(u.id, 'approve')}>Approve</button>
                <button
                  onClick={() => doAction(u.id, 'reject')}
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  Reject
                </button>
                <Link href={`/admin/universities/${u.id}`}><a style={{ marginLeft: 8 }}>View</a></Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
      }
