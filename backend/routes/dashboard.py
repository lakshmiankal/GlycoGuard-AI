from flask import Blueprint, jsonify
from services.dashboard_service import DashboardService
from middleware.auth_middleware import token_required

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard/stats", methods=["GET"])
@token_required
def get_stats():
    try:
        result = DashboardService.get_stats()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500
