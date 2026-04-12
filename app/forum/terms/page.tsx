'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const SECTIONS = [
  {
    id: 'agreement',
    label: 'User Agreement',
    icon: '📋',
    checkLabel: 'I have read and accept the User Agreement',
    content: `
## User Agreement

**Effective Date:** April 2025  
**Platform:** SL Tech Stack Forum — IT Services Freetown  
**Jurisdiction:** Republic of Sierra Leone

---

### 1. Eligibility
This forum is exclusively for verified IT technicians, engineers, and technology professionals operating within Sierra Leone and the wider West Africa region. By creating an account, you confirm that you are a qualified IT professional or actively pursuing a career in technology.

### 2. Account Responsibility
You are solely responsible for all activity that occurs under your registered account. You must:
- Keep your login credentials strictly confidential
- Immediately notify the platform administrator if you suspect unauthorized access
- Not share, sell, or transfer your account to any third party
- Maintain a professional and accurate profile at all times

### 3. Acceptable Use
You agree to use this platform only for lawful purposes and in ways that do not infringe the rights of others. Prohibited conduct includes:
- Posting content that is false, misleading, defamatory, or harmful
- Impersonating another professional, technician, or IT Services Freetown staff
- Attempting to gain unauthorized access to system resources, administrator tools, or other users' accounts
- Distributing malware, spyware, or any form of malicious code
- Using the forum to solicit clients away from IT Services Freetown in bad faith

### 4. Professional Standards
All forum members must uphold the highest professional standards. You agree to:
- Provide accurate technical advice to the best of your knowledge
- Clearly disclose any limitations or uncertainty in your technical responses
- Not engage in harassment, bullying, or discriminatory conduct toward any member

### 5. Content Ownership
You retain ownership of the content you post. However, by posting on this forum, you grant IT Services Freetown a non-exclusive, royalty-free, worldwide license to display, distribute, and use your content to operate and improve the platform.

### 6. Suspension & Termination
IT Services Freetown reserves the right to suspend or permanently ban any account, with or without notice, for violation of this agreement. Decisions made by the platform administrator are final.

### 7. Amendments
IT Services Freetown may update this agreement at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.
    `
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: '🔒',
    checkLabel: 'I have read and accept the Privacy Policy',
    content: `
## Privacy Policy

**Effective Date:** April 2025  
**Data Controller:** IT Services Freetown, 1 Regent Highway, Jui Junction, East Freetown, Sierra Leone

---

### 1. Information We Collect
When you register and use the SL Tech Stack Forum, we collect the following personal data:
- **Identity Data:** Your full name and profile photo (if provided)
- **Contact Data:** Your email address and phone number
- **Professional Data:** Your area of technical expertise and specialization
- **Usage Data:** Login timestamps, last seen activity, online/offline status, forum posts, and reactions
- **Technical Data:** IP address, browser type, device identifiers, and session tokens

### 2. How We Use Your Information
Your personal data is used to:
- Authenticate your identity and maintain your forum session
- Display your professional profile to other verified forum members
- Send transactional emails (account verification, password resets, administrator announcements)
- Enforce community standards and investigate violations
- Improve the platform's features and security
- Comply with applicable laws and regulations

### 3. Data Sharing
We do not sell, rent, or trade your personal information to third parties. Your data may be shared only in the following circumstances:
- **Service Providers:** We use limited third-party services (e.g. email delivery via SMTP) solely to operate the platform
- **Legal Compliance:** We may disclose data if required by Sierra Leone law or court order
- **Safety:** We may share data to prevent imminent harm to any person

### 4. Data Retention
Your personal data is retained for as long as your account is active. If your account is deleted or banned, identifiable data is removed within 30 days, except where retention is required by law.

### 5. Your Rights
You have the right to:
- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your account and associated data
- Withdraw consent where processing is based on consent

To exercise your rights, contact the administrator at **itservicesfreetown@gmail.com**.

### 6. Data Security
We implement industry-standard security measures including:
- Encrypted password storage using bcrypt hashing
- HTTP-only, secure session cookies
- Inactivity-based automatic session termination (5 minutes)
- Admin area protected by separate credentials
- HTTPS encryption on all data in transit

### 7. Cookies
This platform uses a single session cookie (\`forum_session\`) to maintain your login state. This cookie is destroyed when you log out or after 24 hours of inactivity. No advertising or tracking cookies are used.

### 8. Children's Privacy
This platform is not intended for persons under the age of 18. We do not knowingly collect data from minors.

### 9. Changes to This Policy
We will notify registered users by email of any material changes to this Privacy Policy before they take effect.
    `
  },
  {
    id: 'terms',
    label: 'Terms of Use',
    icon: '⚖️',
    checkLabel: 'I have read and accept the Terms of Use',
    content: `
## Terms of Use

**Effective Date:** April 2025  
**Platform:** SL Tech Stack Forum — IT Services Freetown

---

### 1. Nature of the Platform
The SL Tech Stack Forum is a private, invitation-based professional community operated by IT Services Freetown. It is not a public forum and access may be revoked at any time at the sole discretion of the platform administrators.

### 2. Technical Advice Disclaimer
Content posted on this forum is for informational and professional discussion purposes only. IT Services Freetown makes no warranties regarding the accuracy, completeness, or fitness of any technical advice shared by forum members. You assume all risk for decisions made based on forum content.

### 3. Prohibited Content
The following content is strictly prohibited and will result in immediate account termination:
- Posting proprietary client data, customer details, or confidential repair information
- Sharing pirated software, license keys, or circumvention tools
- Posting pornographic, violent, hateful, or illegal material
- Advertising competing businesses or external services without prior approval
- Any form of spam, chain messages, or unsolicited mass communication

### 4. Intellectual Property
All design elements, branding, logos, and original platform content are the property of IT Services Freetown. Unauthorized reproduction or commercial use is strictly prohibited.

### 5. Forum Etiquette
Members are expected to:
- Use professional language in all forum discussions
- Respect differing opinions and technical approaches
- Give credit when referencing another technician's solution
- Report suspected violations to the platform administrator rather than engaging directly

### 6. Administrator Authority
Platform administrators have full authority to:
- Edit, remove, or archive any forum post
- Reset passwords and revoke access
- Issue warnings, temporary suspensions, or permanent bans
- Broadcast platform-wide announcements

### 7. No Guarantee of Availability
IT Services Freetown does not guarantee uninterrupted access to the platform. We reserve the right to take the forum offline for maintenance, upgrades, or security reasons at any time.

### 8. Limitation of Liability
To the maximum extent permitted by Sierra Leone law, IT Services Freetown shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform or reliance on content posted herein.

### 9. Governing Law
These Terms of Use are governed by the laws of the Republic of Sierra Leone. Any disputes shall be resolved under the jurisdiction of the courts of Sierra Leone.

### 10. Contact
For any questions or concerns regarding these terms, contact:  
**Email:** itservicesfreetown@gmail.com  
**Phone:** +232 33 399 391  
**Address:** 1 Regent Highway, Jui Junction, East Freetown, Sierra Leone
    `
  }
];

export default function TermsPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState('agreement');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const allAccepted = SECTIONS.every(s => accepted[s.id]);

  const handleSubmit = async () => {
    if (!allAccepted) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/forum/auth/accept-terms', { method: 'POST' });
      if (res.ok) {
        router.push('/forum');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeData = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="min-h-screen bg-[#04091a] text-slate-300 font-sans">
      {/* Top bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500" />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <Image src="/assets/forum-logo.svg" alt="Forum" width={200} height={67} className="h-14 w-auto object-contain" priority />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Legal Agreements
          </h1>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Before accessing the SL Tech Stack Forum, you must carefully read and accept all three legal documents below. This is required for all members.
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-3 mt-6">
            {SECTIONS.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-all ${accepted[s.id] ? 'bg-green-400 ring-2 ring-green-400/30' : 'bg-slate-700'}`} />
                <span className="hidden sm:inline text-xs text-slate-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                activeSection === s.id
                  ? 'bg-blue-600/20 border-blue-500/50 text-white'
                  : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
              {accepted[s.id] && (
                <svg className="w-4 h-4 text-green-400 ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Document viewer */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Document header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
            <span className="text-2xl">{activeData.icon}</span>
            <h2 className="font-extrabold text-white text-lg">{activeData.label}</h2>
            {accepted[activeData.id] && (
              <span className="ml-auto flex items-center gap-1.5 text-green-400 text-xs font-bold uppercase tracking-widest">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Accepted
              </span>
            )}
          </div>

          {/* Scrollable content */}
          <div className="h-[420px] overflow-y-auto px-6 py-6 text-sm leading-7 text-slate-300 prose-invert space-y-4 scroll-smooth">
            {activeData.content.trim().split('\n').map((line, i) => {
              if (line.startsWith('## ')) return (
                <h2 key={i} className="text-2xl font-extrabold text-white mt-2 mb-4">{line.replace('## ', '')}</h2>
              );
              if (line.startsWith('### ')) return (
                <h3 key={i} className="text-base font-bold text-blue-300 mt-6 mb-2">{line.replace('### ', '')}</h3>
              );
              if (line.startsWith('**') && line.endsWith('**')) return (
                <p key={i} className="font-bold text-slate-200">{line.replace(/\*\*/g, '')}</p>
              );
              if (line.startsWith('- ')) return (
                <li key={i} className="ml-4 text-slate-300 list-disc">{line.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>
              );
              if (line.startsWith('---')) return <hr key={i} className="border-slate-700 my-4" />;
              if (line.trim() === '') return <div key={i} className="h-1" />;
              return (
                <p key={i} className="text-slate-300" dangerouslySetInnerHTML={{
                  __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100">$1</strong>')
                }} />
              );
            })}
          </div>

          {/* Accept checkbox */}
          <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/20">
            <label className={`flex items-start gap-3 cursor-pointer group ${accepted[activeData.id] ? 'opacity-80' : ''}`}>
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={!!accepted[activeData.id]}
                  onChange={e => setAccepted(prev => ({ ...prev, [activeData.id]: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                />
              </div>
              <span className={`text-sm font-semibold transition-colors ${accepted[activeData.id] ? 'text-green-400' : 'text-slate-300 group-hover:text-white'}`}>
                {activeData.checkLabel}
              </span>
            </label>
          </div>
        </div>

        {/* Final acceptance block */}
        <div className={`mt-6 p-6 rounded-2xl border transition-all ${allAccepted ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/30 border-slate-700/40'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className={`text-sm font-bold ${allAccepted ? 'text-green-300' : 'text-slate-400'}`}>
                {allAccepted
                  ? '✅ All three documents accepted. You may now access the forum.'
                  : `📌 ${SECTIONS.filter(s => !accepted[s.id]).length} document(s) remaining — accept all to continue.`}
              </p>
              {!allAccepted && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {SECTIONS.filter(s => !accepted[s.id]).map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className="text-xs text-blue-400 hover:text-white font-bold underline underline-offset-2"
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!allAccepted || submitting}
              className="shrink-0 px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 disabled:shadow-none flex items-center gap-2"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
              ) : (
                <> I Accept All — Enter Forum →</>
              )}
            </button>
          </div>
          {error && <p className="mt-3 text-red-400 text-sm font-medium">{error}</p>}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-8">
          © {new Date().getFullYear()} IT Services Freetown · SL Tech Stack Forum · 1 Regent Highway, Jui Junction, East Freetown
        </p>
      </div>
    </div>
  );
}
