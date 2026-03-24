/**
 * URL Sentinel — warning.js
 * Reads scan result from chrome.storage.session and populates the warning page.
 * NOTE: All event listeners attached here — MV3 CSP blocks inline onclick handlers.
 */

let targetUrl = null;

function goBack() {
  if (history.length > 1) {
    history.back();
  } else {
    window.close();
  }
}

function proceedAnyway() {
  const pb = document.getElementById('proceedBtn');
  pb.disabled = true;
  pb.textContent = 'Redirecting…';
  if (targetUrl) window.location.href = targetUrl;
}

// Attach button listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnBack')?.addEventListener('click', goBack);
  document.getElementById('proceedBtn')?.addEventListener('click', proceedAnyway);
  document.getElementById('backLink')?.addEventListener('click', (e) => { e.preventDefault(); goBack(); });
  document.getElementById('navLogoBack')?.addEventListener('click', (e) => { e.preventDefault(); goBack(); });

  // Load warning data from session storage
  chrome.storage.session.get(['warnData', 'warnUrl'], ({ warnData, warnUrl }) => {
    if (!warnData || !warnUrl) {
      document.getElementById('warnUrl').textContent = 'Unknown URL';
      return;
    }

    targetUrl = warnUrl;
    const data   = warnData;
    const status = data.status || 'UNKNOWN';

    const cfg = {
      MALICIOUS: {
        icon: '🚨', cls: 'malicious', bgCls: '',
        badgeTxt: '⚠ Malicious URL',
        badgeStyle: 'border-color:rgba(239,68,68,0.3);color:#ef4444;background:rgba(239,68,68,0.08);',
        heading: 'Malicious URL Detected',
        desc: `This URL has been flagged as <strong>MALICIOUS</strong> by VirusTotal security engines.
               Visiting this site may expose you to malware, phishing attacks, or identity theft.
               We strongly recommend <strong>not</strong> proceeding.`
      },
      SUSPICIOUS: {
        icon: '⚠️', cls: 'suspicious', bgCls: 'suspicious-bg',
        badgeTxt: '⚠ Suspicious URL',
        badgeStyle: 'border-color:rgba(245,158,11,0.3);color:#f59e0b;background:rgba(245,158,11,0.08);',
        heading: 'Suspicious URL',
        desc: `This URL appears <strong>SUSPICIOUS</strong> based on our analysis. It exhibits patterns
               commonly linked to phishing, scam pages, or deceptive content. Proceed only if you
               fully trust the source.`
      },
      UNKNOWN: {
        icon: '❓', cls: 'unknown', bgCls: 'unknown-bg',
        badgeTxt: '? Unknown URL',
        badgeStyle: 'border-color:rgba(167,139,250,0.3);color:#a78bfa;background:rgba(167,139,250,0.08);',
        heading: 'Unknown URL',
        desc: `This URL is <strong>UNKNOWN</strong> — our scanners have limited data on it.
               It hasn't been verified as safe. We advise caution before proceeding.`
      },
    };

    const c = cfg[status] || cfg['UNKNOWN'];

    document.getElementById('warnPage').classList.add(c.bgCls);
    document.getElementById('warnCard').className      = `warn-card ${c.cls}-card`;
    document.getElementById('warnIcon').className      = `warn-icon ${c.cls}`;
    document.getElementById('warnIcon').textContent    = c.icon;
    document.getElementById('warnHeading').className   = `warn-heading ${c.cls}`;
    document.getElementById('warnHeading').textContent = c.heading;
    document.getElementById('warnDesc').innerHTML      = c.desc;
    document.getElementById('navBadge').innerHTML      = c.badgeTxt;
    document.getElementById('navBadge').style.cssText  = c.badgeStyle;
    document.getElementById('warnUrl').textContent     = warnUrl;

    // Stats
    if (data.stats) {
      document.getElementById('statM').textContent = data.stats.malicious  ?? 0;
      document.getElementById('statS').textContent = data.stats.suspicious ?? 0;
      document.getElementById('statH').textContent = data.stats.harmless   ?? 0;
      document.getElementById('statU').textContent = data.stats.undetected ?? 0;
      document.getElementById('warnStats').style.display = 'grid';
    }

    // Style proceed button to match threat level
    const pb = document.getElementById('proceedBtn');
    pb.className = `warn-btn-proceed ${c.cls}`;

    // Clear stored data
    chrome.storage.session.remove(['warnData', 'warnUrl']);
  });
});

