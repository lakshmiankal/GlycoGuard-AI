from flask import Blueprint, request, jsonify
from services.planner_service import PlannerService
from middleware.auth_middleware import token_required

planner_bp = Blueprint("planner", __name__)

@planner_bp.route("/planner", methods=["POST"])
@token_required
def generate_plan():
    try:
        data = request.get_json() or {}
        result = PlannerService.generate_plan(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500

@planner_bp.route("/planner/<int:patient_id>", methods=["GET"])
@token_required
def get_plan(patient_id):
    try:
        result = PlannerService.get_plan(patient_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500
