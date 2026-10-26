import { useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Declare grecaptcha on global window object for TypeScript support
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
      // Execute reCAPTCHA v3 if configured and script loaded
      let recaptchaToken: string | undefined = undefined;
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
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Contact & Support - Secure E-Voting</title>
        {siteKey && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
            async
            defer
          />
        )}
      </Head>

      <div className="container">
        <Nav />
        <h2>Contact & Support</h2>
        <p>If you need help with Secure E‑Voting, use the form below or the contact details at the bottom.</p>

        <form onSubmit={submit} style={{ marginTop: 18 }}>
          <label htmlFor="contact-name">Name *</label>
          <input
            id="contact-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="contact-email">Email *</label>
          <input
            id="contact-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="contact-phone">Phone (optional)</label>
          <input
            id="contact-phone"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label htmlFor="contact-subject">Subject</label>
          <input
            id="contact-subject"
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <label htmlFor="contact-message">Message *</label>
          <textarea
            id="contact-message"
            className="input"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          {error && <p style={{ color: '#dc2626', marginTop: 8 }}>{error}</p>}
          {status === 'sent' && (
            <p style={{ color: '#16a34a', marginTop: 8 }}>
              Message sent — we'll get back to you soon.
            </p>
          )}

          <div style={{ marginTop: 12 }}>
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>

        <hr style={{ marginTop: 24 }} />

        <section style={{ marginTop: 8 }}>
          <h3>Contact info</h3>
          <p>
            <strong>Email:</strong> <a href="mailto:albertjesocen@gmail.com">albertjesocen@gmail.com</a>
          </p>
          <p>
            <strong>Phone:</strong> +256 785 157 237 / +256 709 813 462
          </p>
          <p>
            <strong>Location:</strong> Lira City, Ayago Trading Center
          </p>
          <p>
            <strong>WhatsApp:</strong>{' '}
            <a href="https://wa.me/256785157237" target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp (+256 785 157 237)
            </a>
          </p>
        </section>

        <footer style={{ marginTop: 28, color: '#6b7280', fontSize: 14 }}>
          <hr />
          <p>Secure-e-voting is the product of Alrine Technology — all rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
