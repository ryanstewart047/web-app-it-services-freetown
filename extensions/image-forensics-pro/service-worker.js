// BridgeTech Image Forensics Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  // Set panel behavior to open side panel on action click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
    console.error('Failed to set panel behavior:', err);
  });

  // Create context menu for images
  chrome.contextMenus.create({
    id: 'bridgetech-forensics-image',
    title: '🔍 Inspect with BridgeTech Forensics',
    contexts: ['image']
  });

  // Create context menu for pages
  chrome.contextMenus.create({
    id: 'bridgetech-forensics-page',
    title: '🔬 Scan Page for Suspicious/AI Images',
    contexts: ['page']
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'bridgetech-forensics-image' && info.srcUrl) {
    // 1. Open the side panel for this tab / window
    await chrome.sidePanel.open({ windowId: tab.windowId });

    // 2. Store active image in session storage
    await chrome.storage.session.set({
      targetImageUrl: info.srcUrl,
      targetPageUrl: info.pageUrl || tab.url,
      timestamp: Date.now()
    });

    // 3. Notify side panel if open
    chrome.runtime.sendMessage({
      type: 'INSPECT_IMAGE',
      imageUrl: info.srcUrl,
      pageUrl: info.pageUrl || tab.url
    }).catch(() => {
      // Side panel might still be loading, session storage will be read on load
    });
  }

  if (info.menuItemId === 'bridgetech-forensics-page') {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    
    // Inject script to extract all images
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const imgs = Array.from(document.querySelectorAll('img'))
            .map(img => img.src)
            .filter(src => src && (src.startsWith('http') || src.startsWith('data:image')));
          return Array.from(new Set(imgs)).slice(0, 30);
        }
      });

      const pageImages = results?.[0]?.result || [];
      await chrome.storage.session.set({
        pageImages,
        targetPageUrl: tab.url,
        timestamp: Date.now()
      });

      chrome.runtime.sendMessage({
        type: 'PAGE_IMAGES_FOUND',
        images: pageImages,
        pageUrl: tab.url
      }).catch(() => {});
    } catch (e) {
      console.error('Error scanning page images:', e);
    }
  }
});

// Message hub
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SESSION_TARGET') {
    (async () => {
      const data = await chrome.storage.session.get(['targetImageUrl', 'pageImages', 'targetPageUrl']);
      sendResponse(data);
    })();
    return true; // Keep channel open
  }

  if (message.type === 'OPEN_SIDE_PANEL' && sender.tab) {
    (async () => {
      await chrome.sidePanel.open({ windowId: sender.tab.windowId });
      sendResponse({ success: true });
    })();
    return true;
  }
});
