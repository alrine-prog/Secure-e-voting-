import navigation from '../components/navigation';

export default function PoliciesPage() {
  return (
    <div className="container">
      <navigation />
      <h2>Policies</h2>

      <section style={{ marginTop: 12 }}>
        <h3>Privacy</h3>
        <p>
          We collect only the minimum necessary personal information required to run elections:
          names, contact details, and verification tokens. Data is stored securely and protected by access controls.
        </p>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Data Retention</h3>
        <p>
          Voting tokens and ballots are retained as required by institutional policy. PII for voters may be retained
          for administrative and audit purposes; please contact support for data deletion requests.
        </p>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Acceptable Use</h3>
        <p>
          Users must not attempt to disrupt or manipulate the system, nor share credentials. Violations may lead to
          suspension or legal action.
        </p>
      </section>

      <hr style={{ marginTop: 24 }} />
      <footer style={{ marginTop: 18, color: '#6b7280' }}>
        <p>Secure-e-voting is the product of Alrine Technology — all rights reserved.</p>
      </footer>
    </div>
  );
}
