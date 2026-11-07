import Link from 'next/link';
import Head from 'next/head';
import Nav from '../components/Nav';

const faqs = [
  { question: 'Who is Secure E-Voting for?', answer: 'Secure E-Voting is designed for universities and institutions that need to organize elections for their communities.' },
  { question: 'How do voters access a ballot?', answer: 'Eligible voters can sign in with their institutional account or use a single-use voting token issued for their election.' },
  { question: 'Can election teams review activity?', answer: 'The platform includes administrative audit logs and tools to review election progress and results.' },
  { question: 'How can our institution get started?', answer: 'Register your university to submit your institution for onboarding and approval.' },
];

const communities = [
  { monogram: 'U', label: 'UNIVERSITIES' },
  { monogram: 'SC', label: 'STUDENT COUNCILS' },
  { monogram: 'EC', label: 'ELECTION COMMITTEES' },
  { monogram: 'CC', label: 'CAMPUS COMMUNITIES' },
];

export default function HomePage() {
  return (
    <div className="landing-page premium-home">
      <Head>
        <title>Secure E-Voting | Trusted campus elections</title>
        <meta name="description" content="A secure, transparent election platform for universities and institutions." />
      </Head>

      <header className="landing-header">
        <div className="landing-nav-shell"><Nav /></div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-content">
            <span className="landing-eyebrow"><span className="eyebrow-dot" /> Digital elections for institutions</span>
            <h1>Trust in every vote.<br /><span>Confidence in every result.</span></h1>
            <p>Run university elections with a clear, auditable process—from institution onboarding and voter registration to results review.</p>
            <div className="landing-actions">
              <a className="landing-button primary" href="#demo">Explore the demo <span aria-hidden="true">→</span></a>
              <Link className="landing-button secondary" href="/about">Discover the platform</Link>
            </div>
            <div className="hero-trust"><span aria-hidden="true">✓</span> A unified election experience for your campus community</div>
          </div>
          <div className="hero-image-wrap">
            <img className="hero-image" src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=200&q=85" alt="University students gathered on campus" />
            <div className="hero-image-caption"><span className="caption-icon" aria-hidden="true">✓</span><span><strong>Every voice has a place.</strong><small>Purpose-built for institutional elections</small></span></div>
          </div>
        </section>

        <section className="campus-logo-section" aria-labelledby="campus-logo-title">
          <p id="campus-logo-title">Supporting the communities that shape campus life</p>
          <div className="campus-logo-list">
            {communities.map((community) => <div className="campus-logo" key={community.label}><span className="campus-logo-mark" aria-hidden="true">{community.monogram}</span><span>{community.label}</span></div>)}
          </div>
        </section>

        <section className="landing-benefits" aria-label="Platform principles">
          <article><span className="benefit-icon purple" aria-hidden="true">⌑</span><div><h2>Privacy-conscious</h2><p>Support ballot privacy through a clear voter workflow.</p></div></article>
          <article><span className="benefit-icon green" aria-hidden="true">✓</span><div><h2>Built for oversight</h2><p>Keep administrative activity available for review.</p></div></article>
          <article><span className="benefit-icon blue" aria-hidden="true">↗</span><div><h2>One connected process</h2><p>Coordinate election tasks in one platform.</p></div></article>
        </section>

        <section className="landing-how" id="how-it-works">
          <div className="section-heading"><span className="landing-eyebrow">A considered approach</span><h2>From election setup to results review.</h2><p>Give administrators practical tools and give voters a straightforward way to participate.</p></div>
          <div className="feature-grid">
            <article className="feature-card"><img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80" alt="Graduates celebrating together" /><div><span className="feature-number">01 / ORGANIZE</span><h3>Prepare the election</h3><p>Set election details, manage eligible voters, and coordinate your team.</p></div></article>
            <article className="feature-card"><img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80" alt="Students collaborating at a university" /><div><span className="feature-number">02 / PARTICIPATE</span><h3>Enable participation</h3><p>Offer eligible voters a clear and accessible process to cast a ballot.</p></div></article>
            <article className="feature-card"><img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80" alt="Instructor and students in a classroom" /><div><span className="feature-number">03 / REVIEW</span><h3>Review the outcome</h3><p>Follow election progress and present results with useful oversight tools.</p></div></article>
          </div>
        </section>

        <section className="landing-workflow">
          <div className="workflow-image"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=100&q=85" alt="A team working together around a table" /><div className="workflow-note"><span>✓</span><div><strong>One coordinated workflow</strong><small>For administrators, staff, and voters</small></div></div></div>
          <div className="workflow-copy"><span className="landing-eyebrow">How it works</span><h2>A clear process makes elections easier to manage.</h2><p>Bring the essential stages of an institutional election together in a practical, role-based workflow.</p>
            <ol className="workflow-list">
              <li><span>1</span><div><strong>Register your institution</strong><p>Submit university details for onboarding and approval.</p></div></li>
              <li><span>2</span><div><strong>Configure your election</strong><p>Set election details, staff roles, and voter registration.</p></div></li>
              <li><span>3</span><div><strong>Invite eligible voters</strong><p>Provide access through institutional credentials or voting tokens.</p></div></li>
              <li><span>4</span><div><strong>Review progress and results</strong><p>Use audit and observer tools to follow the election process.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="landing-security" id="security">
          <div className="security-copy"><span className="landing-eyebrow">Governance and accountability</span><h2>Designed to support trust at every stage.</h2><p>Equip election teams with practical access controls and tools to review administrative activity.</p><Link href="/policies" className="text-link">Review platform policies <span aria-hidden="true">→</span></Link></div>
          <div className="security-grid">
            <article><span className="security-icon">01</span><h3>Single-use voting tokens</h3><p>Support ballot access with tokens intended for one-time use.</p></article>
            <article><span className="security-icon">02</span><h3>Role-based access</h3><p>Separate responsibilities for administrators, staff, voters, and observers.</p></article>
            <article><span className="security-icon">03</span><h3>Administrative audit logs</h3><p>Keep a record of administrative actions for review and oversight.</p></article>
            <article><span className="security-icon">04</span><h3>Election oversight</h3><p>Provide observer tools to follow election progress and view results.</p></article>
          </div>
        </section>

        <section className="landing-demo" id="demo">
          <div className="demo-copy"><span className="landing-eyebrow">Platform preview</span><h2>See election oversight in action.</h2><p>Explore the live tally view and see how election progress can be presented clearly to your community.</p><Link className="landing-button primary" href="/observer/live-tally">Open the live demo <span aria-hidden="true">→</span></Link></div>
          <div className="demo-preview" aria-label="Illustration of an election results dashboard"><div className="preview-top"><span><i /> ELECTION OVERVIEW</span><span className="preview-menu">•••</span></div><h3>Campus leadership election</h3><p className="preview-subtitle">Illustrative dashboard preview</p><div className="preview-stat"><span>Voter participation</span><strong>68.4%</strong></div><div className="progress-track"><span /></div><div className="preview-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="preview-foot"><span>Example visualization</span><span className="preview-check">✓ Audit tools</span></div></div>
        </section>

        <section className="landing-use-cases"><div className="section-heading"><span className="landing-eyebrow">For your institution</span><h2>Purposeful tools for every role in the election.</h2><p>Support election work across your institution with clear, role-appropriate access.</p></div>
          <div className="use-case-grid"><article><span className="use-case-icon">⌂</span><h3>University administrators</h3><p>Manage institutional registration, election setup, and team access.</p></article><article><span className="use-case-icon">◎</span><h3>Election staff</h3><p>Coordinate voter registration and keep election operations organized.</p></article><article><span className="use-case-icon">✓</span><h3>Voters and observers</h3><p>Access ballots as an eligible voter or follow election results as an observer.</p></article></div>
        </section>

        <section className="landing-faq" id="faq"><div className="faq-heading"><span className="landing-eyebrow">Frequently asked questions</span><h2>Helpful details, clearly answered.</h2><p>Have another question? <Link href="/contact">Contact our support team.</Link></p></div><div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>

        <section className="landing-final-cta"><div><span className="landing-eyebrow">For universities and institutions</span><h2>Bring clarity to your next institutional election.</h2></div><Link className="landing-button light" href="/register-university">Register your university <span aria-hidden="true">→</span></Link></section>
      </main>

      <footer className="landing-footer"><Link href="/" className="footer-brand">Secure<span>Vote</span></Link><div className="footer-links"><Link href="/about">About us</Link><Link href="/policies">Policies</Link><Link href="/contact">Support</Link><a href="#faq">FAQs</a></div><a href="#demo" className="footer-demo-link">View the demo <span aria-hidden="true">→</span></a><p>Secure E-Voting is Powered by Alrine Technology. All rights reserved 2026.</p></footer>
    </div>
  );
}
