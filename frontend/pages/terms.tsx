import Head from 'next/head';
import Nav from '../components/Nav';

const termsSections = [
  {
    number: '01',
    title: 'Acceptance and scope',
    body: 'These Terms of Use apply to Secure E-Voting and its participating universities, institutions, administrators, staff, voters, and observers. By registering an institution, creating an account, or using the service, you agree to these terms and the applicable platform policies. Institutions remain responsible for their election rules, eligibility decisions, approvals, and compliance with laws and institutional requirements.'
  },
  {
    number: '02',
    title: 'Annual maintenance contribution',
    body: 'Each participating university or institution is required to pay an annual service and maintenance contribution of UGX 500,000 (five hundred thousand Uganda shillings) for continued access to the service and its ongoing maintenance. The contribution is payable annually on the date stated in the invoice or renewal notice issued to the institution. The institution is responsible for making payment by the stated due date and keeping its billing contact details current. If payment is overdue, the provider may give notice and restrict or suspend the institution’s access while the amount remains unpaid; continued non-payment may result in termination. Any applicable taxes or different payment arrangements will be stated in the invoice or agreed in writing.'
  },
  {
    number: '03',
    title: 'Information collected during registration',
    body: 'When an institution registers, the service may collect the institution name, country, district or city, and the initial administrator’s name, username, email address, phone number, and profile photo. The administrator also provides a password, which is processed to create account credentials and is stored in protected, hashed form rather than as readable text. During later use, the service may also process account roles and status, voter registration and eligibility information, election and candidate details, voting records needed to operate elections, audit logs, and support messages. Institutions and their authorized staff must provide appropriate notices and have a valid basis for submitting information about other people.'
  },
  {
    number: '04',
    title: 'How information is used and protected',
    body: 'Registration and service data are used to review and approve institutions, create and secure accounts, provide role-based access, administer elections and voter eligibility, communicate service and account notices, provide support, maintain and troubleshoot the platform, detect misuse, create audit records, and meet applicable legal obligations. Data is not sold. Access should be limited to authorized people and service providers who need it to operate or support the service and are expected to protect it. The provider will apply reasonable technical and organizational safeguards, but no online service can guarantee absolute security. Institutions must protect their credentials, use the service only for authorized purposes, and promptly report suspected unauthorized access or disclosure through the support channel.'
  },
  {
    number: '05',
    title: 'Acceptable use and data responsibilities',
    body: 'Users must not access or disclose data without authorization, share credentials, interfere with elections, attempt to bypass access controls, upload unlawful or harmful content, or use the service in a way that violates applicable law or platform policies. Institutions are responsible for ensuring that personal information they collect or upload is accurate, relevant, appropriately authorized, and handled in accordance with their own privacy obligations. Users must promptly notify the institution and provider if they discover misuse, a suspected data breach, or a compromise of election information.'
  },
  {
    number: '06',
    title: 'Suspension and termination',
    body: 'The provider may temporarily restrict or suspend an account or institution where reasonably necessary to protect users, election integrity, platform security, or personal data; investigate suspected misuse; respond to a legal requirement; or address an unpaid annual contribution after notice. Serious or repeated misuse—including unauthorized access, unlawful disclosure, or handling of personal data that compromises applicable data-protection policies—may lead to immediate suspension while the matter is investigated and may result in termination. Where appropriate and lawful, the institution will be notified of the issue and given an opportunity to explain or remedy it. The provider may terminate service for a material or repeated breach of these terms, failure to meet applicable payment obligations after notice, or where continued service would create a legal or significant security risk.'
  },
  {
    number: '07',
    title: 'Effect of termination and retention',
    body: 'When service ends, affected accounts may lose access to the platform. The institution should make any needed export or retention arrangements before termination, subject to available export features and applicable law. Personal information will be retained only for as long as needed for the stated purposes, legitimate operational and audit needs, or legal obligations, and then deleted or de-identified where reasonably practicable. Termination does not remove an institution’s responsibility to preserve election records or meet its own legal and institutional retention duties. Any refund or outstanding payment treatment will be governed by the invoice or a separate written agreement; these terms do not promise a refund.'
  },
  {
    number: '08',
    title: 'Service changes and updates to terms',
    body: 'The provider may maintain, update, or modify the service to address operational, security, or legal needs. Material changes to these terms will be communicated through the service or to the institution’s registered contact where reasonably practicable. Continued use after an updated effective date means acceptance of the revised terms. If an institution does not agree, it should stop using the service and contact support to discuss ending the service and handling its data.'
  },
  {
    number: '09',
    title: 'Questions and contact',
    body: 'For questions about these terms, registration information, data handling, security concerns, or termination, contact the Secure E-Voting support team. This document provides general service terms and is not a substitute for legal advice; institutions should obtain advice about their specific legal and regulatory obligations.'
  }
];

export default function TermsPage() {
  return (
    <div className="public-page">
      <Head>
        <title>Terms of Use | Secure E-Voting</title>
        <meta name="description" content="Terms covering Secure E-Voting access, annual maintenance contributions, registration information, data use, and service suspension or termination." />
      </Head>
      <Nav />
      <main className="public-main legal-main">
        <header className="public-hero">
          <span className="public-eyebrow">Platform governance</span>
          <h1>Terms of Use</h1>
          <p>These terms explain service use, the annual maintenance contribution, information handling, and when access may be suspended or terminated.</p>
        </header>
        <div className="legal-card public-card">
          {termsSections.map((section) => (
            <section className="legal-section" key={section.number}>
              <span className="info-card-number">{section.number}</span>
              <div><h2>{section.title}</h2><p>{section.body}</p></div>
            </section>
          ))}
          <div className="legal-contact"><span>Questions about these terms?</span><a href="/contact">Contact support <span aria-hidden="true">→</span></a></div>
        </div>
      </main>
      <footer className="public-footer">
        <span>Secure E-Voting</span>
        <nav className="public-footer-links" aria-label="Footer navigation"><a href="/about">About</a><a href="/policies">Policies</a><a href="/contact">Support</a></nav>
        <p>Secure E-Voting System is Powered by Alrine Technology. All rights reserved 2026.</p>
      </footer>
    </div>
  );
}
