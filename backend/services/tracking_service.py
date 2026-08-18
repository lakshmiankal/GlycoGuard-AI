from db import execute

class TrackingService:

    @staticmethod
    def add_tracking(data):
        patient_id = data.get("patient_id")
        water = float(data.get("water", 0.0))
        sleep = float(data.get("sleep", 0.0))
        exercise = float(data.get("exercise", 0.0))
        stress = int(data.get("stress", 5))
        blood_sugar = float(data.get("blood_sugar", 0.0))
        weight = float(data.get("weight", 0.0))

        execute(
            """
            INSERT INTO daily_tracking (
                patient_id, water, sleep, exercise, stress, blood_sugar, weight
            )
            VALUES (
                :patient_id, :water, :sleep, :exercise, :stress, :blood_sugar, :weight
            )
            """,
            {
                "patient_id": patient_id,
                "water": water,
                "sleep": sleep,
                "exercise": exercise,
                "stress": stress,
                "blood_sugar": blood_sugar,
                "weight": weight
            }
        )

        return {
            "status": True,
            "message": "Daily health tracking logged successfully"
        }

    @staticmethod
    def get_tracking(patient_id=None):
        if patient_id:
            logs = execute(
                """
                SELECT * FROM daily_tracking
                WHERE patient_id = :patient_id
                ORDER BY tracking_date DESC
                LIMIT 30
                """,
                {"patient_id": patient_id},
                fetch=True
            )
        else:
            logs = execute(
                """
                SELECT t.*, COALESCE(p.name, 'Patient') as patient_name
                FROM daily_tracking t
                LEFT JOIN patients p ON t.patient_id = p.patient_id
                ORDER BY t.tracking_date DESC
                LIMIT 50
                """,
                fetch=True
            )

        formatted = []
        for log in (logs or []):
            item = dict(log)
            if item.get("tracking_date"):
                item["tracking_date"] = str(item["tracking_date"])[:19]
            formatted.append(item)

        return {
            "status": True,
            "logs": formatted
        }
