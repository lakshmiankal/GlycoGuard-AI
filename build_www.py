import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()
WWW_DIR = BASE_DIR / "www"
ANDROID_PUBLIC_DIR = BASE_DIR / "android" / "app" / "src" / "main" / "assets" / "public"

print("--- BUNDLING GLYCOGUARD AI MOBILE ASSETS ---")

if WWW_DIR.exists():
    shutil.rmtree(WWW_DIR)
WWW_DIR.mkdir(parents=True, exist_ok=True)

# 1. Copy mobile root index.html, mobile.css, mobile.js
shutil.copy2(BASE_DIR / "mobile" / "index.html", WWW_DIR / "index.html")
shutil.copy2(BASE_DIR / "mobile" / "mobile.css", WWW_DIR / "mobile.css")
shutil.copy2(BASE_DIR / "mobile" / "mobile.js", WWW_DIR / "mobile.js")

# 2. Copy mobile folder for relative asset paths
shutil.copytree(BASE_DIR / "mobile", WWW_DIR / "mobile", dirs_exist_ok=True)

# 3. Copy shared js, css, frontend directories
if (BASE_DIR / "js").exists():
    shutil.copytree(BASE_DIR / "js", WWW_DIR / "js", dirs_exist_ok=True)

if (BASE_DIR / "css").exists():
    shutil.copytree(BASE_DIR / "css", WWW_DIR / "css", dirs_exist_ok=True)

if (BASE_DIR / "frontend").exists():
    shutil.copytree(BASE_DIR / "frontend", WWW_DIR / "frontend", dirs_exist_ok=True)

if (BASE_DIR / "auth.html").exists():
    shutil.copy2(BASE_DIR / "auth.html", WWW_DIR / "auth.html")

if (BASE_DIR / "bg.jpg").exists():
    shutil.copy2(BASE_DIR / "bg.jpg", WWW_DIR / "bg.jpg")

print("[SUCCESS] Bundled into www/ successfully.")

# 4. Direct sync to Android Native Assets
if ANDROID_PUBLIC_DIR.exists():
    print(f"--- Synchronizing assets to Android native: {ANDROID_PUBLIC_DIR} ---")
    shutil.copytree(WWW_DIR, ANDROID_PUBLIC_DIR, dirs_exist_ok=True)
    print("[SUCCESS] Android public assets synchronized directly.")

print("--- BUNDLE BUILD COMPLETE ---")
