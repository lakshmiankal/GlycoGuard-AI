from flask import Blueprint, request, jsonify
from services.report_service import ReportService
from middleware.auth_middleware import token_required

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/reports", methods=["POST"])
@token_required
def generate_report():
    try:
        data = request.get_json() or {}
        result = ReportService.generate_report(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500

@reports_bp.route("/reports", methods=["GET"])
@token_required
def get_reports():
    try:
        patient_id = request.args.get("patient_id")
        result = ReportService.get_reports(patient_id=patient_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500
