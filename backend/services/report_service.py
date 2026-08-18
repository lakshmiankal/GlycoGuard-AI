from db import execute

class ReportService:

    @staticmethod
    def generate_report(data):
        patient_id = data.get("patient_id")
        if patient_id:
            try:
                patient_id = int(patient_id)
                p_check = execute("SELECT patient_id FROM patients WHERE patient_id = :id", {"id": patient_id}, fetch=True)
                if not p_check:
                    patient_id = None
            except Exception:
                patient_id = None

        report_name = data.get("report_name", "Diabetes Risk Assessment Report")

        try:
            execute(
                """
                INSERT INTO reports (patient_id, report_name)
                VALUES (:patient_id, :report_name)
                """,
                {
                    "patient_id": patient_id,
                    "report_name": report_name
                }
            )
            print(f"[DB LOG] Saved report to database successfully (Report: {report_name}, Patient ID: {patient_id})")
        except Exception as e:
            print("Notice: Report database insert log:", e)


        # Retrieve patient info & latest prediction
        patient = None
        if patient_id:
            res = execute(
                "SELECT * FROM patients WHERE patient_id = :id",
                {"id": patient_id},
                fetch=True
            )
            if res:
                patient = res[0]

        predictions = []
        if patient_id:
            predictions = execute(
                "SELECT * FROM predictions WHERE patient_id = :id ORDER BY prediction_date DESC LIMIT 1",
                {"id": patient_id},
                fetch=True
            )

        return {
            "status": True,
            "message": "Report generated successfully",
            "report": {
                "report_name": report_name,
                "patient": patient,
                "latest_prediction": predictions[0] if predictions else None
            }
        }

    @staticmethod
    def get_reports(patient_id=None):
        if patient_id:
            reports = execute(
                "SELECT * FROM reports WHERE patient_id = :id ORDER BY generated_on DESC",
                {"id": patient_id},
                fetch=True
            )
        else:
            reports = execute(
                """
                SELECT r.*, COALESCE(p.name, 'Patient') as patient_name
                FROM reports r
                LEFT JOIN patients p ON r.patient_id = p.patient_id
                ORDER BY r.generated_on DESC
                LIMIT 50
                """,
                fetch=True
            )


        formatted = []
        for rep in (reports or []):
            item = dict(rep)
            if item.get("generated_on"):
                item["generated_on"] = str(item["generated_on"])[:19]
            formatted.append(item)

        return {
            "status": True,
            "reports": formatted
        }
