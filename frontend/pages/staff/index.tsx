import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { apiFetch } from '../../lib/api';

type SessionUser = { role?: string; universityId?: string; organizationName?: string | null };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d5dbe5', borderRadius: 8, boxSizing: 'border-box' as const };

export default function StaffDashboard() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentRegistrationNumber, setStudentRegistrationNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [faculty, setFaculty] = useState('');
  const [college, setCollege] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me').then((response) => { if (response.ok) setUser(response.body?.user || null); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.universityId) { setMessage('Your account is not associated with a university. Contact your administrator.'); return; }
    if (!firstName.trim() || !secondName.trim() || !username.trim() || !email.trim() || !photo) { setMessage('First name, surname, username, email, and voter photo are required.'); return; }
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username.trim())) { setMessage('Username must be 3–30 letters, numbers, dots, underscores, or hyphens.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 5 * 1024 * 1024) { setMessage('Voter photo must be JPEG, PNG, or WebP and no larger than 5 MB.'); return; }

    setSubmitting(true); setMessage('');
    try {
      const form = new FormData();
      form.append('firstName', firstName.trim()); form.append('secondName', secondName.trim()); form.append('username', username.trim());
      form.append('email', email.trim()); form.append('phone', phone.trim()); form.append('studentRegistrationNumber', studentRegistrationNumber.trim());
      form.append('nationalId', nationalId.trim()); form.append('faculty', faculty.trim()); form.append('college', college.trim()); form.append('yearOfStudy', yearOfStudy);
      form.append('photo', photo);
      const result = await apiFetch(`/staff/${user.universityId}/voters`, { method: 'POST', body: form });
      if (!result.ok) setMessage(result.body?.error || 'Voter registration failed.');
      else {
        setMessage(result.body?.credentialEmailSent === false ? 'Voter registered and awaiting approval, but credential email delivery failed. Ask the voter to use Forgot password.' : 'Voter registered and awaiting approval. Sign-in instructions were emailed.');
        setFirstName(''); setSecondName(''); setUsername(''); setEmail(''); setPhone(''); setStudentRegistrationNumber(''); setNationalId(''); setFaculty(''); setCollege(''); setYearOfStudy(''); setPhoto(null);
      }
    } catch { setMessage('Could not connect to the registration service.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="dashboard-page"><Nav /><main className="dashboard-main"><p className="dashboard-state">Loading your workspace…</p></main></div>;
  if (!user || user.role !== 'staff') return <div className="dashboard-page"><Nav /><main className="dashboard-main"><section className="dashboard-card"><span className="dashboard-kicker">Access restricted</span><h1>Staff access required</h1><p>Sign in with a staff account to register voters.</p></section></main></div>;

  return <div className="dashboard-page"><Nav userRole="staff" /><main className="dashboard-main">
    <header className="dashboard-heading"><div><span className="dashboard-kicker">Election operations</span><h1>Staff dashboard</h1><p>Register eligible voters and manage their university enrollment details.</p></div><span className="dashboard-role">Election staff</span></header>
    <section className="dashboard-stat-grid"><article className="dashboard-stat"><span>Organization</span><strong>{user.organizationName || 'Not assigned'}</strong><small>Assigned university</small></article><article className="dashboard-stat"><span>Workspace</span><strong>Voter registration</strong><small>Voter records are subject to approval</small></article></section>
    <section className="dashboard-card" style={{ marginTop: 20 }}><h2>Register a voter</h2><form onSubmit={register} className="public-form"><div className="form-two-column">
      <label>First name *<input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></label><label>Surname *<input style={inputStyle} value={secondName} onChange={(e) => setSecondName(e.target.value)} required /></label>
      <label>Username *<input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={30} required /></label><label>Email *<input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Phone<input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label><label>Student registration number<input style={inputStyle} value={studentRegistrationNumber} onChange={(e) => setStudentRegistrationNumber(e.target.value)} /></label>
      <label>National ID<input style={inputStyle} value={nationalId} onChange={(e) => setNationalId(e.target.value)} /></label><label>Faculty<input style={inputStyle} value={faculty} onChange={(e) => setFaculty(e.target.value)} /></label>
      <label>College<input style={inputStyle} value={college} onChange={(e) => setCollege(e.target.value)} /></label><label>Year of study<input style={inputStyle} type="number" min="1" max="20" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} /></label>
      <label>Organization<input style={inputStyle} value={user.organizationName || 'Not assigned'} readOnly /></label>
      <label>Voter profile photo (JPEG, PNG, WebP; up to 5 MB) *<input style={inputStyle} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] || null)} required /></label>
    </div><p className="dashboard-muted">Temporary credentials are sent to the voter’s email. The voter must change the temporary password after signing in.</p>{message && <p className="form-message" role="status">{message}</p>}<button className="dashboard-button" type="submit" disabled={submitting}>{submitting ? 'Registering…' : 'Register voter'}</button></form></section>
  </main></div>;
}
