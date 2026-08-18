from flask import Blueprint, request, jsonify
from services.tracking_service import TrackingService
from middleware.auth_middleware import token_required

tracking_bp = Blueprint("tracking", __name__)

@tracking_bp.route("/tracking", methods=["POST"])
@token_required
def add_tracking():
    try:
        data = request.get_json() or {}
        result = TrackingService.add_tracking(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500

@tracking_bp.route("/tracking", methods=["GET"])
@token_required
def get_all_tracking():
    try:
        patient_id = request.args.get("patient_id")
        result = TrackingService.get_tracking(patient_id=patient_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500
