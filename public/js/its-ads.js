(function() {
  // IT Services Freetown - Ad Network Client
  // This script fetches and displays internal promotions.
  
  const CONFIG = {
    apiBase: 'https://itservicesfreetown.com',
    containerClass: 'its-ad-unit',
    fallbackColor: '#040e40'
  };

  async function init() {
    const findAndRender = async () => {
      console.log('ITS Ad Network: Checking for containers...');
      const containers = document.querySelectorAll(`.${CONFIG.containerClass}`);
      
      if (containers.length > 0) {
        console.log(`ITS Ad Network: Found ${containers.length} container(s).`);
        // Detect if we are running on localhost for testing
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocal ? window.location.origin : CONFIG.apiBase;
        
        console.log(`ITS Ad Network: Using API base ${baseUrl}`);

        try {
          const response = await fetch(`${baseUrl}/api/ads/serve`);
          const data = await response.json();
          console.log('ITS Ad Network: API Response received', data);

          if (data.ad) {
            console.log('ITS Ad Network: Ad data found, rendering...');
            containers.forEach(container => {
              if (!container.getAttribute('data-its-loaded')) {
                renderAd(container, data.ad, baseUrl);
                container.setAttribute('data-its-loaded', 'true');
              }
            });
          } else {
            console.warn('ITS Ad Network: No active ads found in database.');
          }
        } catch (error) {
          console.error('ITS Ad Network API Error:', error);
        }
        return true;
      }
      return false;
    };

    // Try immediately
    const found = await findAndRender();
    
    // If not found (common in React/Next.js apps), watch the DOM
    if (!found) {
      const observer = new MutationObserver(async (mutations, obs) => {
        const nowFound = await findAndRender();
        if (nowFound) {
          obs.disconnect(); // Stop watching once we've found and rendered
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Also try one more time after 2 seconds just in case
      setTimeout(findAndRender, 2000);
    }
  }

  function renderAd(container, ad, baseUrl) {
    const clickUrl = `${baseUrl}/api/ads/click?id=${ad.id}`;
    
    // Inject Styles
    if (!document.getElementById('its-ad-styles')) {
      const style = document.createElement('style');
      style.id = 'its-ad-styles';
      style.textContent = `
        .its-ad-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 100%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          background: white;
          margin: 10px 0;
        }
        .its-ad-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .its-ad-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .its-ad-img {
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          display: block;
          border-bottom: 1px solid #f3f4f6;
        }
        .its-ad-content {
          padding: 16px;
        }
        .its-ad-title {
          margin: 0 0 6px 0;
          color: #040e40;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
        }
        .its-ad-desc {
          margin: 0;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.5;
        }
        .its-ad-footer {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .its-ad-badge {
          font-size: 10px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .its-ad-cta {
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
        }
      `;
      document.head.appendChild(style);
    }

    const html = `
      <div class="its-ad-card">
        <a href="${clickUrl}" target="_blank" class="its-ad-link">
          ${ad.imageUrl ? `<img src="${ad.imageUrl}" alt="${ad.title}" class="its-ad-img">` : ''}
          <div class="its-ad-content">
            <h4 class="its-ad-title">${ad.title}</h4>
            ${ad.description ? `<p class="its-ad-desc">${ad.description}</p>` : ''}
            <div class="its-ad-footer">
              <span class="its-ad-badge">Sponsored by IT Services Freetown</span>
              <span class="its-ad-cta">Learn More →</span>
            </div>
          </div>
        </a>
      </div>
    `;
    
    container.innerHTML = html;
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
