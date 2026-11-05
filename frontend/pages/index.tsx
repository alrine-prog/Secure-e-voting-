import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  {
    question: 'Who can use Secure E-Voting?',
    answer: 'The platform is designed for universities and institutions that need to organize elections for their communities.',
  },
  {
    question: 'How do voters access a ballot?',
    answer: 'Voters can use the sign-in flow or a single-use voting token issued for their election.',
  },
  {
    question: 'Can election teams review activity?',
    answer: 'The platform includes audit logs for administrative actions and tools to review election progress and results.',
  },
  {
    question: 'How can our institution get started?',
    answer: 'Use the university registration link to submit your institution for the platform onboarding and approval workflow.',
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <nav className="landing-nav" aria-label="Main navigation">
          <div className="landing-links">
            <Link href="/" className="landing-brand" aria-label="Secure E-Voting homepage">
              <span className="brand-mark" aria-hidden="true">✓</span>
              <span>Secure<span className="brand-accent">Vote</span></span>
            </Link>
            <div className="primary-links">
              <Link href="/" aria-current="page">Homepage</Link>
              <Link href="/about">About us</Link>
              <Link href="/policies">Policies</Link>
              <Link href="/contact">Support</Link>
            </div>
          </div>

          <div className="landing-menu-wrap">
            <button
              type="button"
              className="landing-menu-button"
              aria-label="Open sign-in and registration menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true">•••</span>
            </button>
            {menuOpen && (
              <div className="landing-dropdown" role="menu">
                <Link href="/login" role="menuitem" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/register-university" role="menuitem" onClick={() => setMenuOpen(false)}>Register your university</Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-content">
            <span className="landing-eyebrow"><span className="eyebrow-dot" /> Trusted elections start here</span>
            <h1>Every vote matters.<br /><span>Make it count.</span></h1>
            <p>A simpler, more transparent way for universities to run elections—from voter registration to verified results.</p>
            <div className="landing-actions">
              <a className="landing-button primary" href="#demo">Explore the demo <span aria-hidden="true">→</span></a>
              <Link className="landing-button secondary" href="/about">Discover the platform</Link>
            </div>
            <div className="hero-trust"><span aria-hidden="true">✓</span> Designed for secure, auditable campus elections</div>
          </div>
          <div className="hero-image-wrap">
            <img className="hero-image" src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=85" alt="University students gathered on campus" />
            <div className="hero-image-caption"><span className="caption-icon" aria-hidden="true">✓</span><span><strong>One campus. Every voice.</strong><small>Voting made accessible to your community</small></span></div>
          </div>
        </section>

        <section className="landing-benefits" aria-label="Platform benefits">
          <article><span className="benefit-icon purple" aria-hidden="true">⌑</span><div><h2>Private by design</h2><p>Keep voter identity separate from ballot choices.</p></div></article>
          <article><span className="benefit-icon green" aria-hidden="true">✓</span><div><h2>Transparent process</h2><p>Follow election activity with clear audit trails.</p></div></article>
          <article><span className="benefit-icon blue" aria-hidden="true">↗</span><div><h2>Simple to manage</h2><p>Run the full election workflow in one place.</p></div></article>
        </section>

        <section className="landing-how" id="how-it-works">
          <div className="section-heading">
            <span className="landing-eyebrow">A clearer way to vote</span>
            <h2>From setup to results, all in one place.</h2>
            <p>Give election teams the tools to organize a vote and give voters a straightforward way to take part.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card"><img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80" alt="Graduates celebrating together" /><div><span className="feature-number">01 / ORGANIZE</span><h3>Prepare your election</h3><p>Set up election details, manage eligible voters, and coordinate your team.</p></div></article>
            <article className="feature-card"><img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80" alt="Students collaborating at a university" /><div><span className="feature-number">02 / PARTICIPATE</span><h3>Make every voice count</h3><p>Provide voters with a clear, accessible process to cast their ballot.</p></div></article>
            <article className="feature-card"><img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80" alt="Instructor and students in a classroom" /><div><span className="feature-number">03 / REVIEW</span><h3>See a transparent outcome</h3><p>Review election progress and results with useful oversight tools.</p></div></article>
          </div>
        </section>

        <section className="landing-workflow">
          <div className="workflow-image">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=85" alt="A team working together around a table" />
            <div className="workflow-note"><span>✓</span><div><strong>One organized workflow</strong><small>For administrators, staff, and voters</small></div></div>
          </div>
          <div className="workflow-copy">
            <span className="landing-eyebrow">How it works</span>
            <h2>Good elections are easier when the process is clear.</h2>
            <p>Bring the key stages of an institutional election together in a straightforward workflow.</p>
            <ol className="workflow-list">
              <li><span>1</span><div><strong>Register your institution</strong><p>Submit your university details for onboarding and approval.</p></div></li>
              <li><span>2</span><div><strong>Set up the election</strong><p>Configure the election, roles, staff, and voter registration.</p></div></li>
              <li><span>3</span><div><strong>Invite voters to participate</strong><p>Give eligible voters access through their credentials or voting tokens.</p></div></li>
              <li><span>4</span><div><strong>Review progress and results</strong><p>Use audit and observer tools to follow the election process.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="landing-security" id="security">
          <div className="security-copy">
            <span className="landing-eyebrow">Built around accountability</span>
            <h2>Security and transparency belong in every step.</h2>
            <p>Give your election team practical controls for managing participation and reviewing administrative activity.</p>
            <Link href="/policies" className="text-link">Read our policies <span aria-hidden="true">→</span></Link>
          </div>
          <div className="security-grid">
            <article><span className="security-icon">01</span><h3>Single-use voting tokens</h3><p>Support ballot access with tokens intended for one-time use.</p></article>
            <article><span className="security-icon">02</span><h3>Role-based access</h3><p>Separate responsibilities for system owners, university admins, staff, and voters.</p></article>
            <article><span className="security-icon">03</span><h3>Administrative audit logs</h3><p>Keep a record of administrative actions for review and oversight.</p></article>
            <article><span className="security-icon">04</span><h3>Election oversight</h3><p>Provide observer tools to follow election progress and view results.</p></article>
          </div>
        </section>

        <section className="landing-demo" id="demo">
          <div className="demo-copy">
            <span className="landing-eyebrow">See it in action</span>
            <h2>Take a look at the demo.</h2>
            <p>Explore the live tally view to see how election results can be presented clearly to your community.</p>
            <Link className="landing-button primary" href="/observer/live-tally">Open the live demo <span aria-hidden="true">→</span></Link>
          </div>
          <div className="demo-preview" aria-label="Illustration of an election results dashboard">
            <div className="preview-top"><span><i /> LIVE ELECTION</span><span className="preview-menu">•••</span></div>
            <h3>Election overview</h3><p className="preview-subtitle">Campus leadership election</p>
            <div className="preview-stat"><span>Voter participation</span><strong>68.4%</strong></div>
            <div className="progress-track"><span /></div>
            <div className="preview-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="preview-foot"><span>Results are updated during the election</span><span className="preview-check">✓ Auditable</span></div>
          </div>
        </section>

        <section className="landing-use-cases">
          <div className="section-heading">
            <span className="landing-eyebrow">Made for your community</span>
            <h2>One platform for the people who make elections happen.</h2>
            <p>Support election work across the institution with clear, role-appropriate tools.</p>
          </div>
          <div className="use-case-grid">
            <article><span className="use-case-icon">⌂</span><h3>University administrators</h3><p>Manage institutional registration, election setup, and team access.</p></article>
            <article><span className="use-case-icon">◎</span><h3>Election staff</h3><p>Coordinate voter registration and help keep election operations organized.</p></article>
            <article><span className="use-case-icon">✓</span><h3>Voters and observers</h3><p>Access ballots as an eligible voter or follow election results as an observer.</p></article>
          </div>
        </section>

        <section className="landing-faq" id="faq">
          <div className="faq-heading"><span className="landing-eyebrow">Questions, answered</span><h2>Frequently asked questions</h2><p>Need more help? <Link href="/contact">Contact our support team.</Link></p></div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="landing-final-cta">
          <div><span className="landing-eyebrow">For universities and institutions</span><h2>Ready to make your next election simpler?</h2></div>
          <Link className="landing-button light" href="/register-university">Register your university <span aria-hidden="true">→</span></Link>
        </section>
      </main>

      <footer className="landing-footer">
        <Link href="/" className="footer-brand">Secure<span>Vote</span></Link>
        <div className="footer-links"><Link href="/about">About us</Link><Link href="/policies">Policies</Link><Link href="/contact">Support</Link><a href="#faq">FAQs</a></div>
        <a href="#demo" className="footer-demo-link">View the demo <span aria-hidden="true">→</span></a>
        <p>Secure E-Voting is the product of Alrine Technology. All rights reserved 2026.</p>
      </footer>
    </div>
  );
}
