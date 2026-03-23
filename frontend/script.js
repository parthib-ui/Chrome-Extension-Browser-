const BASE = "http://98.81.87.78";

// ---- Key management ----
function saveKey(key) {
  localStorage.setItem("api_key", key);
}
function loadKey() {
  return localStorage.getItem("api_key") || "";
}

document.addEventListener("DOMContentLoaded", () => {
  const keyInput = document.getElementById("apikey");
  const urlInput = document.getElementById("urlInput");
  const btn = document.getElementById("scanBtn");
  const spinner = document.getElementById("spinner");
  const btnText = document.getElementById("btnText");
  const resultBox = document.getElementById("resultBox");
  const errorMsg = document.getElementById("errorMsg");

  if (keyInput) keyInput.value = loadKey();

  // Auto-save API key as user types
  if (keyInput) {
    keyInput.addEventListener("input", () => saveKey(keyInput.value.trim()));
  }

  // Allow Enter key to trigger scan
  if (urlInput) {
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") scanUrl();
    });
  }
});

async function generateKey() {
  const btn = document.getElementById("genKeyBtn");
  btn.disabled = true;
  btn.textContent = "Generating…";
  try {
    const res = await fetch(BASE + "/generate-key", { method: "POST" });
    const data = await res.json();
    const keyInput = document.getElementById("apikey");
    keyInput.value = data.api_key;
    saveKey(data.api_key);
  } catch (e) {
    showError("Failed to generate key. Is the server running?");
  } finally {
    btn.disabled = false;
    btn.textContent = "Generate Key";
  }
}

async function scanUrl() {
  const urlInput = document.getElementById("urlInput");
  const keyInput = document.getElementById("apikey");
  const btn = document.getElementById("scanBtn");
  const spinner = document.getElementById("spinner");
  const btnText = document.getElementById("btnText");
  const resultBox = document.getElementById("resultBox");
  const errorMsg = document.getElementById("errorMsg");

  const rawUrl = urlInput.value.trim();
  const apiKey = keyInput ? keyInput.value.trim() : loadKey();

  // Hide previous results
  resultBox.style.display = "none";
  errorMsg.style.display = "none";

  if (!rawUrl) {
    showError("Please enter a URL to scan.");
    return;
  }

  // Show loading
  btn.disabled = true;
  spinner.style.display = "block";
  btnText.textContent = "Scanning…";

  try {
    const headers = {};
    // Use /check with auth if key provided, else /scan-url (no auth)
    let endpoint;
    if (apiKey) {
      endpoint = `${BASE}/check?url=${encodeURIComponent(rawUrl)}`;
      headers["x-api-key"] = apiKey;
    } else {
      endpoint = `${BASE}/scan-url?url=${encodeURIComponent(rawUrl)}`;
    }

    const res = await fetch(endpoint, { headers });
    const data = await res.json();

    if (data.error) {
      showError("Error: " + data.error);
      return;
    }

    const status = data.status; // SAFE | MALICIOUS | SUSPICIOUS | UNKNOWN

    if (status === "SAFE") {
      // Show safe result, then redirect after short delay
      showResult(data, rawUrl);
      setTimeout(() => {
        window.location.href = data.url || rawUrl;
      }, 1800);
    } else {
      // Redirect to warning page with data in sessionStorage
      sessionStorage.setItem("warnData", JSON.stringify(data));
      sessionStorage.setItem("warnUrl", data.url || rawUrl);
      window.location.href = "warning.html";
    }

  } catch (e) {
    showError("Could not reach the server. Please check your connection.");
  } finally {
    btn.disabled = false;
    spinner.style.display = "none";
    btnText.textContent = "Scan & Check URL";
  }
}

function showResult(data, rawUrl) {
  const resultBox = document.getElementById("resultBox");
  const status = data.status;

  const statusMap = {
    SAFE:       { cls: "safe",      icon: "✅", colorCls: "status-safe",    label: "Safe" },
    MALICIOUS:  { cls: "malicious", icon: "🚨", colorCls: "status-danger",  label: "Malicious" },
    SUSPICIOUS: { cls: "suspicious",icon: "⚠️", colorCls: "status-warn",    label: "Suspicious" },
    UNKNOWN:    { cls: "unknown",   icon: "❓", colorCls: "status-unknown",  label: "Unknown" },
  };
  const s = statusMap[status] || statusMap["UNKNOWN"];

  resultBox.className = `result-box ${s.cls}`;
  resultBox.innerHTML = `
    <div class="result-label">Scan Result</div>
    <div class="result-status ${s.colorCls}">
      <span>${s.icon}</span> ${s.label}
    </div>
    <div class="result-url">${data.url || rawUrl}</div>
    ${data.stats ? `
    <div class="result-meta">
      <div class="meta-item"><div class="meta-key">Malicious</div><div class="meta-val status-danger">${data.stats.malicious ?? 0}</div></div>
      <div class="meta-item"><div class="meta-key">Suspicious</div><div class="meta-val status-warn">${data.stats.suspicious ?? 0}</div></div>
      <div class="meta-item"><div class="meta-key">Harmless</div><div class="meta-val status-safe">${data.stats.harmless ?? 0}</div></div>
      <div class="meta-item"><div class="meta-key">Undetected</div><div class="meta-val">${data.stats.undetected ?? 0}</div></div>
    </div>` : ""}
    ${status === "SAFE" ? '<div style="margin-top:12px;font-size:0.82rem;color:var(--safe);">✅ Redirecting you to the site…</div>' : ""}
  `;
  resultBox.style.display = "block";
}

function showError(msg) {
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}
