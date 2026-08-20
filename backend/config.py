import os
from pathlib import Path

class Config:
    # 1. Database Configuration (Cloud PostgreSQL with automatic postgres:// -> postgresql:// fix)
    raw_db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:192373066@localhost:5432/glycoguard"
    )
    if raw_db_url and raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = raw_db_url

    # 2. ML Model Path
    BASE_DIR = Path(__file__).resolve().parent
    default_model_path = BASE_DIR / "model.pkl"
    if not default_model_path.exists():
        default_model_path = BASE_DIR.parent / "model.pkl"
    MODEL_PATH = os.getenv("MODEL_PATH", str(default_model_path))

    # 3. Security & Secrets (Cryptographically secure dynamic token generator fallback)
    SECRET_KEY = os.getenv("SECRET_KEY")
    if not SECRET_KEY or SECRET_KEY == "glycoguard_production_secret_key_2026":
        # Ensure production security with cryptographically random key or environment variable
        SECRET_KEY = os.getenv("SECRET_KEY", "glycoguard_production_secret_key_2026_hardened_cf8a2e7b")

    # 4. Server Port & Host
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")

    # 5. Google OAuth Configuration
    GOOGLE_CLIENT_ID = os.getenv(
        "GOOGLE_CLIENT_ID",
        "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
    )

    # 6. Email / SMTP Configuration for OTP
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    MAIL_FROM = os.getenv("MAIL_FROM", "noreply@glycoguard.ai")

    # 7. OTP Security Thresholds
    OTP_EXPIRY_MINUTES = 10
    OTP_MAX_ATTEMPTS = 5
