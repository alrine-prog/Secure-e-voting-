import { useState } from 'react';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: any) => {
    e?.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide name, email and a message.');
      return;
    }

    setStatus('sending');
    const res = await apiFetch('/support', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, subject, message }),
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
  };

  return (
    <div className="container">
      <Nav />
      <h2>Contact & Support</h2>
      <p>If you need help with Secure E‑Voting, use the form below or the contact details at the bottom.</p>

      <form onSubmit={submit} style={{ marginTop: 18 }}>
        <label>Name *</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

        <label>Email *</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Phone (optional)</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>Subject</label>
        <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />

        <label>Message *</label>
        <textarea className="input" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />

        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {status === 'sent' && <p style={{ color: '#16a34a' }}>Message sent — we'll get back to you soon.</p>}

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'}</button>
        </div>
      </form>

      <hr style={{ marginTop: 24 }} />

      <section style={{ marginTop: 8 }}>
        <h3>Contact info</h3>
        <p><strong>Email:</strong> <a href="mailto:albertjesocen@gmail.com">albertjesocen@gmail.com</a></p>
        <p><strong>Phone:</strong> +256 785 157 237 / +256 709 813 462</p>
        <p><strong>Location:</strong> Lira City, Ayago Trading Center</p>
        <p>
          <strong>WhatsApp:</strong>{' '}
          <a href="https://wa.me/256785157237" target="_blank" rel="noopener noreferrer">Chat on WhatsApp (+256 785 157 237)</a>
        </p>
      </section>

      <footer style={{ marginTop: 28, color: '#6b7280', fontSize: 14 }}>
        <hr />
        <p>Secure-e-voting is the product of Alrine Technology — all rights reserved.</p>
      </footer>
    </div>
  );
  }
