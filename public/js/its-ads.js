(function() {
  // IT Services Freetown - Ad Network Client
  // This script fetches and displays internal promotions.
  
  // Try to find the script tag that loaded this script to determine the base URL
  const scriptTag = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('its-ads.js')) {
        return scripts[i];
      }
    }
    return null;
  })();

  const CONFIG = {
    apiBase: scriptTag ? new URL(scriptTag.src).origin : 'https://itservicesfreetown.com',
    containerClass: 'its-ad-unit',
    fallbackColor: '#040e40'
  };

  async function init() {
    console.log('ITS Ad Network: Initializing...');
    
    const findAndRender = async () => {
      let containers = document.querySelectorAll(`.${CONFIG.containerClass}`);
      
      // If no containers found and we have a script tag, create one at the script tag's location
      if (containers.length === 0 && scriptTag && !scriptTag.getAttribute('data-its-injected')) {
        console.log('ITS Ad Network: No containers found, injecting fallback at script location.');
        const fallbackContainer = document.createElement('div');
        fallbackContainer.className = CONFIG.containerClass;
        scriptTag.parentNode.insertBefore(fallbackContainer, scriptTag.nextSibling);
        scriptTag.setAttribute('data-its-injected', 'true');
        containers = [fallbackContainer];
      }

      if (containers.length > 0) {
        console.log(`ITS Ad Network: Found ${containers.length} container(s).`);
        const baseUrl = CONFIG.apiBase;
        
        try {
          const response = await fetch(`${baseUrl}/api/ads/serve`, {
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const data = await response.json();
          console.log('ITS Ad Network: API Response received', data);

          if (data.ad) {
            containers.forEach(container => {
              if (!container.getAttribute('data-its-loaded')) {
                renderAd(container, data.ad, baseUrl);
                container.setAttribute('data-its-loaded', 'true');
              }
            });
          } else {
            console.warn('ITS Ad Network: No active ads found.');
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
    
    // If not found, watch the DOM
    if (!found) {
      const observer = new MutationObserver(async (mutations, obs) => {
        const nowFound = await findAndRender();
        if (nowFound) obs.disconnect();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Periodic check as a fallback for slow loading sites
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        const nowFound = await findAndRender();
        if (nowFound || attempts > 5) clearInterval(interval);
      }, 1000);
    }
  }

  function renderAd(container, ad, baseUrl) {
    const clickUrl = `${baseUrl}/api/ads/click?id=${ad.id}`;
    
    // Make image URL absolute if it's relative
    let imageUrl = ad.imageUrl;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    
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
          ${imageUrl ? `<img src="${imageUrl}" alt="${ad.title}" class="its-ad-img">` : ''}
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
