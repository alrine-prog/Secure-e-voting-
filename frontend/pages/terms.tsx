import Head from 'next/head';
import Nav from '../components/Nav';

export default function TermsPage() {
  return (
    <div className="public-page">
      <Head><title>Terms &amp; Conditions | Secure E-Voting</title><meta name="description" content="Terms for using the Secure E-Voting platform." /></Head>
      <Nav />
      <main className="public-main legal-main">
        <header className="public-hero"><span className="public-eyebrow">Platform governance</span><h1>Terms &amp; Conditions</h1><p>Please review these terms before using Secure E-Voting.</p></header>
        <div className="legal-card public-card">
          <section className="legal-section"><span className="info-card-number">01</span><div><h2>Use of the platform</h2><p>By using Secure E-Voting, you agree to follow institutional policies and these terms. The platform provides tools to manage elections; each institution remains responsible for election legality, eligibility rules, and handling disputes.</p></div></section>
          <section className="legal-section"><span className="info-card-number">02</span><div><h2>Liability</h2><p>Alrine Technology provides this software AS IS. We are not liable for institutional decisions or external misuse. Institutions should review local regulations to ensure compliance.</p></div></section>
          <section className="legal-section"><span className="info-card-number">03</span><div><h2>Changes to these terms</h2><p>We may update these terms or policies. Material changes will be communicated to system owners via email or the admin interface.</p></div></section>
          <div className="legal-contact"><span>Questions about these terms?</span><a href="/contact">Contact support <span aria-hidden="true">→</span></a></div>
        </div>
      </main>
      <footer className="public-footer"><span>Secure E-Voting</span><p>Secure E-Voting is the product of Alrine Technology. All rights reserved 2026.</p></footer>
    </div>
  );
}
