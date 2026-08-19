"""
GlycoGuard AI - Single Source of Truth Asset Bundler & Android Native Synchronizer
Bundles root index.html, css/app.css, js/app.js, js/config.js into www/
and synchronizes directly into android/app/src/main/assets/public/
"""

import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()
WWW_DIR = BASE_DIR / "www"
ANDROID_PUBLIC_DIR = BASE_DIR / "android" / "app" / "src" / "main" / "assets" / "public"

print("--- BUNDLING GLYCOGUARD AI SHARED FRONTEND (SINGLE SOURCE OF TRUTH) ---")

# 1. Clean and initialize www/ directory
if WWW_DIR.exists():
    shutil.rmtree(WWW_DIR)
WWW_DIR.mkdir(parents=True, exist_ok=True)

# 2. Copy Root Single Source of Truth Entrypoint
if (BASE_DIR / "index.html").exists():
    shutil.copy2(BASE_DIR / "index.html", WWW_DIR / "index.html")
    print("[SUCCESS] Bundled root index.html -> www/index.html")

# 3. Copy css/ and js/ directories
if (BASE_DIR / "css").exists():
    shutil.copytree(BASE_DIR / "css", WWW_DIR / "css", dirs_exist_ok=True)
    print("[SUCCESS] Bundled css/ -> www/css/")

if (BASE_DIR / "js").exists():
    shutil.copytree(BASE_DIR / "js", WWW_DIR / "js", dirs_exist_ok=True)
    print("[SUCCESS] Bundled js/ -> www/js/")

# 4. Copy background and static assets
if (BASE_DIR / "bg.jpg").exists():
    shutil.copy2(BASE_DIR / "bg.jpg", WWW_DIR / "bg.jpg")

# 5. Maintain Backward-Compatible Aliases to avoid dead links in existing bookmarks
# Duplicate unified app into auth.html and mobile/
shutil.copy2(BASE_DIR / "index.html", WWW_DIR / "auth.html")

mobile_www = WWW_DIR / "mobile"
mobile_www.mkdir(parents=True, exist_ok=True)
shutil.copy2(BASE_DIR / "index.html", mobile_www / "index.html")
shutil.copy2(BASE_DIR / "css" / "app.css", mobile_www / "mobile.css")
shutil.copy2(BASE_DIR / "js" / "app.js", mobile_www / "mobile.js")

# Also update local mobile/ and auth.html in workspace to stay 100% in sync
if (BASE_DIR / "mobile").exists():
    shutil.copy2(BASE_DIR / "index.html", BASE_DIR / "mobile" / "index.html")
    shutil.copy2(BASE_DIR / "css" / "app.css", BASE_DIR / "mobile" / "mobile.css")
    shutil.copy2(BASE_DIR / "js" / "app.js", BASE_DIR / "mobile" / "mobile.js")
    print("[SUCCESS] Synchronized local mobile/ workspace folder.")

if (BASE_DIR / "auth.html").exists():
    shutil.copy2(BASE_DIR / "index.html", BASE_DIR / "auth.html")

# 6. Direct Synchronize to Android Native Assets
if ANDROID_PUBLIC_DIR.exists():
    print(f"--- Synchronizing assets to Android native: {ANDROID_PUBLIC_DIR} ---")
    shutil.copytree(WWW_DIR, ANDROID_PUBLIC_DIR, dirs_exist_ok=True)
    print("[SUCCESS] Android public assets synchronized directly.")

print("--- GLYCOGUARD AI BUNDLE & SYNC COMPLETE ---")
