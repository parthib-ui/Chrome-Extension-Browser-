/**
 * URL Sentinel — content.js
 * Intercepts every link click, checks the URL with the API,
 * and either proceeds (SAFE) or diverts to the warning page.
 */

(function () {
  'use strict';

  // ---------- Skip pages we own ----------
  if (location.protocol === 'chrome-extension:') return;

  // ---------- Toast element (singleton) ----------
  let toast = null;
  let toastTimer = null;

  function getToast() {
    if (toast) return toast;
    toast = document.createElement('div');
    toast.id = '__url_sentinel_toast__';
    document.documentElement.appendChild(toast);
    return toast;
  }

  function showToast(state, text) {
    const t = getToast();
    t.className = `ust-toast ust-${state}`;
    t.innerHTML = text;
    t.classList.add('ust-visible');
    clearTimeout(toastTimer);
  }

  function hideToast(delay = 0) {
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toast) toast.classList.remove('ust-visible');
    }, delay);
  }

  // ---------- Helpers ----------
  function isSkippable(url) {
    if (!url || url === '#') return true;
    if (/^(javascript|mailto|tel|sms|data|blob):/i.test(url)) return true;
    // Same-page anchors
    try {
      const parsed = new URL(url, location.href);
      if (parsed.origin === location.origin && parsed.pathname === location.pathname && parsed.hash) return true;
    } catch (_) { return true; }
    return false;
  }

  function resolveHref(anchor) {
    // Use anchor.href which gives the fully-resolved absolute URL
    return anchor.href || null;
  }

  // ---------- Main click handler ----------
  document.addEventListener('click', function (e) {
    // Only plain left-click without modifiers
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // Walk up the DOM to find the nearest anchor
    const anchor = e.composedPath().find(el => el.tagName === 'A');
    if (!anchor) return;

    const href = resolveHref(anchor);
    if (isSkippable(href)) return;

    // Determine target: new tab vs same tab
    const newTab = anchor.target === '_blank';

    // Prevent the default navigation
    e.preventDefault();
    e.stopImmediatePropagation();

    // Show scanning toast
    showToast('scanning', `
      <span class="ust-icon">🛡️</span>
      <span class="ust-msg">Scanning link…</span>
    `);

    chrome.runtime.sendMessage({ type: 'CHECK_URL', url: href }, (response) => {
      if (chrome.runtime.lastError || !response) {
        // Extension context destroyed or error — just navigate
        hideToast(0);
        navigate(href, newTab);
        return;
      }

      if (!response.ok) {
        // API error — let user through with a warning toast
        showToast('warn', `<span class="ust-icon">⚠️</span><span class="ust-msg">Could not verify URL — proceed with caution.</span>`);
        hideToast(2500);
        setTimeout(() => navigate(href, newTab), 2500);
        return;
      }

      const { status, stats = {}, url: scannedUrl } = response.result;
      const finalUrl = scannedUrl || href;

      if (status === 'SAFE') {
        showToast('safe', `<span class="ust-icon">✅</span><span class="ust-msg">Safe — proceeding…</span>`);
        hideToast(1400);
        setTimeout(() => navigate(finalUrl, newTab), 1400);
      } else {
        // Malicious / Suspicious / Unknown — redirect to warning page
        hideToast(0);
        chrome.runtime.sendMessage({
          type: 'OPEN_WARNING',
          url:  finalUrl,
          data: { status, stats, url: finalUrl }
        });
      }
    });
  }, true); // useCapture = true to catch before other handlers

  function navigate(url, newTab) {
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }
})();
