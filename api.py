from datetime import datetime
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import requests
import time
import base64
import validators
import tldextract
import socket
from urllib.parse import urlparse
from dotenv import load_dotenv
import os
from pymongo import MongoClient
import uuid
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/app", StaticFiles(directory="frontend", html=True), name="frontend")
load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL)

db = client["api_service"]

api_keys_collection = db["keys"]
logs_collection = db["logs"]
VIRUS_API_KEY = os.getenv("VIRUS_API_KEY")

#MY_API_KEY = "expl_chk_069"




#------------------- CORS ----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return RedirectResponse(url="/app")

API_KEY = VIRUS_API_KEY

headers = {
    "x-apikey": API_KEY
}
def verify_api_key(x_api_key: str = Header(None)):

    if x_api_key is None:
        raise HTTPException(
            status_code=401,
            detail="API Key missing"
        )

    key = api_keys_collection.find_one({"key": x_api_key})

    if not key:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )

    if key["used"] >= key["limit"]:
        raise HTTPException(
            status_code=403,
            detail="API limit reached"
        )

    api_keys_collection.update_one(
        {"key": x_api_key},
        {"$inc": {"used": 1}}
    )
# ---------------- CONFIG ----------------

shorteners = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "rb.gy"
]

suspicious_words = [
    "login",
    "verify",
    "bank",
    "secure",
    "update",
    "free",
    "gift",
    "paypal",
    "account",
    "bonus",
    "signin"
]


# ---------------- HELPERS ----------------

def normalize_url(url: str):
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    return url

def check_url_format(url):
    if not validators.url(url):
        return False
    return True

def check_shortener(domain):
    return domain in shorteners

def check_keywords(url):
    for word in suspicious_words:
        if word in url.lower():
            return True
    return False

def get_ip(domain):
    try:
        return socket.gethostbyname(domain)
    except:
        return None

def get_vt_url_id(url: str) -> str:
    """Compute the VirusTotal URL identifier (base64url, no padding)."""
    return base64.urlsafe_b64encode(url.encode()).decode().rstrip("=")

def _vt_scan(url: str) -> dict:
    """
    Fast VirusTotal scan:
    1. Try cached result first  → instant if URL was seen before
    2. Submit fresh scan + poll every 2 s (max 4 attempts = ~8 s worst-case)
    """
    url_id = get_vt_url_id(url)

    # --- Step 1: cache lookup ---
    try:
        r = requests.get(
            f"https://www.virustotal.com/api/v3/urls/{url_id}",
            headers=headers,
            timeout=8
        )
        if r.status_code == 200:
            data = r.json().get("data", {})
            stats = data.get("attributes", {}).get("last_analysis_stats")
            if stats:
                return stats  # cache hit — return immediately
    except Exception:
        pass

    # --- Step 2: submit ---
    try:
        resp = requests.post(
            "https://www.virustotal.com/api/v3/urls",
            headers=headers,
            data={"url": url},
            timeout=10
        )
        result = resp.json()
    except Exception as e:
        raise RuntimeError("VirusTotal submission failed")

    if "data" not in result:
        raise RuntimeError("VirusTotal submission error")

    analysis_id = result["data"]["id"]

    # --- Step 3: poll (2 s × 4 = up to 8 s) ---
    last_stats = None
    for _ in range(4):
        time.sleep(2)
        try:
            ar = requests.get(
                f"https://www.virustotal.com/api/v3/analyses/{analysis_id}",
                headers=headers,
                timeout=8
            )
            final = ar.json()
            if "data" in final:
                attrs = final["data"].get("attributes", {})
                last_stats = attrs.get("stats")
                if attrs.get("status") == "completed" and last_stats:
                    return last_stats  # done early
        except Exception:
            pass

    # Return whatever we have (may be partial)
    if last_stats:
        return last_stats
    raise RuntimeError("Scan timed out")

def compute_status(stats: dict, short: bool, keyword_flag: bool) -> tuple:
    malicious  = stats.get("malicious",  0)
    suspicious = stats.get("suspicious", 0)
    harmless   = stats.get("harmless",   0)
    undetected = stats.get("undetected", 0)
    score = 0
    if malicious  > 0: score += 5
    if suspicious > 0: score += 3
    if short:          score += 2
    if keyword_flag:   score += 2
    if undetected > harmless: score += 1
    if score >= 5:   status = "MALICIOUS"
    elif score >= 3: status = "SUSPICIOUS"
    elif score >= 1: status = "UNKNOWN"
    else:            status = "SAFE"
    return status, score

@app.post("/generate-key")
def generate_key():

    new_key = str(uuid.uuid4())

    api_keys_collection.insert_one({
        "key": new_key,
        "user": "default_user",
        "used": 0,
        "limit": 10
    })
    return {
        "api_key": new_key
    }
@app.delete("/delete-key")
def delete_key(x_api_key: str = Header(None)):

    if x_api_key is None:
        raise HTTPException(
            status_code=401,
            detail="API Key missing"
        )

    key = api_keys_collection.find_one({"key": x_api_key})

    if not key:
        raise HTTPException(
            status_code=404,
            detail="Key not found"
        )

    api_keys_collection.delete_one({"key": x_api_key})

    return {
        "message": "API key deleted"
    }
@app.get("/key-info")
def key_info(x_api_key: str = Header(None)):

    if x_api_key is None:
        raise HTTPException(
            status_code=401,
            detail="API Key missing"
        )

    key = api_keys_collection.find_one({"key": x_api_key})

    if not key:
        raise HTTPException(
            status_code=404,
            detail="Invalid key"
        )

    remaining = key["limit"] - key["used"]

    return {
        "key": key["key"],
        "used": key["used"],
        "limit": key["limit"],
        "remaining": remaining
    }
@app.get("/all-keys")
def all_keys():

    keys = list(api_keys_collection.find({}, {"_id": 0}))

    return {
        "keys": keys
    }
# ---------------- MAIN API ----------------

@app.get("/scan-url")
def scan_url(url: str):
    url = normalize_url(url)
    if not check_url_format(url):
        return {"error": "Invalid URL"}

    ext    = tldextract.extract(url)
    domain = ext.domain + "." + ext.suffix
    short        = check_shortener(domain)
    keyword_flag = check_keywords(url)

    try:
        stats = _vt_scan(url)
    except RuntimeError as e:
        return {"error": str(e)}

    status, score = compute_status(stats, short, keyword_flag)
    return {"url": url, "status": status, "score": score, "stats": stats}

@app.get("/check")
def check_url(
    url: str,
    x_api_key: str = Header(None)
):
    verify_api_key(x_api_key)

    url = normalize_url(url)
    if not check_url_format(url):
        return {"error": "Invalid URL"}

    parsed       = urlparse(url)
    ext          = tldextract.extract(url)
    domain       = ext.domain + "." + ext.suffix
    short        = check_shortener(domain)
    keyword_flag = check_keywords(url)
    ip           = get_ip(domain)

    try:
        stats = _vt_scan(url)
    except RuntimeError as e:
        return {"error": str(e)}

    status, score = compute_status(stats, short, keyword_flag)

    logs_collection.insert_one({
        "key":    x_api_key,
        "url":    url,
        "status": status,
        "time":   datetime.now()
    })

    return {
        "url":          url,
        "domain":       domain,
        "ip":           ip,
        "shortener":    short,
        "keyword_flag": keyword_flag,
        "status":       status,
        "score":        score,
        "stats":        stats
    }
