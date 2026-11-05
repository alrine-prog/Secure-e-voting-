import Link from 'next/link';
import { useState } from 'react';

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
                <Link href="/login" role="menuitem" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
                <Link href="/register-university" role="menuitem" onClick={() => setMenuOpen(false)}>
                  Register your university
                </Link>
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
            <p>
              A simpler, more transparent way for universities to run elections—from voter
              registration to verified results.
            </p>
            <div className="landing-actions">
              <a className="landing-button primary" href="#demo">Explore the demo <span aria-hidden="true">→</span></a>
              <Link className="landing-button secondary" href="/about">Discover the platform</Link>
            </div>
            <div className="hero-trust"><span aria-hidden="true">✓</span> Designed for secure, auditable campus elections</div>
          </div>
          <div className="hero-image-wrap">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=85"
              alt="University students gathered on campus"
            />
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
            <article className="feature-card">
              <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80" alt="Graduates celebrating together" />
              <div><span className="feature-number">01 / ORGANIZE</span><h3>Prepare your election</h3><p>Set up election details, manage eligible voters, and coordinate your team.</p></div>
            </article>
            <article className="feature-card">
              <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80" alt="Students collaborating at a university" />
              <div><span className="feature-number">02 / PARTICIPATE</span><h3>Make every voice count</h3><p>Provide voters with a clear, accessible process to cast their ballot.</p></div>
            </article>
            <article className="feature-card">
              <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80" alt="Instructor and students in a classroom" />
              <div><span className="feature-number">03 / REVIEW</span><h3>See a transparent outcome</h3><p>Review election progress and results with useful oversight tools.</p></div>
            </article>
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
            <h3>Election overview</h3>
            <p className="preview-subtitle">Campus leadership election</p>
            <div className="preview-stat"><span>Voter participation</span><strong>68.4%</strong></div>
            <div className="progress-track"><span /></div>
            <div className="preview-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="preview-foot"><span>Results are updated during the election</span><span className="preview-check">✓ Auditable</span></div>
          </div>
        </section>

        <section className="landing-final-cta">
          <div><span className="landing-eyebrow">For universities and institutions</span><h2>Ready to make your next election simpler?</h2></div>
          <Link className="landing-button light" href="/register-university">Register your university <span aria-hidden="true">→</span></Link>
        </section>
      </main>

      <footer className="landing-footer">
        <Link href="/" className="footer-brand">Secure<span>Vote</span></Link>
        <a href="#demo" className="footer-demo-link">View the demo <span aria-hidden="true">→</span></a>
        <p>Secure E-Voting is the product of Alrine Technology. All rights reserved 2026.</p>
      </footer>
    </div>
  );
}
