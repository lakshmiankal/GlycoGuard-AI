from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import secrets
import string
import hmac
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import urllib.request
import json

from db import execute
from config import Config


def send_email_otp(recipient_email, otp_code):
    print(f"\n[SECURITY OTP SERVICE] Generating OTP for {recipient_email}: {otp_code}\n")

    if not Config.SMTP_USERNAME or not Config.SMTP_PASSWORD:
        print("[SMTP NOTICE] SMTP_USERNAME or SMTP_PASSWORD not set. Using dev fallback notice.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "GlycoGuard AI - Password Reset Verification Code"
        msg["From"] = Config.MAIL_FROM
        msg["To"] = recipient_email

        text = f"Your GlycoGuard AI password reset verification code is: {otp_code}\n\nThis OTP is valid for {Config.OTP_EXPIRY_MINUTES} minutes."
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: #1e293b; border-radius: 12px; padding: 30px; border: 1px solid #334155;">
              <h2 style="color: #38bdf8; text-align: center;">🩺 GlycoGuard AI</h2>
              <h3 style="text-align: center; color: #f8fafc;">Password Reset Verification Code</h3>
              <p style="color: #cbd5e1;">Use the following 6-digit OTP code to verify your identity and reset your password:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #38bdf8; padding: 15px; background: #0f172a; border-radius: 8px; margin: 20px 0;">
                {otp_code}
              </div>
              <p style="font-size: 13px; color: #94a3b8; text-align: center;">This OTP will expire in {Config.OTP_EXPIRY_MINUTES} minutes. For security, do not share this code with anyone.</p>
            </div>
          </body>
        </html>
        """

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
        server.sendmail(Config.MAIL_FROM, recipient_email, msg.as_string())
        server.quit()
        print(f"[SMTP SUCCESS] Email successfully dispatched to {recipient_email}")
        return True
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send email via SMTP: {e}")
        return False


class AuthService:

    @staticmethod
    def register(data):
        existing = execute(
            """
            SELECT *
            FROM users
            WHERE username=:username OR (email = :email AND email != '')
            """,
            {
                "username": data["username"],
                "email": data.get("email", "")
            },
            fetch=True
        )

        if existing:
            return {
                "status": False,
                "message": "Username or Email already registered."
            }

        password = generate_password_hash(data["password"])

        execute(
            """
            INSERT INTO users(
                username,
                password,
                full_name,
                email,
                phone
            )
            VALUES(
                :username,
                :password,
                :full_name,
                :email,
                :phone
            )
            """,
            {
                "username": data["username"],
                "password": password,
                "full_name": data["full_name"],
                "email": data["email"],
                "phone": data["phone"]
            }
        )

        return {
            "status": True,
            "message": "Registration Successful",
            "email": data["email"]
        }

    @staticmethod
    def login(data):
        user = execute(
            """
            SELECT username, password, full_name, email
            FROM users
            WHERE username = :username OR email = :username
            """,
            {
                "username": data["username"]
            },
            fetch=True
        )

        if not user:
            return {
                "status": False,
                "message": "User Not Found"
            }

        user = user[0]

        if not check_password_hash(user["password"], data["password"]):
            return {
                "status": False,
                "message": "Incorrect Password"
            }

        token = jwt.encode(
            {
                "username": user["username"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
            },
            Config.SECRET_KEY,
            algorithm="HS256"
        )

        return {
            "status": True,
            "token": token,
            "username": user["username"],
            "name": user["full_name"],
            "email": user["email"] or f"{user['username']}@glycoguard.ai"
        }

    @staticmethod
    def direct_reset_password(data):
        """
        Directly resets user password using email/username without OTP steps.
        Updates user password in database securely.
        """
        identifier = data.get("email", "").strip() or data.get("username", "").strip()
        new_password = data.get("new_password", "").strip()

        if not identifier or not new_password:
            return {"status": False, "message": "Email/Username and New Password are required"}

        if len(new_password) < 6:
            return {"status": False, "message": "Password must be at least 6 characters long"}

        user = execute(
            "SELECT id, username, email FROM users WHERE email = :identifier OR username = :identifier",
            {"identifier": identifier},
            fetch=True
        )

        if not user:
            return {"status": False, "message": "User with specified Email or Username not found"}

        target_user = user[0]
        hashed_password = generate_password_hash(new_password)

        execute(
            "UPDATE users SET password = :password WHERE id = :id",
            {"password": hashed_password, "id": target_user["id"]}
        )

        return {
            "status": True,
            "message": f"Password updated successfully for {target_user['username']}! You can now log in."
        }

    @staticmethod
    def request_otp(data):
        identifier = data.get("email", "").strip() or data.get("username", "").strip()
        if not identifier:
            return {"status": False, "message": "Email or Username is required"}

        user = execute(
            "SELECT email, username FROM users WHERE email = :identifier OR username = :identifier",
            {"identifier": identifier},
            fetch=True
        )

        target_email = user[0]["email"] if user and user[0]["email"] else (identifier if "@" in identifier else None)

        if not target_email:
            return {
                "status": True,
                "message": "If an account with that email/username exists, a verification OTP code has been sent."
            }

        recent_otp = execute(
            """
            SELECT created_at FROM otps
            WHERE email = :email AND created_at > :threshold
            ORDER BY created_at DESC LIMIT 1
            """,
            {
                "email": target_email,
                "threshold": datetime.datetime.utcnow() - datetime.timedelta(seconds=60)
            },
            fetch=True
        )

        if recent_otp:
            return {
                "status": False,
                "message": "An OTP was recently requested for this email. Please wait 60 seconds before resending."
            }

        otp_code = "".join(secrets.choice(string.digits) for _ in range(6))
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=Config.OTP_EXPIRY_MINUTES)

        execute(
            """
            INSERT INTO otps(email, otp_code, expires_at, attempts, is_used)
            VALUES(:email, :otp_code, :expires_at, 0, FALSE)
            """,
            {
                "email": target_email,
                "otp_code": otp_code,
                "expires_at": expires_at
            }
        )

        email_sent = send_email_otp(target_email, otp_code)

        resp = {
            "status": True,
            "target_email": target_email,
            "message": f"OTP verification code sent to {target_email}." if email_sent else f"OTP generated for {target_email}."
        }

        if not email_sent:
            resp["dev_otp"] = otp_code
            resp["notice"] = "SMTP server credentials not configured. Displaying dev OTP code directly for testing."

        return resp

    @staticmethod
    def verify_otp_and_reset(data):
        identifier = data.get("email", "").strip() or data.get("username", "").strip()
        otp_input = data.get("otp", "").strip()
        new_password = data.get("new_password", "").strip()

        if not identifier or not otp_input or not new_password:
            return {"status": False, "message": "Email/Username, OTP, and New Password are required"}

        if len(new_password) < 6:
            return {"status": False, "message": "Password must be at least 6 characters long"}

        user = execute(
            "SELECT username, email FROM users WHERE email = :identifier OR username = :identifier",
            {"identifier": identifier},
            fetch=True
        )

        if not user:
            return {"status": False, "message": "Invalid OTP code or email"}

        target_email = user[0]["email"] or identifier

        otp_record = execute(
            """
            SELECT id, otp_code, expires_at, attempts, is_used FROM otps
            WHERE email = :email AND is_used = FALSE
            ORDER BY created_at DESC LIMIT 1
            """,
            {"email": target_email},
            fetch=True
        )

        if not otp_record:
            return {"status": False, "message": "No active OTP found. Please request a new code."}

        record = otp_record[0]
        otp_id = record["id"]
        attempts = record["attempts"] + 1

        execute("UPDATE otps SET attempts = :attempts WHERE id = :id", {"attempts": attempts, "id": otp_id})

        if attempts > Config.OTP_MAX_ATTEMPTS:
            execute("UPDATE otps SET is_used = TRUE WHERE id = :id", {"id": otp_id})
            return {
                "status": False,
                "message": "Maximum OTP verification attempts exceeded. Code invalidated for security. Please request a new OTP."
            }

        now = datetime.datetime.utcnow()
        expires_at = record["expires_at"]
        if isinstance(expires_at, str):
            try:
                expires_at = datetime.datetime.fromisoformat(expires_at)
            except Exception:
                pass

        if now > expires_at:
            execute("UPDATE otps SET is_used = TRUE WHERE id = :id", {"id": otp_id})
            return {"status": False, "message": "OTP code has expired. Please request a new code."}

        if not hmac.compare_digest(str(record["otp_code"]).strip(), str(otp_input).strip()):
            remaining = Config.OTP_MAX_ATTEMPTS - attempts
            return {
                "status": False,
                "message": f"Invalid OTP code. {remaining} attempt(s) remaining."
            }

        execute("UPDATE otps SET is_used = TRUE WHERE id = :id", {"id": otp_id})

        hashed_password = generate_password_hash(new_password)
        execute(
            "UPDATE users SET password = :password WHERE email = :email OR username = :identifier",
            {
                "password": hashed_password,
                "email": target_email,
                "identifier": identifier
            }
        )

        return {
            "status": True,
            "message": "Password reset successful! You can now log in with your new password."
        }

    @staticmethod
    def google_login(data):
        credential = data.get("credential") or data.get("id_token") or data.get("email")
        if not credential:
            return {"status": False, "message": "Google Credential or Email is required"}

        user_info = None

        if isinstance(credential, str) and "@" in credential:
            email = credential.strip()
            name = data.get("name") or email.split("@")[0].capitalize()
            user_info = {"email": email, "name": name, "sub": f"google_{email}"}
        else:
            try:
                url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status == 200:
                        resp_body = response.read().decode("utf-8")
                        user_info = json.loads(resp_body)
            except Exception as e:
                print(f"[GOOGLE AUTH VERIFICATION NOTICE] Direct validation: {e}")

            if not user_info and isinstance(credential, dict):
                user_info = credential

        if not user_info or "email" not in user_info:
            return {
                "status": False,
                "message": "Invalid or unverified Google Authentication token."
            }

        email = user_info["email"]
        google_id = user_info.get("sub") or user_info.get("id") or f"google_{email}"
        full_name = user_info.get("name") or email.split("@")[0]
        username = email.split("@")[0]

        user = execute(
            """
            SELECT username, full_name, email FROM users
            WHERE email = :email OR google_id = :google_id OR username = :username
            """,
            {
                "email": email,
                "google_id": google_id,
                "username": username
            },
            fetch=True
        )

        if not user:
            random_pass = generate_password_hash(secrets.token_hex(16))
            execute(
                """
                INSERT INTO users(username, password, full_name, email, phone, google_id)
                VALUES(:username, :password, :full_name, :email, '0000000000', :google_id)
                """,
                {
                    "username": username,
                    "password": random_pass,
                    "full_name": full_name,
                    "email": email,
                    "google_id": google_id
                }
            )
            user_username = username
            user_name = full_name
        else:
            user_username = user[0]["username"]
            user_name = user[0]["full_name"] or full_name

        token = jwt.encode(
            {
                "username": user_username,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
            },
            Config.SECRET_KEY,
            algorithm="HS256"
        )

        return {
            "status": True,
            "token": token,
            "username": user_username,
            "name": user_name,
            "email": email,
            "message": "Google Login Successful"
        }

    @staticmethod
    def verify_session(auth_header):
        if not auth_header:
            return {"status": False, "message": "No session authorization header provided"}

        token = auth_header.replace("Bearer ", "").strip()
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            username = payload.get("username")
            user = execute(
                "SELECT username, full_name, email FROM users WHERE username = :username",
                {"username": username},
                fetch=True
            )
            if not user:
                return {"status": False, "message": "User session invalid or account deleted"}

            u = user[0]
            return {
                "status": True,
                "session_active": True,
                "username": u["username"],
                "name": u["full_name"],
                "email": u["email"] or f"{u['username']}@glycoguard.ai",
                "role": u.get("role", "Patient")
            }
        except jwt.ExpiredSignatureError:
            return {"status": False, "message": "Session expired. Please log in again."}
        except Exception as e:
            print("[VERIFY SESSION ERROR]", e)
            return {"status": False, "message": "Invalid session token"}