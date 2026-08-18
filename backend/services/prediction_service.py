import os
import pickle
import numpy as np
import pandas as pd
from config import Config
from db import execute

class PredictionService:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            model_path = Config.MODEL_PATH
            if not os.path.isabs(model_path):
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                model_path = os.path.join(base_dir, Config.MODEL_PATH)
                if not os.path.exists(model_path):
                    model_path = os.path.join(os.path.dirname(base_dir), Config.MODEL_PATH)

            if os.path.exists(model_path):
                with open(model_path, "rb") as f:
                    cls._model = pickle.load(f)
            else:
                raise FileNotFoundError(f"Model file not found at {model_path}")
        return cls._model

    @classmethod
    def predict(cls, data):
        pregnancies = float(data.get("pregnancies") or data.get("Pregnancies", 0))
        glucose = float(data.get("glucose") or data.get("Glucose", 120))
        blood_pressure = float(data.get("blood_pressure") or data.get("bloodPressure") or data.get("BloodPressure", 70))
        skin_thickness = float(data.get("skin_thickness") or data.get("skinThickness") or data.get("SkinThickness", 20))
        insulin = float(data.get("insulin") or data.get("Insulin", 80))
        
        bmi = data.get("bmi") or data.get("BMI")
        if not bmi or float(bmi) <= 0:
            height = float(data.get("height", 0))
            weight = float(data.get("weight", 0))
            if height > 0 and weight > 0:
                h_m = height / 100.0
                bmi = round(weight / (h_m * h_m), 1)
            else:
                bmi = 25.0
        else:
            bmi = float(bmi)

        dpf = float(data.get("diabetes_pedigree") or data.get("diabetesPedigree") or data.get("DiabetesPedigreeFunction") or data.get("DPF", 0.5))
        age = float(data.get("age") or data.get("Age", 30))
        exercise = float(data.get("exercise_minutes") or data.get("exerciseMinutes") or data.get("exercise", 30))
        sleep = float(data.get("sleep_hours") or data.get("sleepHours") or data.get("sleep", 7))
        stress = float(data.get("stress_level") or data.get("stressLevel") or data.get("stress", 4))

        features = pd.DataFrame([{
            "Pregnancies": pregnancies,
            "Glucose": glucose,
            "BloodPressure": blood_pressure,
            "SkinThickness": skin_thickness,
            "Insulin": insulin,
            "BMI": bmi,
            "DiabetesPedigreeFunction": dpf,
            "Age": age,
            "exercise_minutes": exercise,
            "sleep_hours": sleep,
            "stress_level": stress
        }])

        model = cls.get_model()
        probabilities = model.predict_proba(features)[0]
        prob_diabetes = float(probabilities[1]) if len(probabilities) > 1 else float(probabilities[0])

        if prob_diabetes >= 0.65:
            risk_level = "High"
            recommendation = "High risk detected! Schedule an HbA1c test with a doctor immediately, follow a low-glycemic diet, and exercise daily."
        elif prob_diabetes >= 0.35:
            risk_level = "Medium"
            recommendation = "Moderate risk detected. Monitor blood glucose weekly, increase physical activity to 45 mins/day, and reduce carbohydrate intake."
        else:
            risk_level = "Low"
            recommendation = "Low risk. Maintain a balanced diet, stay hydrated, keep sleep regular, and continue annual health checkups."

        patient_id = data.get("patient_id")
        if patient_id:
            try:
                patient_id = int(patient_id)
                # Verify patient exists in DB before using as foreign key
                p_check = execute("SELECT patient_id FROM patients WHERE patient_id = :id", {"id": patient_id}, fetch=True)
                if not p_check:
                    patient_id = None
            except Exception:
                patient_id = None

        try:
            execute(
                """
                INSERT INTO predictions (
                    patient_id, pregnancies, glucose, blood_pressure, skin_thickness,
                    insulin, bmi, diabetes_pedigree, age, exercise, sleep, stress,
                    risk_level, probability, recommendation
                )
                VALUES (
                    :patient_id, :pregnancies, :glucose, :blood_pressure, :skin_thickness,
                    :insulin, :bmi, :dpf, :age, :exercise, :sleep, :stress,
                    :risk_level, :probability, :recommendation
                )
                """,
                {
                    "patient_id": patient_id,
                    "pregnancies": pregnancies,
                    "glucose": glucose,
                    "blood_pressure": blood_pressure,
                    "skin_thickness": skin_thickness,
                    "insulin": insulin,
                    "bmi": bmi,
                    "dpf": dpf,
                    "age": age,
                    "exercise": exercise,
                    "sleep": sleep,
                    "stress": stress,
                    "risk_level": risk_level,
                    "probability": round(prob_diabetes * 100, 2),
                    "recommendation": recommendation
                }
            )
            print(f"[DB LOG] Saved prediction to database successfully (Risk: {risk_level}, Patient ID: {patient_id})")
        except Exception as e:
            print("Notice: Prediction database insert log:", e)


        return {
            "status": True,
            "risk_level": risk_level,
            "probability": round(prob_diabetes * 100, 2),
            "prob_decimal": round(prob_diabetes, 4),
            "recommendation": recommendation,
            "features_analyzed": {
                "pregnancies": pregnancies,
                "glucose": glucose,
                "blood_pressure": blood_pressure,
                "bmi": bmi,
                "age": age,
                "exercise": exercise,
                "sleep": sleep,
                "stress": stress
            }
        }
