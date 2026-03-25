<div align="center">
  <img src="assets/pngtree-blue-shield-badge-clipart-illustration-png-image_16042877-removebg-preview.png" alt="URL Sentinel Logo" width="120"/>
  <h1>🛡️ URL Sentinel</h1>
  <p><strong>Real-time URL Safety Scanner & Link Interceptor</strong><br/><em>Scan URLs. Stay Protected.</em></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10-blue.svg?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-005571?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Chrome_Extension-MV3-orange.svg?logo=google-chrome&logoColor=white" alt="Chrome Extension V3">
  <img src="https://img.shields.io/badge/VirusTotal-API_v3-red?logo=virustotal" alt="VirusTotal">
</p>

<p align="center">
  <a href="https://chrome-extension-browser-jqtb.onrender.com/app" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-Try%20URL%20Sentinel-6366f1?style=for-the-badge&logoColor=white" alt="Live Demo">
  </a>
  &nbsp;
  <a href="https://chrome-extension-browser-jqtb.onrender.com/app" target="_blank">
    <img src="https://img.shields.io/website?down_color=ef4444&down_message=Offline&label=Status&style=for-the-badge&up_color=22c55e&up_message=Online&url=https%3A%2F%2Fchrome-extension-browser-jqtb.onrender.com%2Fapp" alt="Status">
  </a>
</p>

<p align="center">
  🔗 <strong><a href="https://chrome-extension-browser-jqtb.onrender.com/app">https://chrome-extension-browser-jqtb.onrender.com/app</a></strong>
</p>

---

URL Sentinel is a lightweight, blazing-fast security application designed to protect users from malicious, phishing, and scam links. It offers both a **Web Workspace** for manual URL analysis and a **Chrome Extension** that silently works in the background, intercepting your clicks and verifying link safety in real time against **90+ security engines**.

## 📸 Screenshots

*Screenshots of the project.*

| Web Interface | Scan Results |
|:---:|:---:|
| <img src="assets/web-interface.png" width="400" alt="Web Interface"> | <img src="assets/scan-result.png" width="400" alt="Result Interface"> |

| Chrome Extension Popup | Unsafe URL Warning Block |
|:---:|:---:|
| <img src="assets/extension-popup.png" width="400" alt="Popup Menu"> | <img src="assets/warning-page.png" width="400" alt="Malicious URL Blocked"> |

---
*Short Implementation of the project.*
## 🎬 Demo

**✅ Safe URL — Auto Redirected**

![Safe URL Demo](video/ezgif-5556197e8e4b21c2.gif)

**🚨 Malicious URL — Blocked & Warned**

![Malware URL Demo](video/malware.gif)


## ✨ Key Features

- **Real-Time Click Interception:** (Chrome Extension) Captures every link you click. Before you navigate away, the link is scanned and verified.
- **Dynamic Warning System:** If a URL is categorized as *MALICIOUS*, *SUSPICIOUS*, or *UNKNOWN*, the extension halts navigation and presents a detailed warning page. Safe URLs redirect instantly.
- **90+ Threat Engines:** Powered by the VirusTotal API v3, cross-referencing your URL against top-tier cybersecurity vendors globally.
- **Smart Result Caching:** The backend heavily caches results to eliminate duplicate scans and achieve near-instantaneous load times (responses between 0.5s – 3.0s).
- **History Tracking & Analytics:** Logs scanned links directly to MongoDB, preserving a historical timeline of interactions.
- **Custom API Key Management:** Built-in endpoints to generate and manage developer keys for external integrations, including request limitations.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB (PyMongo)
- **External Integration:** VirusTotal REST API v3
- **Deployment:** Docker & Docker Compose (Render)

### Web App (Frontend)
- **Framework:** Vanilla HTML5, CSS3, ES6 JavaScript
- **Design:** Modern glassmorphic dark theme, CSS animations
- **Routing:** Served directly via FastAPI StaticFiles (`/app`)

### Chrome Extension
- **Platform:** Chrome Extension Manifest V3 (MV3)
- **Components:**
  - `background.js`: Service worker handling API routing & request caching.
  - `content.js`: Injected script tracking clicks and rendering "Scanning" inline toasts.
  - `popup.html`: Quick-access scanning dashboard right from the browser toolbar.
  - `warning.html`: Full-scale diversion page for unsafe links.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    %% ── Styling ──────────────────────────────────────────────────
    classDef user        fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#e0e7ff,rx:8
    classDef ext         fill:#0f2027,stroke:#38bdf8,stroke-width:2px,color:#bae6fd,rx:8
    classDef backend     fill:#0d1f12,stroke:#34d399,stroke-width:2px,color:#bbf7d0,rx:8
    classDef external    fill:#1c0a00,stroke:#fb923c,stroke-width:2px,color:#fed7aa,rx:8
    classDef db          fill:#1a0533,stroke:#a855f7,stroke-width:2px,color:#e9d5ff,rx:8
    classDef safe        fill:#052e16,stroke:#22c55e,stroke-width:2px,color:#bbf7d0,rx:8
    classDef danger      fill:#2d0a0a,stroke:#ef4444,stroke-width:2px,color:#fecaca,rx:8
    classDef cache       fill:#0c1a2e,stroke:#60a5fa,stroke-width:2px,color:#bfdbfe,rx:8

    %% ── Entry Points ─────────────────────────────────────────────
    WEB["🌐 Web App\n/app — index.html"]:::user
    POPUP["🧩 Extension Popup\npopup.html"]:::ext
    CLICK["🖱️ User Clicks a Link\ncontent.js intercepts"]:::ext

    %% ── Extension Layer ──────────────────────────────────────────
    TOAST["💬 'Scanning…' Toast\nOverlay injected by content.js"]:::ext
    BG["⚙️ background.js\nService Worker"]:::ext
    EXCACHE{"🗄️ Extension Cache\n5-min memory cache"}:::cache

    %% ── FastAPI Backend ──────────────────────────────────────────
    API["🚀 FastAPI Backend\napi.py :8000"]:::backend
    NORM["🔍 URL Normaliser\n+ Pattern Check"]:::backend
    SVRCACHE{"🗄️ Server Cache\nIn-memory LRU"}:::cache
    ENCODE["🔐 Base64url Encoder\nVirusTotal Identifier"]:::backend

    %% ── External API ─────────────────────────────────────────────
    VT["🛡️ VirusTotal API v3\n90+ Threat Engines"]:::external

    %% ── Database ─────────────────────────────────────────────────
    MONGO[("🍃 MongoDB\nScan History Log")]:::db

    %% ── Results ──────────────────────────────────────────────────
    SCORE["📊 Score Aggregator\nMalicious / Suspicious / Harmless"]:::backend
    SAFE["✅ SAFE\nRedirect User"]:::safe
    WARN["🚨 WARNING PAGE\nwarning.html\nBypass at own risk"]:::danger

    %% ── FLOW: Web & Popup ────────────────────────────────────────
    WEB      -->|"POST /scan-url"| API
    POPUP    -->|"POST /scan-url"| API

    %% ── FLOW: Extension Click ────────────────────────────────────
    CLICK    --> TOAST
    CLICK    --> BG
    BG       --> EXCACHE
    EXCACHE  -->|"Cache Miss"| API
    EXCACHE  -->|"Cache Hit ⚡"| SCORE

    %% ── FLOW: Backend Pipeline ───────────────────────────────────
    API      --> NORM
    NORM     --> SVRCACHE
    SVRCACHE -->|"Cache Miss"| ENCODE
    SVRCACHE -->|"Cache Hit ⚡"| SCORE
    ENCODE   -->|"GET /files/{id}"| VT
    VT       -->|"JSON Report"| SCORE
    SCORE    --> MONGO
    SCORE    -->|"verdict = SAFE"| SAFE
    SCORE    -->|"verdict = MALICIOUS\nor SUSPICIOUS"| WARN

    %% ── Result feedback to Toast ─────────────────────────────────
    SAFE     -.->|"🟢 Toast → auto-redirect"| TOAST
    WARN     -.->|"🔴 Toast → open warning.html"| TOAST
```

> **Two paths, one goal — keeping you safe.**
>
> | Path | Entry | Decision |
> |------|-------|----------|
> | 🌐 **Web / Popup** | User pastes URL → clicks *Scan* | Result card rendered inline |
> | 🖱️ **Click Interception** | `content.js` intercepts click | Toast updates → redirect or block |

---

## 📂 Project Structure

```bash
📦 URL-Sentinel
├── 📄 api.py                  # Main FastAPI Application
├── 📄 Dockerfile              # Docker settings for Render deployment
├── 📄 docker-compose.yml      # Local dev environment
├── 📄 requirements.txt        # Python dependency list
├── 📂 frontend/               # Web Application
│   ├── 📄 index.html          # Landing Page
│   ├── 📄 script.js           # Web logic (API connection)
│   ├── 📄 style.css           # Web styles
│   └── 📄 warning.html        # Web Warning screen
├── 📂 extension/              # Chrome Extension (MV3)
│   ├── 📄 manifest.json       # Permissions and configs
│   ├── 📄 background.js       # Core service worker + cache
│   ├── 📄 content.js          # Click interceptor
│   ├── 📄 content.css         # Toast overlay styles
│   ├── 📄 popup.html/js/css   # UI for extension
│   └── 📄 warning.html/js/css # Extension Warning screen
└── 📂 assets/                 # Shared images, icons, and logos
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- MongoDB instance (Local or Atlas)
- VirusTotal API key

### Local Setup (Backend + Web)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/parthib-ui/Chrome-Extension-Browser-.git
   cd Chrome-Extension-Browser-
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URL=mongodb+srv://<user>:<password>@cluster0...
   VIRUS_API_KEY=<your_virustotal_api_key>
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Server:**
   ```bash
   uvicorn api:app --reload --host 0.0.0.0 --port 8000
   ```
   *Web interface will be available at: `http://localhost:8000/app`*

### Installing the Chrome Extension

1. Open Google Chrome and type `chrome://extensions/` in the URL bar.
2. Toggle **Developer mode** on (top right corner).
3. Click the **Load unpacked** button.
4. Navigate to your project directory and select the `extension/` folder.
5. Pin the URL Sentinel extension to your toolbar. You're now protected 24/7!

---

## 🛡️ License & Credits
- Made with ❤️ by **Parthib Ghosh**
- Powered by the [VirusTotal API](https://www.virustotal.com/)
