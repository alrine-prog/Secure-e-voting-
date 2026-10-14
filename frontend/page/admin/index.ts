/import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

export default function AdminDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/admin/universities/pending', { method: 'GET' });
      if (res.ok) setPending(res.body || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="container">
      <Nav />
      <h2>Admin Dashboard</h2>
      {loading ? <p>Loading...</p> : (
        <>
          <h3>Pending universities</h3>
          {pending.length === 0 ? <p>No pending universities</p> : (
            <ul>
              {pending.map((u: any) => (
                <li key={u.id}>
                  {u.name} — {u.country}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
