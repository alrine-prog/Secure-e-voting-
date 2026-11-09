import '../styles/globals.css';
import '../styles/nav.css';
import '../styles/landing.css';
import '../styles/logo-section.css';
import '../styles/public-pages.css';
import '../styles/dashboard.css';
import '../styles/responsive-overrides.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return 
    <Head><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /></Head>
    Component {...pageProps}
}
