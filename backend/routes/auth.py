from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
import traceback

print("[INFO] auth.py loaded successfully")


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json() or {}

        required_fields = [
            "username",
            "password",
            "full_name",
            "email",
            "phone"
        ]

        for field in required_fields:
            if field not in data or str(data[field]).strip() == "":
                return jsonify({
                    "status": False,
                    "message": f"{field} is required"
                }), 400

        result = AuthService.register(data)

        if result["status"]:
            return jsonify(result), 201

        return jsonify(result), 400

    except Exception as e:
        print("========== SIGNUP ERROR ==========")
        traceback.print_exc()

        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}

        if "username" not in data or "password" not in data:
            return jsonify({
                "status": False,
                "message": "Username and Password required"
            }), 400

        result = AuthService.login(data)

        if result["status"]:
            return jsonify(result), 200

        return jsonify(result), 401

    except Exception as e:
        print("========== LOGIN ERROR ==========")
        traceback.print_exc()

        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@auth_bp.route("/forgot-password/direct-reset", methods=["POST"])
def direct_reset():
    try:
        data = request.get_json() or {}
        result = AuthService.direct_reset_password(data)
        status_code = 200 if result["status"] else 400
        return jsonify(result), status_code
    except Exception as e:
        print("========== DIRECT RESET ERROR ==========")
        traceback.print_exc()
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@auth_bp.route("/forgot-password/request-otp", methods=["POST"])
def request_otp():
    try:
        data = request.get_json() or {}
        result = AuthService.request_otp(data)
        status_code = 200 if result["status"] else 400
        return jsonify(result), status_code
    except Exception as e:
        print("========== REQUEST OTP ERROR ==========")
        traceback.print_exc()
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@auth_bp.route("/forgot-password/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json() or {}
        result = AuthService.verify_otp_and_reset(data)
        status_code = 200 if result["status"] else 400
        return jsonify(result), status_code
    except Exception as e:
        print("========== VERIFY OTP ERROR ==========")
        traceback.print_exc()
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@auth_bp.route("/google-login", methods=["POST"])
def google_login():
    try:
        data = request.get_json() or {}
        result = AuthService.google_login(data)
        status_code = 200 if result["status"] else 400
        return jsonify(result), status_code
    except Exception as e:
        print("========== GOOGLE LOGIN ERROR ==========")
        traceback.print_exc()
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@auth_bp.route("/verify-session", methods=["GET"])
def verify_session():
    try:
        auth_header = request.headers.get("Authorization")
        result = AuthService.verify_session(auth_header)
        status_code = 200 if result["status"] else 401
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500


@auth_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "project": "GlycoGuard AI",
        "version": "2.0"
    })