import Head from 'next/head';
import Nav from '../components/Nav';

export default function AboutPage() {
  return (
    <div className="public-page">
      <Head><title>About | Secure E-Voting</title><meta name="description" content="Learn about Secure E-Voting and our mission to support transparent institutional elections." /></Head>
      <Nav />
      <main className="public-main">
        <header className="public-hero">
          <span className="public-eyebrow">About the platform</span>
          <h1>Better processes for meaningful elections.</h1>
          <p>Secure E-Voting is an online election platform built for universities and institutions, bringing election operations into a clear, role-based workflow.</p>
        </header>
        <section className="public-card story-card">
          <div className="story-mark" aria-hidden="true">✓</div>
          <div><span className="public-eyebrow">Our mission</span><h2>Make institutional elections easier to administer and easier to trust.</h2><p>We aim to help educational communities organize elections with privacy, accountability, and simplicity in mind. From registering an institution to managing voters and reviewing results, the platform supports the key steps in one place.</p></div>
        </section>
        <section className="public-section-heading"><span className="public-eyebrow">What guides us</span><h2>Designed around the needs of your community.</h2></section>
        <div className="public-info-grid">
          <article className="public-card info-card"><span className="info-card-number">01</span><h3>Privacy &amp; participation</h3><p>Support ballot privacy with single-use voting tokens and a straightforward voter experience.</p></article>
          <article className="public-card info-card"><span className="info-card-number">02</span><h3>Clear responsibilities</h3><p>Role-based access helps distinguish system owners, university administrators, staff, voters, and observers.</p></article>
          <article className="public-card info-card"><span className="info-card-number">03</span><h3>Accountability</h3><p>Audit logs and observer tools help election teams review administrative activity and election progress.</p></article>
        </div>
        <div className="public-cta-strip"><div><span className="public-eyebrow">Get started</span><h2>Bring your institution’s election process together.</h2></div><a className="public-submit" href="/register-university">Register your university <span aria-hidden="true">→</span></a></div>
      </main>
      <footer className="public-footer"><span>Secure E-Voting</span><p>Secure E-Voting is the product of Alrine Technology. All rights reserved 2026.</p></footer>
    </div>
  );
}
