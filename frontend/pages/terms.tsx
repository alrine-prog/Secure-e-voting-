import Nav from '../components/Nav';

export default function TermsPage() {
  return (
    <div className="container">
      <Nav />
      <h2>Terms & Conditions</h2>

      <section style={{ marginTop: 12 }}>
        <p>
          By using Secure E‑Voting, you agree to follow institutional policies and these terms. The platform provides
          tools to manage elections but each institution remains responsible for election legality, eligibility rules,
          and handling of disputes.
        </p>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Liability</h3>
        <p>
          Alrine Technology provides this software AS IS. We are not liable for institutional decisions or external misuse.
          Institutions should review local regulations to ensure compliance.
        </p>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Changes</h3>
        <p>
          We may update terms or policies; material changes will be communicated to system owners via email or the admin interface.
        </p>
      </section>

      <hr style={{ marginTop: 24 }} />
      <footer style={{ marginTop: 18, color: '#6b7280' }}>
        <p>Secure-e-voting is the product of Alrine Technology — all rights reserved.</p>
      </footer>
    </div>
  );
}
