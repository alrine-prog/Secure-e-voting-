import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Nav from '../components/Nav';
import { apiFetch, redirectUserByRole } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  // Selected role passed from Nav dropdown (?role=...)
  const selectedRole = (router.query.role as string) || '';

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr('');

    const resp = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: selectedRole || undefined }),
    });

    if (!resp.ok) {
      setErr(resp.body?.error || 'Login failed');
      return;
    }

    const user = resp.body?.user;

    // Use centralized navigation helper to handle all 5 roles
    if (user?.role) {
      redirectUserByRole(user.role, router);
    } else {
      setErr('Invalid user role returned from server');
    }
  };

  // Helper to format role title string
  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'system_owner': return 'System Owner';
      case 'uni_admin': return 'University Admin';
      case 'staff': return 'Staff';
      case 'voter': return 'Voter';
      case 'observer': return 'Observer';
      default: return '';
    }
  };

  return (
    <div className="page-wrapper">
      <Nav />

      <main className="login-container">
        <div className="login-card">
          <h2>
            {selectedRole ? `Login as ${getRoleTitle(selectedRole)}` : 'Login'}
          </h2>

          <form onSubmit={submit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {err && <div className="error">{err}</div>}

            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>

          <div className="signup-prompt">
            <span>Don't have an account? </span>
            <Link href="/register-university" legacyBehavior>
              <a className="signup-link">
                Sign up for a university account
              </a>
            </Link>
          </div>
        </div>
      </main>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #f8fafc;
        }

        .login-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px 16px;
          box-sizing: border-box;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          padding: 32px 24px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          box-sizing: border-box;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 24px;
          text-align: center;
          font-size: 1.75rem;
          color: #0f172a;
          text-transform: capitalize;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-weight: 500;
          font-size: 0.9rem;
          color: #475569;
        }

        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .input:focus {
          outline: none;
          border-color: #0f172a;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.15);
        }

        .error {
          color: #dc2626;
          font-size: 0.875rem;
          background: #fef2f2;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #fecaca;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #0f172a;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: 8px;
        }

        .submit-btn:hover {
          background-color: #1e293b;
        }

        .signup-prompt {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
          color: #64748b;
        }

        .signup-prompt :global(.signup-link) {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }

        .signup-prompt :global(.signup-link:hover) {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
