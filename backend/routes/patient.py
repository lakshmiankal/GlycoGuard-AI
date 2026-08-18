from flask import Blueprint, request, jsonify
from services.patient_service import PatientService
from middleware.auth_middleware import token_required

patients_bp = Blueprint("patients", __name__)
patient_bp = patients_bp  # Alias for backward compatibility


@patients_bp.route("/patients", methods=["POST"])
@token_required
def add_patient():
    try:
        data = request.get_json() or {}
        result = PatientService.add_patient(data)
        return jsonify(result), 201

    except Exception as e:
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@patients_bp.route("/patients", methods=["GET"])
@token_required
def get_patients():
    try:
        result = PatientService.get_all_patients()
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@patients_bp.route("/patients/<int:id>", methods=["GET"])
@token_required
def get_patient(id):
    try:
        result = PatientService.get_patient(id)

        if result["status"]:
            return jsonify(result), 200

        return jsonify(result), 404

    except Exception as e:
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@patients_bp.route("/patients/<int:id>", methods=["PUT"])
@token_required
def update_patient(id):
    try:
        data = request.get_json() or {}

        result = PatientService.update_patient(id, data)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


@patients_bp.route("/patients/<int:id>", methods=["DELETE"])
@token_required
def delete_patient(id):
    try:
        result = PatientService.delete_patient(id)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500