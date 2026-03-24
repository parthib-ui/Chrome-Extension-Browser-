const BASE = "https://chrome-extension-browser-jqtb.onrender.com";

// ===================== HISTORY =====================
const HISTORY_KEY = "url_sentinel_history";

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 50)));
}
function addToHistory(url, status) {
  const h = getHistory();
  h.unshift({ url, status, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  saveHistory(h);
  renderHistory();
}
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}
function renderHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;
  const h = getHistory();
  if (h.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">🕒</div>
        <div class="history-empty-text">No history yet. Start scanning URLs!</div>
      </div>`;
    return;
  }
  list.innerHTML = `<div class="history-list">${h.map(item => `
    <div class="history-item" onclick="reScan('${encodeURIComponent(item.url)}')">
      <div class="h-dot ${item.status.toLowerCase()}"></div>
      <div class="h-url">${item.url}</div>
      <div class="h-badge ${item.status.toLowerCase()}">${item.status}</div>
      <div class="h-time">${item.time}</div>
    </div>`).join("")}
  </div>`;
}
function reScan(encodedUrl) {
  const url = decodeURIComponent(encodedUrl);
  const input = document.getElementById("urlInput");
  if (input) { input.value = url; input.focus(); }
}

// ===================== SCAN =====================
async function scanUrl() {
  const urlInput = document.getElementById("urlInput");
  const btn      = document.getElementById("scanBtn");
  const spinner  = document.getElementById("spinner");
  const btnText  = document.getElementById("btnText");
  const resultBox = document.getElementById("resultBox");
  const errorMsg  = document.getElementById("errorMsg");

  const rawUrl = urlInput.value.trim();
  resultBox.style.display = "none";
  errorMsg.style.display  = "none";

  if (!rawUrl) { showError("Please enter a URL to scan."); return; }

  btn.disabled = true;
  spinner.style.display = "block";
  btnText.textContent   = "Scanning…";

  try {
    const endpoint = `${BASE}/scan-url?url=${encodeURIComponent(rawUrl)}`;
    const res  = await fetch(endpoint);
    const data = await res.json();

    if (data.error) { showError("Error: " + data.error); return; }

    const status = data.status;
    addToHistory(data.url || rawUrl, status);

    if (status === "SAFE") {
      showResult(data, rawUrl);
      setTimeout(() => { window.location.href = data.url || rawUrl; }, 1800);
    } else {
      sessionStorage.setItem("warnData", JSON.stringify(data));
      sessionStorage.setItem("warnUrl",  data.url || rawUrl);
      window.location.href = "warning.html";
    }
  } catch (e) {
    showError("Could not reach the server. Is it running?");
  } finally {
    btn.disabled = false;
    spinner.style.display = "none";
    btnText.textContent   = "Scan URL";
  }
}

// ===================== RESULT =====================
function showResult(data, rawUrl) {
  const resultBox = document.getElementById("resultBox");
  const status = data.status;
  const map = {
    SAFE:       { cls: "safe",       emoji: "✅", colorCls: "c-safe",    label: "Safe — Redirecting…" },
    MALICIOUS:  { cls: "malicious",  emoji: "🚨", colorCls: "c-danger",  label: "Malicious" },
    SUSPICIOUS: { cls: "suspicious", emoji: "⚠️", colorCls: "c-warn",    label: "Suspicious" },
    UNKNOWN:    { cls: "unknown",    emoji: "❓", colorCls: "c-unknown",  label: "Unknown" },
  };
  const s = map[status] || map["UNKNOWN"];
  resultBox.className = `result-box ${s.cls}`;
  resultBox.innerHTML = `
    <div class="result-head">
      <span class="result-status-emoji">${s.emoji}</span>
      <span class="result-status-text ${s.colorCls}">${s.label}</span>
    </div>
    <div class="result-url">${data.url || rawUrl}</div>
    ${data.stats ? `
    <div class="result-meta">
      <div class="meta-chip"><div class="val c-danger">${data.stats.malicious ?? 0}</div><div class="lbl">Malicious</div></div>
      <div class="meta-chip"><div class="val c-warn">${data.stats.suspicious ?? 0}</div><div class="lbl">Suspicious</div></div>
      <div class="meta-chip"><div class="val c-safe">${data.stats.harmless ?? 0}</div><div class="lbl">Harmless</div></div>
      <div class="meta-chip"><div class="val">${data.stats.undetected ?? 0}</div><div class="lbl">Undetected</div></div>
    </div>` : ""}
    ${status === "SAFE" ? '<div class="result-redirect">✅ Redirecting you to the site in 2 seconds…</div>' : ""}
  `;
  resultBox.style.display = "block";
}

function showError(msg) {
  const e = document.getElementById("errorMsg");
  e.textContent = msg;
  e.style.display = "block";
}

// ===================== ENTER KEY =====================
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  const input = document.getElementById("urlInput");
  if (input) input.addEventListener("keydown", e => { if (e.key === "Enter") scanUrl(); });
});
