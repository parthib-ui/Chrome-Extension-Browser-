/**
 * URL Sentinel — popup.js
 * Manual URL scanner for the extension popup.
 * Uses /scan-url (no API key needed).
 */

const API_BASE = 'https://chrome-extension-browser-jqtb.onrender.com';
const HISTORY_KEY = 'ust_popup_history';

// ===================== HISTORY =====================
function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}
function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 30)));
}
function addToHistory(url, status) {
  const h = getHistory();
  h.unshift({ url, status, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  saveHistory(h);
  renderHistory();
}
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}
function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const h = getHistory();
  if (h.length === 0) {
    list.innerHTML = '<div class="history-empty">No scans yet.</div>';
    return;
  }
  list.innerHTML = h.map(item => `
    <div class="history-item" onclick="prefillUrl('${escHtml(item.url)}')">
      <div class="h-dot ${item.status.toLowerCase()}"></div>
      <div class="h-url" title="${escHtml(item.url)}">${escHtml(item.url)}</div>
      <div class="h-badge ${item.status.toLowerCase()}">${item.status}</div>
    </div>
  `).join('');
}
function prefillUrl(url) {
  const input = document.getElementById('urlInput');
  if (input) { input.value = url; input.focus(); }
}
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===================== SCAN =====================
async function scanUrl() {
  const urlInput  = document.getElementById('urlInput');
  const btn       = document.getElementById('scanBtn');
  const spinner   = document.getElementById('spinner');
  const btnText   = document.getElementById('btnText');
  const resultBox = document.getElementById('resultBox');
  const errorMsg  = document.getElementById('errorMsg');

  const rawUrl = urlInput.value.trim();
  resultBox.style.display = 'none';
  errorMsg.style.display  = 'none';

  if (!rawUrl) { showError('Please enter a URL.'); return; }

  btn.disabled = true;
  spinner.style.display = 'block';
  btnText.textContent   = 'Scanning…';

  try {
    const res  = await fetch(`${API_BASE}/scan-url?url=${encodeURIComponent(rawUrl)}`);
    const data = await res.json();

    if (data.error) { showError('Error: ' + data.error); return; }

    const status = data.status;
    addToHistory(data.url || rawUrl, status);
    showResult(data, rawUrl);

    if (status !== 'SAFE') {
      // Open warning page as a new tab, passing data via chrome.storage.session
      chrome.storage.session.set({ warnData: data, warnUrl: data.url || rawUrl }, () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('warning.html') });
      });
    }

  } catch (e) {
    showError('Could not reach the server. Check your connection.');
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent   = 'Scan URL';
  }
}

// ===================== RESULT =====================
function showResult(data, rawUrl) {
  const resultBox = document.getElementById('resultBox');
  const status = data.status;
  const map = {
    SAFE:       { cls:'safe',       emoji:'✅', colorCls:'c-safe',    label:'Safe'       },
    MALICIOUS:  { cls:'malicious',  emoji:'🚨', colorCls:'c-danger',  label:'Malicious'  },
    SUSPICIOUS: { cls:'suspicious', emoji:'⚠️', colorCls:'c-warn',    label:'Suspicious' },
    UNKNOWN:    { cls:'unknown',    emoji:'❓', colorCls:'c-unknown',  label:'Unknown'    },
  };
  const s = map[status] || map['UNKNOWN'];
  resultBox.className = `result-box ${s.cls}`;
  resultBox.innerHTML = `
    <div class="result-head">
      <span class="result-emoji">${s.emoji}</span>
      <span class="result-text ${s.colorCls}">${s.label}</span>
    </div>
    <div class="result-url">${escHtml(data.url || rawUrl)}</div>
    ${data.stats ? `
    <div class="result-meta">
      <div class="meta-chip"><div class="val c-danger">${data.stats.malicious ?? 0}</div><div class="lbl">Malicious</div></div>
      <div class="meta-chip"><div class="val c-warn">${data.stats.suspicious ?? 0}</div><div class="lbl">Suspicious</div></div>
      <div class="meta-chip"><div class="val c-safe">${data.stats.harmless ?? 0}</div><div class="lbl">Harmless</div></div>
      <div class="meta-chip"><div class="val">${data.stats.undetected ?? 0}</div><div class="lbl">Undetected</div></div>
    </div>` : ''}
    ${status === 'SAFE' ? '<div class="result-note c-safe">✅ This URL appears safe.</div>' : '<div class="result-note" style="color:var(--muted);font-size:0.72rem;">Opening warning page…</div>'}
  `;
  resultBox.style.display = 'block';
}

function showError(msg) {
  const e = document.getElementById('errorMsg');
  e.textContent = msg;
  e.style.display = 'block';
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
  const input = document.getElementById('urlInput');
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') scanUrl(); });
  document.getElementById('scanBtn')?.addEventListener('click', scanUrl);
  document.getElementById('btnClear')?.addEventListener('click', clearHistory);
});
