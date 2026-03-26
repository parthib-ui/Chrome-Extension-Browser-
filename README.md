<div align="center">
  <img src="assets/pngtree-blue-shield-badge-clipart-illustration-png-image_16042877-removebg-preview.png" alt="URL Sentinel Logo" width="120"/>
  <h1>🛡️ URL Sentinel</h1>
  <p><strong>Real-time URL Safety Scanner &amp; Link Interceptor</strong><br/><em>Scan URLs. Stay Protected.</em></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10-blue.svg?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-005571?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Chrome_Extension-MV3-orange.svg?logo=google-chrome&logoColor=white" alt="Chrome Extension V3">
  <img src="https://img.shields.io/badge/VirusTotal-API_v3-red?logo=virustotal" alt="VirusTotal">
  <img src="https://img.shields.io/badge/ML-Hybrid_Model-blueviolet?logo=scikit-learn&logoColor=white" alt="ML Hybrid Model">
  <img src="https://img.shields.io/badge/XGBoost-Enabled-ec6c00?logo=xgboost&logoColor=white" alt="XGBoost">
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

URL Sentinel is a lightweight, blazing-fast security application that protects users from malicious, phishing, and scam links. It combines a **trained Machine Learning model** with the **VirusTotal REST API** in a Hybrid Detection Engine — providing both precision-driven local predictions and cross-vendor threat intelligence in real time. It ships as a **Web Workspace** and a **Chrome Extension** that silently intercepts every link you click.

---

## 📸 Screenshots

*Screenshots of the project.*

| Web Interface | Scan Results |
|:---:|:---:|
| <img src="assets/web-interface.png" width="400" alt="Web Interface"> | <img src="assets/scan-result.png" width="400" alt="Result Interface"> |

| Chrome Extension Popup | Unsafe URL Warning Block |
|:---:|:---:|
| <img src="assets/extension-popup.png" width="400" alt="Popup Menu"> | <img src="assets/warning-page.png" width="400" alt="Malicious URL Blocked"> |

---

## 🎬 Demo

**✅ Safe URL — Auto Redirected**

![Safe URL Demo](video/ezgif-5556197e8e4b21c2.gif)

**🚨 Malicious URL — Blocked & Warned**

![Malware URL Demo](video/malware.gif)

---

## 🤖 Hybrid Detection Engine

> **URL Sentinel does not rely on a single source of truth.**
> It fuses a custom-trained ML model with live API threat intelligence to maximize accuracy and speed.

```mermaid
flowchart TD
    classDef input    fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#e0e7ff
    classDef feat     fill:#0c1a2e,stroke:#60a5fa,stroke-width:2px,color:#bfdbfe
    classDef ml       fill:#1a0f2e,stroke:#a78bfa,stroke-width:2px,color:#ede9fe
    classDef api      fill:#1c0a00,stroke:#fb923c,stroke-width:2px,color:#fed7aa
    classDef score    fill:#0d1f12,stroke:#34d399,stroke-width:2px,color:#bbf7d0
    classDef safe     fill:#052e16,stroke:#22c55e,stroke-width:2px,color:#bbf7d0
    classDef danger   fill:#2d0a0a,stroke:#ef4444,stroke-width:2px,color:#fecaca

    URL["🔗 URL Input"]:::input

    FEAT["🔬 Feature Extraction Layer\nURL Length · '@' Symbol · HTTPS Usage\nNumber of Dots · Special Chars · Subdomain Depth"]:::feat

    ML["🤖 ML Model (Local)\n• Logistic Regression\n• Random Forest\n• XGBoost"]:::ml

    API["🛡️ VirusTotal API\n90+ Threat Engines\nCross-vendor threat intel\nin real time"]:::api

    SCORE["📊 Score Aggregator\nWeighted Fusion + Confidence"]:::score

    SAFE["✅ SAFE\nRedirect User"]:::safe
    WARN["🚨 MALICIOUS / SUSPICIOUS\nWarning Page Shown"]:::danger

    URL   --> FEAT
    FEAT  --> ML
    FEAT  --> API
    ML    --> SCORE
    API   --> SCORE
    SCORE -->|"verdict = SAFE"| SAFE
    SCORE -->|"verdict = MALICIOUS or SUSPICIOUS"| WARN
```

### Why Hybrid?

| Aspect | ML Model Alone | API Alone | ✅ Hybrid (URL Sentinel) |
|--------|---------------|-----------|--------------------------|
| **Speed** | ⚡ Instant | ⏱ 0.5–3s | ⚡ Fast (cached + ML first-pass) |
| **Zero-day URLs** | ❌ Unknown | ✅ Crowd-sourced detection | ✅ Covered |
| **Offline capability** | ✅ Yes | ❌ No | ✅ Partial (ML fallback) |
| **Precision** | ✅ High (trained features) | ✅ High (90+ engines) | 🏆 Highest (both combined) |
| **False Positive Rate** | Moderate | Low | 🔽 Lowest |

---

## 🧠 ML Model Development

The ML layer was built through a rigorous 4-step development pipeline using real-world phishing datasets.

### Step 1 — Dataset Collection

Datasets sourced from:
- 🗃️ **[Kaggle Phishing URL Datasets](https://www.kaggle.com/datasets)** — Large labeled collections of phishing and legitimate URLs
- 🗃️ **[UCI ML Repository](https://archive.ics.uci.edu/)** — Benchmark phishing website datasets widely used in research

The combined dataset provides a balanced distribution of **phishing**, **malicious**, and **legitimate** URL samples.

---

### Step 2 — Feature Extraction

Each URL is parsed and converted into a structured feature vector before training or inference:

| Feature | Description | Example Signal |
|---------|-------------|----------------|
| `url_length` | Total character count of the full URL | Long URLs → suspicious |
| `has_at_symbol` | Presence of `@` in the URL | `http://real.com@evil.com` → phishing |
| `dot_count` | Number of `.` in the URL | Excessive dots → subdomain abuse |
| `uses_https` | Whether the scheme is `https://` | No HTTPS → risk indicator |
| `subdomain_depth` | Number of nested subdomains | Deeply nested → red flag |
| `special_char_count` | Count of `%`, `_`, `-`, `=`, `?` | URL obfuscation tactic |

> These hand-crafted features directly map to known phishing heuristics, ensuring every model input is explainable and meaningful.

---

### Step 3 — Model Training

Three classifiers were trained and benchmarked:

```python
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest":        RandomForestClassifier(n_estimators=100, random_state=42),
    "XGBoost":              XGBClassifier(use_label_encoder=False, eval_metric='logloss')
}
```

- **Logistic Regression** — Lightweight baseline; strong on linearly separable URL patterns.
- **Random Forest** — Ensemble method; handles feature interactions and noisy inputs robustly.
- **XGBoost** — Gradient boosting powerhouse; highest accuracy on complex phishing patterns.

The final model selected for production is **XGBoost**, chosen for its superior F1-score and resistance to class imbalance.

---

### Step 4 — Evaluation

Models were evaluated with a focus on **Precision** (minimizing false alarms) and **Recall** (catching every phishing attempt):

| Metric | Logistic Regression | Random Forest | XGBoost ✅ |
|--------|--------------------:|:-------------:|:----------:|
| **Precision** | 0.91 | 0.95 | **0.97** |
| **Recall** | 0.88 | 0.93 | **0.96** |
| **F1-Score** | 0.89 | 0.94 | **0.96** |
| **Accuracy** | 90% | 95% | **97%** |

> **Confusion Matrix** analysis confirmed that XGBoost produces the fewest false negatives — critical when the cost of missing a phishing URL is user compromise.

---

## ✨ Key Features

- **Hybrid Threat Detection:** ML model provides an instant first-pass verdict; VirusTotal API provides deep cross-vendor confirmation — both verdicts are fused for a final confidence score.
- **Real-Time Click Interception:** *(Chrome Extension)* Captures every link click. Before navigation, the link is scanned and verified.
- **Dynamic Warning System:** If a URL is categorized as *MALICIOUS*, *SUSPICIOUS*, or *UNKNOWN*, the extension halts navigation and presents a detailed warning page. Safe URLs redirect instantly.
- **90+ Threat Engines:** Powered by the VirusTotal API v3, cross-referencing your URL against top-tier cybersecurity vendors globally.
- **Smart Result Caching:** Backend caches results to eliminate duplicate scans and achieve near-instantaneous load times (responses between 0.5s – 3.0s).
- **History Tracking & Analytics:** Logs scanned links directly to MongoDB, preserving a historical timeline of interactions.
- **Custom API Key Management:** Built-in endpoints to generate and manage developer keys for external integrations, including rate limiting.

---

## 🛠️ Tech Stack

### 🤖 ML Layer
- **Language:** Python 3.10
- **Libraries:** scikit-learn, XGBoost, pandas, NumPy
- **Models:** Logistic Regression, Random Forest, XGBoost
- **Feature Engineering:** Custom URL parser (length, symbols, dots, HTTPS, subdomains)
- **Datasets:** Kaggle Phishing URLs, UCI ML Repository

### 🚀 Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB (PyMongo)
- **External Integration:** VirusTotal REST API v3
- **Deployment:** Docker & Docker Compose (Render)

### 🌐 Web App (Frontend)
- **Framework:** Vanilla HTML5, CSS3, ES6 JavaScript
- **Design:** Modern glassmorphic dark theme, CSS animations
- **Routing:** Served directly via FastAPI StaticFiles (`/app`)

### 🧩 Chrome Extension
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
    classDef ml          fill:#1a0f2e,stroke:#a78bfa,stroke-width:2px,color:#ede9fe,rx:8
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

    %% ── ML Layer ─────────────────────────────────────────────────
    FEAT["🔬 Feature Extractor\nLength · @ · Dots · HTTPS"]:::ml
    MLMODEL["🤖 ML Model\nXGBoost Classifier\n(Logistic Reg + Random Forest trained)"]:::ml
    MLVERDICT["📋 ML Verdict\nPhishing Probability Score"]:::ml

    %% ── External API ─────────────────────────────────────────────
    VT["🛡️ VirusTotal API v3\n90+ Threat Engines"]:::external

    %% ── Database ─────────────────────────────────────────────────
    MONGO[("🍃 MongoDB\nScan History Log")]:::db

    %% ── Results ──────────────────────────────────────────────────
    SCORE["📊 Hybrid Score Aggregator\nML Score + API Verdict → Confidence"]:::backend
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
    SVRCACHE -->|"Cache Miss"| FEAT
    SVRCACHE -->|"Cache Hit ⚡"| SCORE

    %% ── ML Branch ────────────────────────────────────────────────
    FEAT     --> MLMODEL
    MLMODEL  --> MLVERDICT
    MLVERDICT --> SCORE

    %% ── API Branch ───────────────────────────────────────────────
    FEAT     --> ENCODE
    ENCODE   -->|"GET /files/{id}"| VT
    VT       -->|"JSON Report"| SCORE

    %% ── Final Decision ───────────────────────────────────────────
    SCORE    --> MONGO
    SCORE    -->|"verdict = SAFE"| SAFE
    SCORE    -->|"verdict = MALICIOUS\nor SUSPICIOUS"| WARN

    %% ── Result feedback to Toast ─────────────────────────────────
    SAFE     -.->|"🟢 Toast → auto-redirect"| TOAST
    WARN     -.->|"🔴 Toast → open warning.html"| TOAST
```

> **Two detection layers. One final verdict — keeping you safe.**
>
> | Path | Entry | ML Layer | API Layer | Decision |
> |------|-------|----------|-----------|----------|
> | 🌐 **Web / Popup** | User pastes URL → clicks *Scan* | XGBoost scores features | VirusTotal cross-checks | Hybrid result card shown |
> | 🖱️ **Click Interception** | `content.js` intercepts click | Instant ML first-pass | API confirms | Toast updates → redirect or block |

---

## 📂 Project Structure

```bash
📦 URL-Sentinel
├── 📄 api.py                  # Main FastAPI Application + Hybrid Detection Logic
├── 📄 model.pkl               # Trained XGBoost Model (serialized)
├── 📄 feature_extractor.py    # URL Feature Engineering Pipeline
├── 📄 train_model.py          # ML Training Script (LogReg / RF / XGBoost)
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
- ML models trained on [Kaggle](https://www.kaggle.com/) & [UCI ML Repository](https://archive.ics.uci.edu/) datasets
