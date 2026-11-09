import { useCallback, useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type DirectoryType = 'staff' | 'observers' | 'voters';
type DirectoryRow = Record<string, string | number | boolean | null>;
type SessionUser = { role?: string; universityId?: string; organizationName?: string | null };
const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';
const labels: Record<string, string> = {
  name: 'Name', username: 'Username', email: 'Email', phone: 'Phone', status: 'Status', accountStatus: 'Account status',
  studentRegistrationNumber: 'Student number', faculty: 'Faculty', college: 'College', yearOfStudy: 'Year', approval: 'Approval', createdAt: 'Registered'
};
const columnsByType: Record<DirectoryType, string[]> = {
  staff: ['name', 'username', 'email', 'phone', 'status', 'createdAt'],
  observers: ['name', 'username', 'email', 'phone', 'status', 'createdAt'],
  voters: ['name', 'username', 'email', 'phone', 'studentRegistrationNumber', 'faculty', 'college', 'yearOfStudy', 'approval', 'accountStatus', 'createdAt']
};

export default function UniversityAccountsPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [type, setType] = useState<DirectoryType>('staff');
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const loadDirectory = useCallback(async (universityId: string, directoryType: DirectoryType) => {
    setLoading(true); setError('');
    try {
      const response = await apiFetch(`/admin/universities/${encodeURIComponent(universityId)}/directory/${directoryType}`);
      if (!response.ok) throw new Error(response.body?.error || 'Could not load directory.');
      setRows(response.body?.rows || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load directory.');
      setRows([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    (async () => {
      const response = await apiFetch('/auth/me');
      const current = response.body?.user as SessionUser | undefined;
      if (!response.ok || !current || !['university_admin', 'uni_admin'].includes(current.role || '') || !current.universityId) {
        setError('Sign in with a university administrator account to view people lists.'); setLoading(false); return;
      }
      setUser(current);
      await loadDirectory(current.universityId, type);
    })().catch(() => { setError('Could not connect to the account service.'); setLoading(false); });
  }, [loadDirectory, type]);

  const downloadPdf = async () => {
    if (!user?.universityId) return;
    setDownloading(true); setError('');
    try {
      const response = await fetch(`${apiBase}/admin/universities/${encodeURIComponent(user.universityId)}/directory/${type}?format=pdf`, { credentials: 'include' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Could not download PDF.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `${type}-directory.pdf`; anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not download PDF.'); }
    finally { setDownloading(false); }
  };

  const columns = columnsByType[type];
  return <div className="dashboard-page"><Nav userRole="uni_admin" /><main className="dashboard-main">
    <header className="dashboard-heading"><div><span className="dashboard-kicker">{user?.organizationName || 'University'}</span><h1>People directory</h1><p>View and download university staff, observer, and voter lists.</p></div><span className="dashboard-role">University administrator</span></header>
    <section className="dashboard-card">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div role="tablist" aria-label="Directory type" style={{ display: 'flex', gap: 8 }}>
          {(['staff', 'observers', 'voters'] as DirectoryType[]).map((item) => <button key={item} type="button" role="tab" aria-selected={type === item} className="dashboard-button" onClick={() => setType(item)}>{item === 'observers' ? 'Observers' : item[0].toUpperCase() + item.slice(1)}</button>)}
        </div>
        <button type="button" className="dashboard-button" disabled={downloading || loading || rows.length === 0} onClick={downloadPdf}>{downloading ? 'Preparing PDF…' : `Download ${type} PDF`}</button>
      </div>
      {error && <p className="form-message error-message" role="alert">{error}</p>}
      {loading ? <p className="dashboard-state">Loading directory…</p> : <>
        <p>{rows.length} {type === 'observers' ? 'observer' : type === 'staff' ? 'staff' : 'voter'} record(s)</p>
        {!rows.length ? <p>No {type} records found.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}><thead><tr>{columns.map((column) => <th key={column} scope="col" style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #dfe4ec' }}>{labels[column] || column}</th>)}</tr></thead><tbody>
          {rows.map((row, index) => <tr key={`${String(row.username || row.email)}-${index}`}>{columns.map((column) => <td key={column} style={{ padding: 10, borderBottom: '1px solid #edf0f5' }}>{column === 'createdAt' && row[column] ? new Date(String(row[column])).toLocaleDateString() : row[column] == null || row[column] === '' ? '—' : String(row[column])}</td>)}</tr>)}
        </tbody></table></div>}
      </>}
    </section>
  </main></div>;
}
