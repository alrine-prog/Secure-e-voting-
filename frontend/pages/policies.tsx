import Head from 'next/head';
import Nav from '../components/Nav';

const policySections = [
  { number: '01', title: 'Privacy', body: 'We collect the personal information needed to administer institutional elections, such as names, contact details, and verification tokens. Access controls are used to protect information within the platform.' },
  { number: '02', title: 'Data retention', body: 'Voting tokens and ballots are retained according to the relevant institutional policy. Voter information may be retained for administration and audit purposes. Contact support with questions about data handling.' },
  { number: '03', title: 'Acceptable use', body: 'Users must not attempt to disrupt or manipulate the system or share account credentials. Misuse may result in access restrictions and further action under applicable institutional rules.' },
];

export default function PoliciesPage() {
  return (
    <div className="public-page">
      <Head><title>Policies | Secure E-Voting</title><meta name="description" content="Review privacy, data retention, and acceptable-use policies for Secure E-Voting." /></Head>
      <Nav />
      <main className="public-main legal-main">
        <header className="public-hero"><span className="public-eyebrow">Platform governance</span><h1>Policies</h1><p>Our policies explain how the platform supports responsible and transparent institutional elections.</p></header>
        <div className="legal-card public-card">
          {policySections.map((section) => <section className="legal-section" key={section.number}><span className="info-card-number">{section.number}</span><div><h2>{section.title}</h2><p>{section.body}</p></div></section>)}
          <div className="legal-contact"><span>Need clarification about a policy?</span><a href="/contact">Contact support <span aria-hidden="true">→</span></a></div>
        </div>
      </main>
      <footer className="public-footer"><span>Secure E-Voting</span><p>Secure E-Voting is the product of Alrine Technology. All rights reserved 2026.</p></footer>
    </div>
  );
}
