import Nav from '../components/Nav';

export default function AboutPage() {
  return (
    <div className="container">
      <Nav />
      <h2>About Secure E‑Voting</h2>
      <p>
        Secure E‑Voting is an online election platform built for universities and institutions.
        It provides a secure, auditable, role-based workflow for registering institutions, managing
        staff and voters, issuing single-use voting tokens, and running elections.
      </p>

      <section style={{ marginTop: 18 }}>
        <h3>Mission</h3>
        <p>
          To make democratic elections in educational institutions secure, transparent and easy to administer.
          We design with auditability, privacy, and simplicity in mind.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Security & Privacy</h3>
        <ul>
          <li>Single-use voting tokens to prevent ballot duplication</li>
          <li>Role-based access (system owner, university admin, staff, voter)</li>
          <li>Audit logs of administrative actions</li>
        </ul>
      </section>

      <hr style={{ marginTop: 24 }} />
      <footer style={{ marginTop: 18, color: '#6b7280' }}>
        <p>Secure-e-voting is the product of Alrine Technology — all rights reserved.</p>
      </footer>
    </div>
  );
}
