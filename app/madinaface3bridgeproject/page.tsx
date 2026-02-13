'use client';

import { useState, useEffect } from 'react';

interface Donation {
  name: string;
  amount: number;
  date: string;
  method: string;
}

const initialDonations: Donation[] = [
  { name: "Mohamed K.", amount: 5000, date: "2 hours ago", method: "Orange Money" },
  { name: "Aminata S.", amount: 10000, date: "5 hours ago", method: "Card" },
  { name: "Ibrahim B.", amount: 2500, date: "1 day ago", method: "Orange Money" },
  { name: "Fatmata J.", amount: 15000, date: "1 day ago", method: "Card" },
  { name: "Abdul R.", amount: 7500, date: "2 days ago", method: "Orange Money" },
  { name: "Mariama F.", amount: 3000, date: "2 days ago", method: "Orange Money" },
  { name: "Sorie K.", amount: 20000, date: "3 days ago", method: "Card" },
  { name: "Isata M.", amount: 5000, date: "3 days ago", method: "Orange Money" },
];

const GOAL = 200000;

export default function MadinaFace3BridgeProject() {
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [activeModal, setActiveModal] = useState<'orange' | 'card' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardAmount, setCardAmount] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [animateProgress, setAnimateProgress] = useState(false);

  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const percentage = Math.min((totalRaised / GOAL) * 100, 100).toFixed(1);

  useEffect(() => {
    setTimeout(() => setAnimateProgress(true), 300);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
  };

  const initiateUSSDCall = () => {
    window.location.href = 'tel:' + encodeURIComponent('#144*2*1*076210320#');
    showToast('Initiating Orange Money transaction...');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '');
    return v.match(/.{1,4}/g)?.join(' ') || v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2, 4);
    return v;
  };

  const processCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(cardAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid donation amount', 'error');
      return;
    }
    setCardProcessing(true);
    setTimeout(() => {
      setDonations(prev => [
        { name: cardName, amount, date: "Just now", method: "Card" },
        ...prev,
      ]);
      setCardAmount('');
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setCardProcessing(false);
      setActiveModal(null);
      showToast(`Thank you for your generous donation of Le ${amount.toLocaleString()}!`);
    }, 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .donate-page * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .donate-page {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: #0f172a;
          color: #e2e8f0;
          overflow-x: hidden;
        }

        .donate-page .hero-bg {
          position: relative;
          background: linear-gradient(165deg, #1e3a5f 0%, #0f172a 50%, #1a1a2e 100%);
          padding: 60px 20px 80px;
          text-align: center;
          overflow: hidden;
        }

        .donate-page .hero-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          animation: floatBg 20s ease-in-out infinite;
        }

        @keyframes floatBg {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(1deg); }
          66% { transform: translate(-20px, 20px) rotate(-1deg); }
        }

        .donate-page .hero-content { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; }

        .donate-page .bridge-visual {
          width: 100px;
          height: 100px;
          margin: 0 auto 30px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
          animation: pulseGlow 3s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 20px 60px rgba(139, 92, 246, 0.5); }
        }

        .donate-page .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          color: white;
          margin-bottom: 16px;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .donate-page .hero-title span {
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .donate-page .hero-subtitle {
          font-size: 1.15rem;
          color: #94a3b8;
          line-height: 1.7;
          max-width: 550px;
          margin: 0 auto;
        }

        .donate-page .main-content {
          max-width: 900px;
          margin: -40px auto 0;
          padding: 0 20px 60px;
          position: relative;
          z-index: 3;
        }

        .donate-page .progress-card {
          background: linear-gradient(135deg, #1e293b, #1a1a2e);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 20px;
          padding: 35px;
          margin-bottom: 30px;
        }

        .donate-page .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .donate-page .raised-amount {
          font-size: 2.8rem;
          font-weight: 800;
          color: white;
        }

        .donate-page .raised-amount .currency { color: #60a5fa; font-size: 1.6rem; }

        .donate-page .goal-text { font-size: 1rem; color: #64748b; }
        .donate-page .goal-text strong { color: #94a3b8; }

        .donate-page .progress-track {
          width: 100%;
          height: 16px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .donate-page .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          border-radius: 10px;
          transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .donate-page .progress-bar-fill::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .donate-page .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .donate-page .stat-box {
          text-align: center;
          padding: 15px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .donate-page .stat-num { font-size: 1.5rem; font-weight: 700; color: white; }
        .donate-page .stat-label {
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }

        .donate-page .donate-section-title {
          text-align: center;
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 25px;
        }

        .donate-page .payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        .donate-page .pay-card {
          background: linear-gradient(135deg, #1e293b, #1a1a2e);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 35px 25px;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .donate-page .pay-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.4s;
        }

        .donate-page .pay-card.om::before {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.05));
        }

        .donate-page .pay-card.cc::before {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.05));
        }

        .donate-page .pay-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .donate-page .pay-card:hover::before { opacity: 1; }

        .donate-page .pay-card .icon-wrap {
          width: 70px;
          height: 70px;
          margin: 0 auto 20px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          position: relative;
          z-index: 1;
        }

        .donate-page .pay-card.om .icon-wrap {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
        }

        .donate-page .pay-card.cc .icon-wrap {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .donate-page .pay-card .pay-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 6px;
          position: relative;
          z-index: 1;
        }

        .donate-page .pay-card .pay-desc {
          font-size: 0.9rem;
          color: #64748b;
          position: relative;
          z-index: 1;
        }

        .donate-page .donors-section {
          background: linear-gradient(135deg, #1e293b, #1a1a2e);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 30px;
        }

        .donate-page .donors-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .donate-page .donors-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .donate-page .donors-title .heart { color: #f43f5e; }

        .donate-page .donor-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-radius: 12px;
          transition: background 0.2s;
          margin-bottom: 4px;
        }

        .donate-page .donor-row:hover { background: rgba(255, 255, 255, 0.04); }

        .donate-page .donor-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .donate-page .donor-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: white;
        }

        .donate-page .donor-avatar.om-av { background: linear-gradient(135deg, #f97316, #ea580c); }
        .donate-page .donor-avatar.cc-av { background: linear-gradient(135deg, #3b82f6, #8b5cf6); }

        .donate-page .donor-name { font-weight: 600; color: #e2e8f0; font-size: 0.95rem; }
        .donate-page .donor-meta { font-size: 0.8rem; color: #475569; margin-top: 2px; }
        .donate-page .donor-amount { font-weight: 700; color: #60a5fa; font-size: 1.05rem; }

        .donate-page .donor-list {
          max-height: 350px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .donate-page .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.25s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .donate-page .modal-box {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          position: relative;
          animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .donate-page .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .donate-page .modal-close:hover { background: rgba(255, 255, 255, 0.1); color: white; }

        .donate-page .modal-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          color: white;
          margin-bottom: 24px;
        }

        .donate-page .modal-icon.om-icon { background: linear-gradient(135deg, #f97316, #ea580c); }
        .donate-page .modal-icon.cc-icon { background: linear-gradient(135deg, #3b82f6, #8b5cf6); }

        .donate-page .modal-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .donate-page .modal-subtitle { color: #94a3b8; margin-bottom: 28px; }

        .donate-page .ussd-display {
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          padding: 18px;
          border-radius: 14px;
          text-align: center;
          font-family: 'Courier New', monospace;
          font-size: 1.6rem;
          font-weight: 700;
          color: #fb923c;
          letter-spacing: 2px;
          margin-bottom: 20px;
        }

        .donate-page .dial-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          font-family: inherit;
        }

        .donate-page .dial-btn.om-btn {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
        }

        .donate-page .dial-btn.om-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4); }

        .donate-page .dial-btn.cc-btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        .donate-page .dial-btn.cc-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4); }

        .donate-page .dial-btn:disabled { opacity: 0.7; cursor: wait; transform: none !important; }

        .donate-page .steps-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 20px;
          margin-top: 24px;
        }

        .donate-page .steps-title {
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 12px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .donate-page .step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
          color: #cbd5e1;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .donate-page .step-num {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .donate-page .field-group { margin-bottom: 18px; }

        .donate-page .field-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .donate-page .field-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          color: white;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .donate-page .field-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .donate-page .field-input::placeholder { color: #475569; }

        .donate-page .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .donate-page .toast-notif {
          position: fixed;
          top: 24px;
          right: 24px;
          padding: 16px 24px;
          border-radius: 14px;
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .donate-page .toast-notif.success { background: linear-gradient(135deg, #059669, #10b981); }
        .donate-page .toast-notif.error { background: linear-gradient(135deg, #dc2626, #ef4444); }

        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .donate-page .footer-simple {
          text-align: center;
          padding: 30px 20px;
          color: #475569;
          font-size: 0.85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 640px) {
          .donate-page .hero-title { font-size: 2rem; }
          .donate-page .hero-subtitle { font-size: 1rem; }
          .donate-page .payment-grid { grid-template-columns: 1fr; }
          .donate-page .raised-amount { font-size: 2rem; }
          .donate-page .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .donate-page .stat-num { font-size: 1.1rem; }
          .donate-page .modal-box { padding: 28px 22px; }
          .donate-page .row-2 { grid-template-columns: 1fr; }
          .donate-page .progress-card { padding: 24px; }
        }
      `}</style>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      <div className="donate-page">
        {/* Hero */}
        <div className="hero-bg">
          <div className="hero-content">
            <div className="bridge-visual">
              <i className="fas fa-bridge-water"></i>
            </div>
            <h1 className="hero-title">
              Madina Face 3<br />
              <span>Community Bridge Project</span>
            </h1>
            <p className="hero-subtitle">
              Help us build a bridge that connects the Madina Face 3 community.
              Every donation, big or small, brings us one step closer to making this a reality.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Progress Card */}
          <div className="progress-card">
            <div className="progress-header">
              <div className="raised-amount">
                <span className="currency">Le </span>
                {totalRaised.toLocaleString()}
              </div>
              <div className="goal-text">
                raised of <strong>Le {GOAL.toLocaleString()}</strong> goal
              </div>
            </div>
            <div className="progress-track">
              <div
                className="progress-bar-fill"
                style={{ width: animateProgress ? `${percentage}%` : '0%' }}
              />
            </div>
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-num">{percentage}%</div>
                <div className="stat-label">Funded</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{donations.length}</div>
                <div className="stat-label">Donors</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">Le {(GOAL - totalRaised).toLocaleString()}</div>
                <div className="stat-label">Remaining</div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <h2 className="donate-section-title">Make a Donation</h2>
          <div className="payment-grid">
            <div className="pay-card om" onClick={() => setActiveModal('orange')}>
              <div className="icon-wrap">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <div className="pay-title">Orange Money</div>
              <div className="pay-desc">Quick mobile payment via USSD</div>
            </div>
            <div className="pay-card cc" onClick={() => setActiveModal('card')}>
              <div className="icon-wrap">
                <i className="fas fa-credit-card"></i>
              </div>
              <div className="pay-title">Card Payment</div>
              <div className="pay-desc">Visa, Mastercard & more</div>
            </div>
          </div>

          {/* Recent Donors */}
          <div className="donors-section">
            <div className="donors-header">
              <div className="donors-title">
                <span className="heart"><i className="fas fa-heart"></i></span>
                Recent Donors
              </div>
            </div>
            <div className="donor-list">
              {donations.map((d, i) => {
                const initials = d.name.split(' ').map(n => n[0]).join('');
                return (
                  <div className="donor-row" key={i}>
                    <div className="donor-left">
                      <div className={`donor-avatar ${d.method === 'Orange Money' ? 'om-av' : 'cc-av'}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="donor-name">{d.name}</div>
                        <div className="donor-meta">{d.date} &middot; {d.method}</div>
                      </div>
                    </div>
                    <div className="donor-amount">Le {d.amount.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="footer-simple">
          Madina Face 3 Community Bridge Project &copy; {new Date().getFullYear()}
        </div>

        {/* Orange Money Modal */}
        {activeModal === 'orange' && (
          <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}>
            <div className="modal-box">
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <i className="fas fa-times"></i>
              </button>
              <div className="modal-icon om-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <div className="modal-title">Orange Money</div>
              <p className="modal-subtitle">Tap the button below to initiate the transaction</p>

              <div className="ussd-display">#144*2*1*076210320#</div>

              <button className="dial-btn om-btn" onClick={initiateUSSDCall}>
                <i className="fas fa-phone-alt"></i>
                Dial to Donate
              </button>

              <div className="steps-box">
                <div className="steps-title">How it works</div>
                <div className="step-item">
                  <span className="step-num">1</span>
                  <span>Tap &ldquo;Dial to Donate&rdquo; to dial the USSD code automatically</span>
                </div>
                <div className="step-item">
                  <span className="step-num">2</span>
                  <span>Enter any amount you wish to donate</span>
                </div>
                <div className="step-item">
                  <span className="step-num">3</span>
                  <span>Confirm with your Orange Money PIN</span>
                </div>
                <div className="step-item">
                  <span className="step-num">4</span>
                  <span>You&apos;ll receive a confirmation SMS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Payment Modal */}
        {activeModal === 'card' && (
          <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}>
            <div className="modal-box">
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <i className="fas fa-times"></i>
              </button>
              <div className="modal-icon cc-icon">
                <i className="fas fa-credit-card"></i>
              </div>
              <div className="modal-title">Card Payment</div>
              <p className="modal-subtitle">Secure donation via debit or credit card</p>

              <form onSubmit={processCardPayment}>
                <div className="field-group">
                  <label className="field-label">Donation Amount (Le)</label>
                  <input
                    className="field-input"
                    type="number"
                    placeholder="Any amount is welcome"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Cardholder Name</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Full name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Card Number</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    required
                  />
                </div>
                <div className="row-2">
                  <div className="field-group">
                    <label className="field-label">Expiry</label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">CVV</label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>
                <button className="dial-btn cc-btn" type="submit" disabled={cardProcessing}>
                  {cardProcessing ? (
                    <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                  ) : (
                    <><i className="fas fa-lock"></i> Donate Securely</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`toast-notif ${toast.type}`}>
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}
