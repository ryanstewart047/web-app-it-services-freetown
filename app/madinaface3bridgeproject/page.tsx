'use client';

import { useEffect } from 'react';

export default function MadinaFace3BridgeProject() {
  useEffect(() => {
    // Initialize donations and setup event listeners
    const donations = [
      { name: "Mohamed K.", amount: 5000, date: "2 hours ago" },
      { name: "Aminata S.", amount: 10000, date: "5 hours ago" },
      { name: "Ibrahim B.", amount: 2500, date: "1 day ago" },
      { name: "Fatmata J.", amount: 15000, date: "1 day ago" },
      { name: "Abdul R.", amount: 7500, date: "2 days ago" },
      { name: "Mariama F.", amount: 3000, date: "2 days ago" },
      { name: "Sorie K.", amount: 20000, date: "3 days ago" },
      { name: "Isata M.", amount: 5000, date: "3 days ago" }
    ];

    const renderDonations = () => {
      const donationList = document.getElementById('donationList');
      if (!donationList) return;
      donationList.innerHTML = '';
      
      donations.forEach(donation => {
        const initials = donation.name.split(' ').map(n => n[0]).join('');
        const item = document.createElement('div');
        item.className = 'donation-item';
        item.innerHTML = `
          <div class="donor-info">
            <div class="donor-avatar">${initials}</div>
            <div class="donor-details">
              <div class="donor-name">${donation.name}</div>
              <div class="donor-date">${donation.date}</div>
            </div>
          </div>
          <div class="donation-amount">Le ${donation.amount.toLocaleString()}</div>
        `;
        donationList.appendChild(item);
      });
    };

    const updateProgress = () => {
      const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
      const goal = 200000;
      const percentage = (totalRaised / goal * 100).toFixed(1);
      
      const totalEl = document.getElementById('totalRaised');
      const countEl = document.getElementById('donorCount');
      const fillEl = document.getElementById('progressFill');
      
      if (totalEl) totalEl.textContent = `Le ${totalRaised.toLocaleString()}`;
      if (countEl) countEl.textContent = donations.length.toString();
      if (fillEl) {
        fillEl.style.width = `${percentage}%`;
        fillEl.textContent = `${percentage}%`;
      }
    };

    // Initialize
    renderDonations();
    updateProgress();

    // Setup card number formatting
    const cardNumberInput = document.getElementById('cardNumber') as HTMLInputElement;
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', function(e) {
        const target = e.target as HTMLInputElement;
        let value = target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        target.value = formattedValue;
      });
    }
    
    // Setup expiry formatting
    const expiryInput = document.getElementById('cardExpiry') as HTMLInputElement;
    if (expiryInput) {
      expiryInput.addEventListener('input', function(e) {
        const target = e.target as HTMLInputElement;
        let value = target.value.replace(/\D/g, '');
        if (value.length >= 2) {
          value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        target.value = value;
      });
    }
    
    // Setup modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          const modalId = (modal as HTMLElement).id;
          closeModal(modalId);
        }
      });
    });
  }, []);

  const openOrangeMoneyModal = () => {
    const modal = document.getElementById('orangeMoneyModal');
    if (modal) modal.classList.add('active');
  };

  const openCardPaymentModal = () => {
    const modal = document.getElementById('cardPaymentModal');
    if (modal) modal.classList.add('active');
  };

  const closeModal = (modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  const initiateUSSDCall = () => {
    const ussdCode = document.getElementById('ussdCode')?.textContent?.trim();
    if (ussdCode) {
      window.location.href = 'tel:' + encodeURIComponent(ussdCode);
      showToast('Initiating Orange Money transaction...');
    }
  };

  const showToast = (message: string, type: string = 'success') => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    if (type === 'error') {
      toast.style.background = '#ef4444';
    } else {
      toast.style.background = '#10b981';
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };

  const processCardPayment = (event: React.FormEvent) => {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const amountInput = document.getElementById('cardAmount') as HTMLInputElement;
    const nameInput = document.getElementById('cardName') as HTMLInputElement;
    
    const amount = parseInt(amountInput?.value || '0');
    const name = nameInput?.value || '';
    
    if (amount <= 0 || isNaN(amount)) {
      showToast('Please enter a valid donation amount', 'error');
      return;
    }
    
    const submitButton = form.querySelector('.submit-button') as HTMLButtonElement;
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;
    
    setTimeout(() => {
      form.reset();
      closeModal('cardPaymentModal');
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
      
      showToast(`Thank you for your donation of Le ${amount.toLocaleString()}!`);
    }, 2000);
  };
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <style dangerouslySetInnerHTML={{__html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-image: url('/assets/bridge-background.png');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            background-color: #667eea;
          }

          body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(102, 126, 234, 0.75);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 0;
          }

          .donation-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            width: 100%;
            overflow: hidden;
            position: relative;
            z-index: 1;
          }

          .header-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
          }

          .header-section h1 {
            font-size: 2.5rem;
            margin-bottom: 15px;
            font-weight: 700;
          }

          .header-section p {
            font-size: 1.1rem;
            opacity: 0.95;
            line-height: 1.6;
          }

          .bridge-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .content-section {
            padding: 40px;
          }

          .progress-section {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            text-align: center;
          }

          .progress-title {
            font-size: 1.3rem;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
          }

          .progress-stats {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 25px;
          }

          .stat-item {
            flex: 1;
            min-width: 150px;
          }

          .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
          }

          .stat-label {
            font-size: 0.9rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .progress-bar {
            width: 100%;
            height: 30px;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 10px;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 1s ease;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
          }

          .donation-methods {
            margin-top: 30px;
          }

          .methods-title {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
          }

          .payment-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }

          .payment-btn {
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            background: white;
            position: relative;
            overflow: hidden;
          }

          .payment-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }

          .payment-btn.orange-money {
            border-color: #ff6b00;
          }

          .payment-btn.orange-money:hover {
            background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
            border-color: #ff6b00;
            color: white;
          }

          .payment-btn.card-payment {
            border-color: #667eea;
          }

          .payment-btn.card-payment:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: #667eea;
            color: white;
          }

          .payment-icon {
            font-size: 3rem;
            margin-bottom: 15px;
          }

          .payment-btn.orange-money .payment-icon {
            color: #ff6b00;
          }

          .payment-btn.card-payment .payment-icon {
            color: #667eea;
          }

          .payment-btn:hover .payment-icon {
            color: white;
          }

          .payment-name {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 5px;
          }

          .payment-desc {
            font-size: 0.9rem;
            color: #666;
          }

          .payment-btn:hover .payment-desc {
            color: rgba(255, 255, 255, 0.9);
          }

          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            align-items: center;
            justify-content: center;
          }

          .modal.active {
            display: flex;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-content {
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            animation: slideUp 0.3s ease;
            position: relative;
          }

          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            transition: color 0.3s;
          }

          .modal-close:hover {
            color: #333;
          }

          .modal-icon {
            font-size: 4rem;
            color: #ff6b00;
            margin-bottom: 20px;
          }

          .modal h2 {
            font-size: 1.8rem;
            color: #333;
            margin-bottom: 15px;
          }

          .ussd-code {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            border-radius: 12px;
            font-size: 1.8rem;
            font-weight: 700;
            color: #ff6b00;
            margin: 25px 0;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
          }

          .modal-instructions {
            text-align: left;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
          }

          .modal-instructions h3 {
            font-size: 1.1rem;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .modal-instructions ol {
            margin-left: 20px;
            color: #555;
            line-height: 1.8;
          }

          .modal-instructions li {
            margin-bottom: 8px;
          }

          .amount-input-section {
            margin-top: 25px;
          }

          .amount-input-section label {
            display: block;
            font-size: 1.1rem;
            color: #333;
            margin-bottom: 10px;
            font-weight: 600;
          }

          .amount-input {
            width: 100%;
            padding: 15px;
            font-size: 1.2rem;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            text-align: center;
            transition: border-color 0.3s;
          }

          .amount-input:focus {
            outline: none;
            border-color: #ff6b00;
          }

          .copy-button {
            background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 15px;
            transition: transform 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 10px;
          }

          .copy-button:hover {
            transform: scale(1.05);
          }

          .copy-button:active {
            transform: scale(0.95);
          }

          .card-form {
            text-align: left;
            margin-top: 20px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
          }

          .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
          }

          .form-group input:focus {
            outline: none;
            border-color: #667eea;
          }

          .card-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          .submit-button {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
            margin-top: 10px;
          }

          .submit-button:hover {
            transform: scale(1.02);
          }

          .submit-button:active {
            transform: scale(0.98);
          }

          .recent-donations {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e0e0e0;
          }

          .recent-donations h3 {
            font-size: 1.3rem;
            color: #333;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .donation-list {
            max-height: 300px;
            overflow-y: auto;
          }

          .donation-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 10px;
          }

          .donation-item:hover {
            background: #e9ecef;
          }

          .donor-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .donor-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
          }

          .donor-details {
            display: flex;
            flex-direction: column;
          }

          .donor-name {
            font-weight: 600;
            color: #333;
          }

          .donor-date {
            font-size: 0.85rem;
            color: #999;
          }

          .donation-amount {
            font-size: 1.2rem;
            font-weight: 700;
            color: #667eea;
          }

          @media (max-width: 640px) {
            .header-section h1 {
              font-size: 1.8rem;
            }

            .stat-value {
              font-size: 2rem;
            }

            .payment-buttons {
              grid-template-columns: 1fr;
            }

            .card-row {
              grid-template-columns: 1fr;
            }

            .modal-content {
              padding: 30px 20px;
            }
          }

          .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: none;
            align-items: center;
            gap: 10px;
            z-index: 2000;
            animation: slideInRight 0.3s ease;
          }

          .toast.show {
            display: flex;
          }

          @keyframes slideInRight {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}} />
      </head>
      <body suppressHydrationWarning>
        <div className="donation-container">
          <div className="header-section">
            <div className="bridge-icon">
              <i className="fas fa-bridge-water"></i>
            </div>
            <h1>Madina Face 3 Community Bridge Project</h1>
            <p>Help us build a bridge that connects our Madina Face 3 community. Every contribution brings us closer to our goal!</p>
          </div>

          <div className="content-section">
            <div className="progress-section">
              <div className="progress-title">
                <i className="fas fa-chart-line"></i> Campaign Progress
              </div>
              <div className="progress-stats">
                <div className="stat-item">
                  <div className="stat-value" id="totalRaised">Le 45,000</div>
                  <div className="stat-label">Raised</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">Le 200,000</div>
                  <div className="stat-label">Goal</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" id="donorCount">127</div>
                  <div className="stat-label">Donors</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" id="progressFill" style={{width: '22.5%'}}>22.5%</div>
              </div>
            </div>

            <div className="donation-methods">
              <h2 className="methods-title">Choose Your Payment Method</h2>
              <div className="payment-buttons">
                <div className="payment-btn orange-money" onClick={openOrangeMoneyModal}>
                  <div className="payment-icon">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div className="payment-name">Orange Money</div>
                  <div className="payment-desc">Quick & Easy Mobile Payment</div>
                </div>
                <div className="payment-btn card-payment" onClick={openCardPaymentModal}>
                  <div className="payment-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="payment-name">Card Payment</div>
                  <div className="payment-desc">Visa, Mastercard & More</div>
                </div>
              </div>
            </div>

            <div className="recent-donations">
              <h3>
                <i className="fas fa-heart"></i>
                Recent Donations
              </h3>
              <div className="donation-list" id="donationList"></div>
            </div>
          </div>
        </div>

        <div className="modal" id="orangeMoneyModal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => closeModal('orangeMoneyModal')}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h2>Orange Money Donation</h2>
            <p>Dial the USSD code below to make your donation</p>
            
            <div className="ussd-code" id="ussdCode">
              #144*2*1*076210320#
            </div>

            <button className="copy-button" onClick={initiateUSSDCall}>
              <i className="fas fa-phone-alt"></i>
              Dial to Donate
            </button>

            <div className="amount-input-section">
              <label htmlFor="donationAmount">
                <i className="fas fa-coins"></i> Enter Amount (Le)
              </label>
              <input 
                type="number" 
                id="donationAmount" 
                className="amount-input" 
                placeholder="Any amount is welcome"
              />
            </div>

            <div className="modal-instructions">
              <h3>
                <i className="fas fa-info-circle"></i>
                How to Donate:
              </h3>
              <ol>
                <li>Click "Dial to Donate" or dial: <strong>#144*2*1*076210320#</strong></li>
                <li>Enter the amount you wish to donate</li>
                <li>Confirm the transaction with your PIN</li>
                <li>You&apos;ll receive a confirmation SMS</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="modal" id="cardPaymentModal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => closeModal('cardPaymentModal')}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-icon" style={{color: '#667eea'}}>
              <i className="fas fa-credit-card"></i>
            </div>
            <h2>Card Payment</h2>
            
            <form className="card-form" onSubmit={processCardPayment}>
              <div className="form-group">
                <label>
                  <i className="fas fa-coins"></i> Donation Amount (Le)
                </label>
                <input 
                  type="number" 
                  id="cardAmount" 
                  required 
                  placeholder="Any amount is welcome"
                />
              </div>
              
              <div className="form-group">
                <label>
                  <i className="fas fa-user"></i> Cardholder Name
                </label>
                <input 
                  type="text" 
                  id="cardName" 
                  required 
                  placeholder="John Doe"
                />
              </div>
              
              <div className="form-group">
                <label>
                  <i className="fas fa-credit-card"></i> Card Number
                </label>
                <input 
                  type="text" 
                  id="cardNumber" 
                  required 
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              
              <div className="card-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    id="cardExpiry" 
                    required 
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input 
                    type="text" 
                    id="cardCVV" 
                    required 
                    placeholder="123"
                    maxLength={3}
                  />
                </div>
              </div>
              
              <button type="submit" className="submit-button">
                <i className="fas fa-lock"></i> Process Secure Payment
              </button>
            </form>
          </div>
        </div>

        <div className="toast" id="toast">
          <i className="fas fa-check-circle"></i>
          <span id="toastMessage"></span>
        </div>
      </body>
    </html>
  );
}
