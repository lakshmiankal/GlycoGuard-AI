from flask import Blueprint, request, jsonify
from services.prediction_service import PredictionService
from middleware.auth_middleware import token_required

prediction_bp = Blueprint("prediction", __name__)

@prediction_bp.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json() or {}
        result = PredictionService.predict(data)
        return jsonify(result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": False,
            "message": str(e)
        }), 500
