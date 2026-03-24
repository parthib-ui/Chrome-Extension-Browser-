/**
 * URL Sentinel — background.js (Service Worker)
 * Handles all API calls to avoid CORS issues from content scripts
 */

const API_BASE = 'https://chrome-extension-browser-jqtb.onrender.com';

// In-memory cache to avoid hammering the API for the same URL
// (cache expires after 5 minutes)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_URL') {
    handleCheckUrl(message.url, sender.tab?.id)
      .then(result  => sendResponse({ ok: true,  result }))
      .catch(error  => sendResponse({ ok: false, error: error.message }));
    return true; // keep channel open for async response
  }

  if (message.type === 'OPEN_WARNING') {
    // Store warning data then open warning page in the current tab
    chrome.storage.session.set({
      warnData: message.data,
      warnUrl:  message.url
    }, () => {
      const warningUrl = chrome.runtime.getURL('warning.html');
      chrome.tabs.update(sender.tab.id, { url: warningUrl });
    });
  }
});

async function handleCheckUrl(url) {
  // Check cache first
  const cached = cache.get(url);
  if (cached && (Date.now() - cached.ts) < CACHE_TTL) {
    return cached.result;
  }

  const endpoint = `${API_BASE}/scan-url?url=${encodeURIComponent(url)}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`API returned ${res.status}`);

  const result = await res.json();
  if (result.error) throw new Error(result.error);

  // Cache result
  cache.set(url, { result, ts: Date.now() });

  // Evict stale entries when cache grows large
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.ts > CACHE_TTL) cache.delete(k);
    }
  }

  return result;
}
