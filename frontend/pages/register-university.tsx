import { useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import { apiFetch } from '../lib/api';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Global type declaration for Google reCAPTCHA v3
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function RegisterUniversityPage() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [districtCity, setDistrictCity] = useState('');

  // Admin fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || !country.trim() || !districtCity.trim() || !username.trim() || !firstName.trim() || !email.trim() || !password) {
      setMessage('Please fill all required fields (marked *).');
      setStatus('error');
      return;
    }

    setStatus('submitting');

    // Generate reCAPTCHA v3 token if script and key exist
    let recaptchaToken: string | undefined = undefined;
    if (SITE_KEY && window.grecaptcha) {
      try {
        recaptchaToken = await window.grecaptcha.execute(SITE_KEY, { action: 'register_university' });
      } catch (err) {
        console.error('reCAPTCHA execution failed:', err);
      }
    }

    const payload = {
      name,
      country,
      districtCity,
      admin: {
        username,
        firstName,
        secondName,
        email,
        phone,
        password,
      },
      recaptchaToken,
    };

    try {
      const res = await apiFetch('/universities/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setMessage(res.body?.error || 'Registration failed');
        setStatus('error');
        return;
      }

      setMessage('Registration submitted — your university will be reviewed by the system owner.');
      setStatus('success');

      // Reset form state
      setName('');
      setCountry('');
      setDistrictCity('');
      setUsername('');
      setFirstName('');
      setSecondName('');
      setEmail('');
      setPhone('');
      setPassword('');
    } catch (err) {
      setMessage('An error occurred during registration. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Register University - Secure-e-voting</title>
        {SITE_KEY && (
          <script
