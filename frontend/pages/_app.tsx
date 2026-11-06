import '../styles/globals.css';
import '../styles/nav.css';
import '../styles/landing.css';
import '../styles/logo-section.css';
import '../styles/public-pages.css';
import '../styles/dashboard.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
