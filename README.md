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

---

URL Sentinel is a lightweight, blazing-fast security application designed to protect users from malicious, phishing, and scam links. It offers both a **Web Workspace** for manual URL analysis and a **Chrome Extension** that silently works in the background, intercepting your clicks and verifying link safety in real time against **90+ security engines**.

## 📸 Screenshots

*(Replace these placeholder images with the actual screenshots from your project directory)*

| Web Interface | Scan Results |
|:---:|:---:|
| <img src="/assets/web-interface.png" width="400" alt="Web Interface"> | <img src="/assets/scan-result.png" width="400" alt="Result Interface"> |

| Chrome Extension Popup | Unsafe URL Warning Block |
|:---:|:---:|
| <img src="/assets/extension-popup.png" width="400" alt="Popup Menu"> | <img src="/assets/warning-page.png.png" width="400" alt="Malicious URL Blocked"> |

---

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

## 🏗️ Architecture & Flow

### 1. Manual Scanning Flow (Web & Popup)
1. User enters a URL into the scanner.
2. The Request triggers `/scan-url` on the FastAPI server.
3. Server normalizes the URL, checks for suspicious patterns, and caches.
4. If missing from cache, it queries VirusTotal via base64url Identifier.
5. Scores are aggregated based on VT engines (Malicious/Suspicious/Harmless).
6. Result mapped to a UI block.

### 2. Chrome Extension Flow (Click Interception)
1. You browse normally; `content.js` listens to all left-clicks on `<a>` tags.
2. Upon click, navigation is paused. The link is dispatched to `background.js`.
3. An inline "Scanning..." toast notification appears on your screen.
4. `background.js` hits the FastAPI backend (or uses its local 5-minute memory cache).
5. **If SAFE:** The toast turns green, and you are automatically redirected.
6. **If UNSAFE:** The extension opens a local, secure `warning.html` interface detailing the exact threats detected with an option to bypass at your own risk.

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
