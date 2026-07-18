(function() {
  // IT Services Freetown - Ad Network Client
  // This script fetches and displays internal promotions.
  const CANONICAL_API_BASE = 'https://www.itservicesfreetown.com';
  const DEFAULT_AD = {
    title: 'Free Mobile & PC Diagnostic From Top Technicians in Freetown',
    description: 'Visit IT Services Freetown for computer and mobile repair support at Jui Junction.',
    imageUrl: 'https://github.com/ryanstewart047/freetown-website-images/blob/main/images/Get%20It%20Fixed.png?raw=true',
    targetUrl: 'https://www.itservicesfreetown.com/book-appointment',
    size: 'leaderboard'
  };
  
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

  function getScriptOrigin() {
    if (!scriptTag || !scriptTag.src) {
      return CANONICAL_API_BASE;
    }

    try {
      return new URL(scriptTag.src).origin;
    } catch (error) {
      return CANONICAL_API_BASE;
    }
  }

  function resolveApiBase() {
    const configuredBase = scriptTag && scriptTag.getAttribute('data-api-base');
    if (configuredBase) {
      return canonicalizeApiBase(configuredBase);
    }

    return canonicalizeApiBase(getScriptOrigin());
  }

  function canonicalizeApiBase(value) {
    const scriptOrigin = value.replace(/\/+$/, '');

    try {
      const url = new URL(scriptOrigin);
      const hostname = url.hostname.toLowerCase();

      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
        return scriptOrigin;
      }

      if (hostname === 'itservicesfreetown.com' || hostname === 'www.itservicesfreetown.com') {
        return CANONICAL_API_BASE;
      }
    } catch (error) {
      return CANONICAL_API_BASE;
    }

    return CANONICAL_API_BASE;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function normalizeUrl(value, baseUrl, fallback) {
    if (!value) {
      return fallback || '';
    }

    try {
      const url = new URL(value, baseUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.href;
      }
    } catch (error) {
      // Ignore malformed URLs and use the fallback below.
    }

    return fallback || '';
  }

  function normalizeSize(size) {
    const allowedSizes = ['rectangle', 'square', 'leaderboard', 'skyscraper'];
    return allowedSizes.includes(size) ? size : 'rectangle';
  }

  function renderIntoContainers(containers, ad, baseUrl) {
    containers.forEach(container => {
      if (!container.getAttribute('data-its-loaded')) {
        renderAd(container, ad, baseUrl);
        container.setAttribute('data-its-loaded', 'true');
      }
    });
  }

  const CONFIG = {
    apiBase: resolveApiBase(),
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
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const data = await response.json();
          console.log('ITS Ad Network: API Response received', data);

          if (data && data.ad) {
            renderIntoContainers(containers, data.ad, baseUrl);
          } else {
            console.warn('ITS Ad Network: No active ads found.');
            renderIntoContainers(containers, DEFAULT_AD, baseUrl);
          }
        } catch (error) {
          console.error('ITS Ad Network API Error:', error);
          renderIntoContainers(containers, DEFAULT_AD, baseUrl);
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
    const targetUrl = normalizeUrl(ad.targetUrl, baseUrl, DEFAULT_AD.targetUrl);
    const clickUrl = ad.id
      ? `${baseUrl}/api/ads/click?id=${encodeURIComponent(ad.id)}`
      : targetUrl;
    
    // Make image URL absolute if it's relative
    const imageUrl = normalizeUrl(ad.imageUrl, baseUrl, DEFAULT_AD.imageUrl);
    const adSize = normalizeSize(ad.size || DEFAULT_AD.size);
    const title = escapeHtml(ad.title || DEFAULT_AD.title);
    const description = escapeHtml(ad.description || DEFAULT_AD.description);
    const escapedImageUrl = escapeHtml(imageUrl);
    const escapedClickUrl = escapeHtml(clickUrl);
    
    // Inject Styles
    if (!document.getElementById('its-ad-styles')) {
      const style = document.createElement('style');
      style.id = 'its-ad-styles';
      style.textContent = `
        .its-ad-card {
          position: relative;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 100%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          background: white;
          margin: 10px 0;
          box-sizing: border-box;
        }
        .its-ad-card * {
          box-sizing: border-box;
        }
        .its-ad-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .its-ad-link {
          text-decoration: none;
          color: inherit;
          display: block;
          width: 100%;
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

        /* AdChoices / Info Badge */
        .its-ad-info-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 20;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          padding: 4px 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: default;
          transition: max-width 0.3s ease, padding 0.3s ease, background 0.2s ease, box-shadow 0.2s ease;
          max-width: 24px;
          overflow: hidden;
          white-space: nowrap;
        }
        .its-ad-info-icon {
          font-size: 12px;
          line-height: 1;
          color: #6b7280;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          font-family: monospace;
          flex-shrink: 0;
        }
        .its-ad-info-text {
          font-size: 11px;
          font-weight: 600;
          color: #1f2937;
          opacity: 0;
          transition: opacity 0.2s ease, margin-left 0.2s ease;
          margin-left: 0px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .its-ad-info-badge:hover {
          max-width: 260px;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .its-ad-info-badge:hover .its-ad-info-text {
          opacity: 1;
          margin-left: 6px;
        }
        .its-ad-info-badge:hover .its-ad-info-icon {
          color: #040e40;
        }

        /* Specific Layouts based on data-size attribute */
        .its-ad-card[data-size="square"] {
          max-width: 320px;
          margin: 10px auto;
        }
        .its-ad-card[data-size="square"] .its-ad-img {
          aspect-ratio: 1 / 1;
        }

        .its-ad-card[data-size="skyscraper"] {
          max-width: 280px;
          margin: 10px auto;
        }
        .its-ad-card[data-size="skyscraper"] .its-ad-img {
          aspect-ratio: 9 / 16;
          max-height: 400px;
        }

        .its-ad-card[data-size="leaderboard"] {
          max-width: 100%;
        }
        .its-ad-card[data-size="leaderboard"] .its-ad-link {
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }
        .its-ad-card[data-size="leaderboard"] .its-ad-img {
          width: 40%;
          max-width: 300px;
          height: auto;
          aspect-ratio: auto;
          border-bottom: none;
          border-right: 1px solid #f3f4f6;
        }
        .its-ad-card[data-size="leaderboard"] .its-ad-content {
          width: 60%;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 14px 20px;
        }
        @media (max-width: 640px) {
          .its-ad-card[data-size="leaderboard"] .its-ad-link {
            flex-direction: column;
          }
          .its-ad-card[data-size="leaderboard"] .its-ad-img {
            width: 100%;
            max-width: 100%;
            aspect-ratio: 21 / 9;
            border-right: none;
            border-bottom: 1px solid #f3f4f6;
          }
          .its-ad-card[data-size="leaderboard"] .its-ad-content {
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const html = `
      <div class="its-ad-card" data-size="${adSize}">
        <div class="its-ad-info-badge" title="Sponsored Advertisement">
          <span class="its-ad-info-icon">i</span>
          <span class="its-ad-info-text">Ads by IT Services Freetown</span>
        </div>
        <a href="${escapedClickUrl}" target="_blank" rel="noopener sponsored" class="its-ad-link">
          ${escapedImageUrl ? `<img src="${escapedImageUrl}" alt="${title}" class="its-ad-img">` : ''}
          <div class="its-ad-content">
            <h4 class="its-ad-title">${title}</h4>
            ${description ? `<p class="its-ad-desc">${description}</p>` : ''}
            <div class="its-ad-footer">
              <span class="its-ad-badge">Sponsored by IT Services Freetown</span>
              <span class="its-ad-cta">Learn More &rarr;</span>
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
