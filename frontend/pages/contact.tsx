import { useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide name, email, and a message.');
      return;
    }

    setStatus('sending');
    try {
      let recaptchaToken: string | undefined;
      if (siteKey && window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'contact' });
      }
      const res = await apiFetch('/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message, recaptchaToken }),
      });
      if (!res.ok) {
        setError(res.body?.error || 'Failed to send message');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Contact &amp; Support | Secure E-Voting</title>
        <meta name="description" content="Contact the Secure E-Voting support team for help with your institution or election." />
        {siteKey && <script src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`} async defer />}
      </Head>
      <div className="public-page">
        <Nav />
        <main className="public-main contact-main">
          <header className="public-hero">
            <span className="public-eyebrow">We’re here to help</span>
            <h1>Contact &amp; Support</h1>
            <p>Talk to our team about onboarding, election operations, or a question about the platform.</p>
          </header>
          <div className="contact-layout">
            <section className="public-card contact-form-card">
              <div className="card-heading"><span className="public-eyebrow">Send us a message</span><h2>How can we help?</h2><p>Fields marked with * are required.</p></div>
              <form onSubmit={submit} className="public-form">
                <div className="form-two-column">
                  <div className="form-field"><label htmlFor="contact-name">Name *</label><input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                  <div className="form-field"><label htmlFor="contact-email">Email *</label><input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="form-field"><label htmlFor="contact-phone">Phone</label><input id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                  <div className="form-field"><label htmlFor="contact-subject">Subject</label><input id="contact-subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
                  <div className="form-field form-field-wide"><label htmlFor="contact-message">Message *</label><textarea id="contact-message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required /></div>
                </div>
                {error && <p className="form-message error-message" role="alert">{error}</p>}
                {status === 'sent' && <p className="form-message success-message" role="status">Message sent — we’ll get back to you soon.</p>}
                <button className="public-submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'} <span aria-hidden="true">→</span></button>
              </form>
            </section>
            <aside className="public-card contact-details-card">
              <span className="public-eyebrow">Contact information</span>
              <h2>Reach our team</h2>
              <p className="contact-details-intro">Choose the channel that works best for you. We’ll be glad to assist.</p>
              <div className="contact-detail"><span className="contact-detail-icon" aria-hidden="true">@</span><div><small>Email</small><a href="mailto:albertjesocen@gmail.com">albertjesocen@gmail.com</a></div></div>
              <div className="contact-detail"><span className="contact-detail-icon" aria-hidden="true">☎</span><div><small>Phone</small><a href="tel:+256785157237">+256 785 157 237</a><a href="tel:+256709813462">+256 709 813 462</a></div></div>
              <div className="contact-detail"><span className="contact-detail-icon" aria-hidden="true">⌖</span><div><small>Office</small><span>Lira City, Ayago Trading Center</span></div></div>
              <a className="whatsapp-link" href="https://wa.me/256785157237" target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp <span aria-hidden="true">↗</span></a>
            </aside>
          </div>
        </main>
        <footer className="public-footer"><span>Secure E-Voting</span><nav className="public-footer-links" aria-label="Footer navigation"><a href="/about">About</a><a href="/policies">Policies</a><a href="/contact">Support</a></nav><p>Secure E-Voting is the product of Alrine Technology. All rights reserved 2026.</p></footer>
      </div>
    </>
  );
}
