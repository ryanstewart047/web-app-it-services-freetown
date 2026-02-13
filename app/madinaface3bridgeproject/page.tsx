'use client';

import { useState, useEffect, useCallback } from 'react';

interface Donation {
  id: string;
  name: string;
  amount: number;
  method: string;
  message?: string;
  createdAt: string;
}

const GOAL = 200000;
const POLL_INTERVAL = 15000;

export default function MadinaFace3BridgeProject() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'orange' | 'card' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardAmount, setCardAmount] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardEmail, setCardEmail] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [animateProgress, setAnimateProgress] = useState(false);
  const [omName, setOmName] = useState('');
  const [omAmount, setOmAmount] = useState('');
  const [omPhone, setOmPhone] = useState('');
  const [omSubmitting, setOmSubmitting] = useState(false);

  const percentage = Math.min((totalRaised / GOAL) * 100, 100).toFixed(1);

  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch('/api/donations');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDonations(data.donations || []);
      setTotalRaised(data.totalRaised || 0);
      setDonorCount(data.donorCount || 0);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDonations]);

  useEffect(() => {
    if (!loading) setTimeout(() => setAnimateProgress(true), 300);
  }, [loading]);

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

  const recordOrangeDonation = async () => {
    if (!omName.trim() || !omAmount.trim()) {
      showToast('Please enter your name and amount', 'error');
      return;
    }
    const amount = parseFloat(omAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setOmSubmitting(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: omName.trim(), amount, method: 'Orange Money', phone: omPhone.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(`Thank you ${omName}! Donation of Le ${amount.toLocaleString()} recorded.`);
      setOmName(''); setOmAmount(''); setOmPhone('');
      setActiveModal(null);
      await fetchDonations();
    } catch { showToast('Could not record donation. Try again.', 'error'); }
    finally { setOmSubmitting(false); }
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

  const processCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(cardAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid donation amount', 'error');
      return;
    }
    setCardProcessing(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cardName.trim(), amount, method: 'Card', email: cardEmail.trim() || null, message: cardMessage.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed');
      setCardAmount(''); setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCVV('');
      setCardEmail(''); setCardMessage('');
      setActiveModal(null);
      showToast(`Thank you for your generous donation of Le ${amount.toLocaleString()}!`);
      await fetchDonations();
    } catch { showToast('Payment processing failed. Try again.', 'error'); }
    finally { setCardProcessing(false); }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(dateStr).toLocaleDateString();
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
          -webkit-text-size-adjust: 100%;
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

        .donate-page .skeleton {
          background: linear-gradient(90deg, #1e293b 25%, #2d3a4f 50%, #1e293b 75%);
          background-size: 200% 100%; animation: skeletonPulse 1.5s infinite; border-radius: 12px;
        }
        @keyframes skeletonPulse { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .donate-page .skeleton-text { height: 24px; margin-bottom: 12px; }
        .donate-page .skeleton-text.sm { height: 16px; width: 60%; }
        .donate-page .skeleton-bar { height: 16px; margin: 20px 0; }
        .donate-page .skeleton-row { height: 60px; margin-bottom: 8px; }

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
          flex-wrap: wrap;
          gap: 8px;
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

        .donate-page .live-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.75rem; color: #22c55e; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .donate-page .live-dot {
          width: 8px; height: 8px; background: #22c55e; border-radius: 50%;
          animation: livePulse 2s infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
        }

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
          min-width: 0;
          flex: 1;
        }

        .donate-page .donor-avatar {
          width: 42px;
          height: 42px;
          min-width: 42px;
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

        .donate-page .donor-info { min-width: 0; flex: 1; }
        .donate-page .donor-name { font-weight: 600; color: #e2e8f0; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .donate-page .donor-meta { font-size: 0.8rem; color: #475569; margin-top: 2px; }
        .donate-page .donor-amount { font-weight: 700; color: #60a5fa; font-size: 1.05rem; white-space: nowrap; margin-left: 12px; }

        .donate-page .donor-list {
          max-height: 350px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .donate-page .no-donors { text-align: center; padding: 40px 20px; color: #64748b; }
        .donate-page .no-donors i { font-size: 2rem; margin-bottom: 12px; display: block; opacity: 0.5; }

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
          max-height: 90vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
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
          font-size: 1.4rem;
          font-weight: 700;
          color: #fb923c;
          letter-spacing: 2px;
          margin-bottom: 20px;
          word-break: break-all;
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
          -webkit-tap-highlight-color: transparent;
        }

        .donate-page .dial-btn.om-btn {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          margin-bottom: 16px;
        }

        .donate-page .dial-btn.om-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4); }

        .donate-page .dial-btn.cc-btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        .donate-page .dial-btn.cc-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4); }

        .donate-page .dial-btn:disabled { opacity: 0.7; cursor: wait; transform: none !important; }

        .donate-page .divider-text {
          text-align: center; color: #475569; font-size: 0.85rem; margin: 20px 0; position: relative;
        }
        .donate-page .divider-text::before, .donate-page .divider-text::after {
          content: ''; position: absolute; top: 50%; width: 30%; height: 1px; background: rgba(255,255,255,0.08);
        }
        .donate-page .divider-text::before { left: 0; }
        .donate-page .divider-text::after { right: 0; }
        .donate-page .record-section-title {
          font-size: 0.95rem; font-weight: 600; color: #94a3b8; margin-bottom: 16px; text-align: center;
        }
        .donate-page .dial-btn.record-btn { background: linear-gradient(135deg, #059669, #10b981); color: white; }
        .donate-page .dial-btn.record-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4); }

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
          -webkit-appearance: none;
          appearance: none;
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
          left: 24px;
          max-width: 420px;
          margin-left: auto;
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

        @media (max-width: 768px) {
          .donate-page .hero-bg { padding: 40px 16px 60px; }
          .donate-page .hero-title { font-size: 2.2rem; }
          .donate-page .hero-subtitle { font-size: 1rem; line-height: 1.6; }
          .donate-page .bridge-visual { width: 80px; height: 80px; font-size: 2rem; margin-bottom: 24px; }
          .donate-page .main-content { padding: 0 16px 40px; margin-top: -30px; }
          .donate-page .progress-card { padding: 24px 20px; border-radius: 16px; }
          .donate-page .raised-amount { font-size: 2.2rem; }
          .donate-page .raised-amount .currency { font-size: 1.3rem; }
          .donate-page .payment-grid { grid-template-columns: 1fr; gap: 14px; }
          .donate-page .pay-card { padding: 28px 20px; }
          .donate-page .pay-card .icon-wrap { width: 60px; height: 60px; font-size: 1.5rem; }
          .donate-page .donate-section-title { font-size: 1.5rem; margin-bottom: 20px; }
          .donate-page .donors-section { padding: 24px 16px; border-radius: 16px; }
          .donate-page .donors-title { font-size: 1.1rem; }
          .donate-page .donor-row { padding: 12px 10px; }
          .donate-page .donor-avatar { width: 38px; height: 38px; min-width: 38px; font-size: 0.75rem; border-radius: 10px; }
          .donate-page .donor-left { gap: 10px; }
          .donate-page .donor-name { font-size: 0.9rem; }
          .donate-page .donor-meta { font-size: 0.75rem; }
          .donate-page .donor-amount { font-size: 0.95rem; }
          .donate-page .stat-num { font-size: 1.2rem; }
          .donate-page .stat-label { font-size: 0.7rem; }
          .donate-page .stat-box { padding: 12px 8px; }
        }

        @media (max-width: 480px) {
          .donate-page .hero-bg { padding: 32px 14px 50px; }
          .donate-page .hero-title { font-size: 1.75rem; }
          .donate-page .hero-subtitle { font-size: 0.9rem; }
          .donate-page .bridge-visual { width: 70px; height: 70px; font-size: 1.7rem; border-radius: 18px; margin-bottom: 20px; }
          .donate-page .main-content { padding: 0 12px 32px; }
          .donate-page .progress-card { padding: 20px 16px; }
          .donate-page .raised-amount { font-size: 1.8rem; }
          .donate-page .raised-amount .currency { font-size: 1.1rem; }
          .donate-page .goal-text { font-size: 0.85rem; }
          .donate-page .progress-track { height: 12px; }
          .donate-page .stats-row { gap: 8px; }
          .donate-page .stat-num { font-size: 1rem; }
          .donate-page .stat-label { font-size: 0.65rem; letter-spacing: 0.5px; }
          .donate-page .stat-box { padding: 10px 6px; border-radius: 10px; }
          .donate-page .donate-section-title { font-size: 1.3rem; }
          .donate-page .pay-card { padding: 24px 16px; border-radius: 14px; }
          .donate-page .pay-card .icon-wrap { width: 52px; height: 52px; font-size: 1.3rem; border-radius: 14px; }
          .donate-page .pay-card .pay-title { font-size: 1.1rem; }
          .donate-page .pay-card .pay-desc { font-size: 0.8rem; }
          .donate-page .donors-section { padding: 20px 14px; }
          .donate-page .donor-row { padding: 10px 8px; }
          .donate-page .donor-avatar { width: 34px; height: 34px; min-width: 34px; font-size: 0.7rem; }
          .donate-page .donor-amount { font-size: 0.85rem; }
          .donate-page .overlay { padding: 12px; align-items: flex-end; }
          .donate-page .modal-box {
            padding: 28px 18px; border-radius: 20px 20px 0 0; max-height: 85vh;
            animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .donate-page .modal-icon { width: 52px; height: 52px; font-size: 1.3rem; margin-bottom: 18px; }
          .donate-page .modal-title { font-size: 1.3rem; }
          .donate-page .modal-subtitle { font-size: 0.9rem; margin-bottom: 20px; }
          .donate-page .ussd-display { font-size: 1.1rem; padding: 14px; letter-spacing: 1px; }
          .donate-page .dial-btn { padding: 14px; font-size: 0.95rem; }
          .donate-page .field-input { padding: 12px 14px; font-size: 0.95rem; }
          .donate-page .field-label { font-size: 0.8rem; }
          .donate-page .step-item { font-size: 0.85rem; }
          .donate-page .steps-box { padding: 16px; }
          .donate-page .row-2 { grid-template-columns: 1fr; }
          .donate-page .toast-notif {
            right: 12px; left: 12px; top: 12px;
            font-size: 0.85rem; padding: 14px 16px; border-radius: 12px;
          }
        }

        @media (max-width: 360px) {
          .donate-page .hero-title { font-size: 1.5rem; }
          .donate-page .raised-amount { font-size: 1.5rem; }
          .donate-page .raised-amount .currency { font-size: 1rem; }
          .donate-page .stats-row { gap: 6px; }
          .donate-page .stat-num { font-size: 0.9rem; }
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
            {loading ? (
              <>
                <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                <div className="skeleton skeleton-text sm"></div>
                <div className="skeleton skeleton-bar"></div>
              </>
            ) : (
              <>
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
                    <div className="stat-num">{donorCount}</div>
                    <div className="stat-label">Donors</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">Le {Math.max(0, GOAL - totalRaised).toLocaleString()}</div>
                    <div className="stat-label">Remaining</div>
                  </div>
                </div>
              </>
            )}
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
              <div className="live-badge">
                <span className="live-dot"></span>
                Live
              </div>
            </div>
            <div className="donor-list">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <div className="skeleton skeleton-row" key={i}></div>
                  ))}
                </>
              ) : donations.length === 0 ? (
                <div className="no-donors">
                  <i className="fas fa-hand-holding-heart"></i>
                  <p>Be the first to donate!</p>
                </div>
              ) : (
                donations.map((d) => {
                  const initials = d.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                  return (
                    <div className="donor-row" key={d.id}>
                      <div className="donor-left">
                        <div className={`donor-avatar ${d.method === 'Orange Money' ? 'om-av' : 'cc-av'}`}>
                          {initials}
                        </div>
                        <div className="donor-info">
                          <div className="donor-name">{d.name}</div>
                          <div className="donor-meta">{timeAgo(d.createdAt)} &middot; {d.method}</div>
                        </div>
                      </div>
                      <div className="donor-amount">Le {d.amount.toLocaleString()}</div>
                    </div>
                  );
                })
              )}
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

              <div className="divider-text">After completing payment, record your donation</div>

              <div className="record-section-title">
                <i className="fas fa-clipboard-check"></i> Record Your Donation
              </div>

              <div className="field-group">
                <label className="field-label">Your Name</label>
                <input className="field-input" type="text" placeholder="Enter your name"
                  value={omName} onChange={(e) => setOmName(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Amount Donated (Le)</label>
                <input className="field-input" type="number" placeholder="Amount you sent"
                  value={omAmount} onChange={(e) => setOmAmount(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Phone Number (optional)</label>
                <input className="field-input" type="tel" placeholder="e.g. 076210320"
                  value={omPhone} onChange={(e) => setOmPhone(e.target.value)} />
              </div>

              <button className="dial-btn record-btn" onClick={recordOrangeDonation} disabled={omSubmitting}>
                {omSubmitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> Recording...</>
                ) : (
                  <><i className="fas fa-check-circle"></i> Record My Donation</>
                )}
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
                  <span>Fill in your details above and tap &ldquo;Record My Donation&rdquo;</span>
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
                  <label className="field-label">Email (optional)</label>
                  <input
                    className="field-input"
                    type="email"
                    placeholder="your@email.com"
                    value={cardEmail}
                    onChange={(e) => setCardEmail(e.target.value)}
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
                <div className="field-group">
                  <label className="field-label">Message (optional)</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Leave a message of support"
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                  />
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
