import jwt
from functools import wraps
from flask import request, jsonify

from config import Config


def token_required(f):
    """
    Protect API endpoints using JWT authentication.
    """

    @wraps(f)
    def decorated(*args, **kwargs):

        token = None

        # Read JWT from Authorization header
        auth_header = request.headers.get("Authorization")

        if auth_header:

            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    "status": False,
                    "message": "Invalid Authorization Header"
                }), 401

        if not token:

            return jsonify({
                "status": False,
                "message": "Token is missing"
            }), 401

        try:

            payload = jwt.decode(
                token,
                Config.SECRET_KEY,
                algorithms=["HS256"]
            )

            # Store logged-in username for later use
            request.current_user = payload["username"]

        except jwt.ExpiredSignatureError:

            return jsonify({
                "status": False,
                "message": "Token has expired"
            }), 401

        except jwt.InvalidTokenError:

            return jsonify({
                "status": False,
                "message": "Invalid Token"
            }), 401

        return f(*args, **kwargs)

    return decorated