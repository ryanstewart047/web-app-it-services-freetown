// Generate or retrieve a persistent session ID for wishlist tracking
export function getWishlistSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const STORAGE_KEY = 'wishlist_session_id';
  
  // Try to get existing session ID
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  // If no session ID exists, create one
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

// Generate a unique session ID
function generateSessionId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
