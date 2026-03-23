from datetime import datetime
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import validators
import tldextract
import socket
from urllib.parse import urlparse
from dotenv import load_dotenv
import os
from pymongo import MongoClient
import uuid

load_dotenv()
MONGO_URL = "mongodb://mongo:27017"

client = MongoClient(MONGO_URL)

db = client["api_service"]

api_keys_collection = db["keys"]
logs_collection = db["logs"]
VIRUS_API_KEY = os.getenv("VIRUS_API_KEY")

#MY_API_KEY = "expl_chk_069"

app = FastAPI()


#------------------- CORS ----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    if domain in shorteners:
        return True

    return False


def check_keywords(url):

    for word in suspicious_words:
        if word in url.lower():
            return True

    return False


def get_ip(domain):

    try:
        ip = socket.gethostbyname(domain)
        return ip
    except:
        return None

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

    ext = tldextract.extract(url)

    domain = ext.domain + "." + ext.suffix

    short = check_shortener(domain)

    keyword_flag = check_keywords(url)

    ip = get_ip(domain)

    try:

        response = requests.post(
            "https://www.virustotal.com/api/v3/urls",
            headers=headers,
            data={"url": url}
        )

        result = response.json()

    except Exception as e:

        return {"error": "VirusTotal failed"}

    if "data" not in result:
        return {"error": "VT error"}

    analysis_id = result["data"]["id"]

    time.sleep(5)

    result_response = requests.get(
        f"https://www.virustotal.com/api/v3/analyses/{analysis_id}",
        headers=headers
    )

    final = result_response.json()

    stats = final["data"]["attributes"]["stats"]

    malicious = stats.get("malicious", 0)
    suspicious = stats.get("suspicious", 0)
    harmless = stats.get("harmless", 0)
    undetected = stats.get("undetected", 0)

    score = 0

    if malicious > 0:
        score += 5

    if suspicious > 0:
        score += 3

    if short:
        score += 2

    if keyword_flag:
        score += 2

    if undetected > harmless:
        score += 1

    if score >= 5:
        status = "MALICIOUS"
    elif score >= 3:
        status = "SUSPICIOUS"
    elif score >= 1:
        status = "UNKNOWN"
    else:
        status = "SAFE"

    return {
        "url": url,
        "status": status,
        "score": score,
        "stats": stats
    }

@app.get("/check")
def check_url(
    url: str,
    x_api_key: str = Header(None)
):

    verify_api_key(x_api_key)

    url = normalize_url(url)

    #  FIX — auto add https if missing
    url = normalize_url(url)

    # ---------- URL VALIDATION ----------

    if not check_url_format(url):
        return {"error": "Invalid URL"}

    parsed = urlparse(url)

    ext = tldextract.extract(url)

    domain = ext.domain + "." + ext.suffix

    short = check_shortener(domain)

    keyword_flag = check_keywords(url)

    ip = get_ip(domain)

    # ---------- VIRUSTOTAL STEP 1 ----------

    try:

        response = requests.post(
            "https://www.virustotal.com/api/v3/urls",
            headers=headers,
            data={"url": url}
        )

        result = response.json()

    except Exception as e:

        return {
            "error": "VirusTotal request failed",
            "details": str(e)
        }

    if "data" not in result:

        return {
            "error": "VirusTotal error",
            "response": result
        }

    analysis_id = result["data"]["id"]

    # ---------- WAIT FOR SCAN ----------

    time.sleep(10)

    # ---------- VIRUSTOTAL STEP 2 ----------

    try:

        result_response = requests.get(
            f"https://www.virustotal.com/api/v3/analyses/{analysis_id}",
            headers=headers
        )

        final = result_response.json()

    except Exception as e:

        return {
            "error": "Analysis request failed",
            "details": str(e)
        }

    if "data" not in final:

        return {
            "error": "Analysis error",
            "response": final
        }

    stats = final["data"]["attributes"]["stats"]

    malicious = stats.get("malicious", 0)
    suspicious = stats.get("suspicious", 0)
    harmless = stats.get("harmless", 0)
    undetected = stats.get("undetected", 0)
    timeout = stats.get("timeout", 0)

    # ---------- SCORING ----------

    score = 0

    if malicious > 0:
        score += 5

    if suspicious > 0:
        score += 3

    if short:
        score += 2

    if keyword_flag:
        score += 2

    if undetected > harmless:
        score += 1

    # ---------- FINAL STATUS ----------

    if score >= 5:
        status = "MALICIOUS"

    elif score >= 3:
        status = "SUSPICIOUS"

    elif score >= 1:
        status = "UNKNOWN"

    else:
        status = "SAFE"

    # ---------- RESPONSE ----------
    logs_collection.insert_one({
        "key": x_api_key,
        "url": url,
        "status": status,
        "time": datetime.now()
    })
    return {
        "url": url,
        "domain": domain,
        "ip": ip,
        "shortener": short,
        "keyword_flag": keyword_flag,
        "status": status,
        "score": score,
        "stats": stats
    }