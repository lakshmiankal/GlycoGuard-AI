from db import execute


class PatientService:

    @staticmethod
    def add_patient(data):
        name = data.get("full_name") or data.get("name") or data.get("patient_name", "")
        age = data.get("age", 0)
        gender = data.get("gender", "Other")
        phone = data.get("phone", "")
        email = data.get("email", "")
        address = data.get("address", "")
        height = data.get("height", 0.0)
        weight = data.get("weight", 0.0)
        
        bmi = data.get("bmi")
        if (bmi is None or bmi == "") and height and float(height) > 0 and weight and float(weight) > 0:
            h_m = float(height) / 100.0
            bmi = round(float(weight) / (h_m * h_m), 2)
        elif bmi is None:
            bmi = 0.0

        family_history = data.get("family_history") or data.get("history", "")

        execute(
            """
            INSERT INTO patients
            (
                name,
                gender,
                age,
                phone,
                email,
                address,
                height,
                weight,
                bmi,
                family_history
            )
            VALUES
            (
                :name,
                :gender,
                :age,
                :phone,
                :email,
                :address,
                :height,
                :weight,
                :bmi,
                :family_history
            )
            """,
            {
                "name": name,
                "gender": gender,
                "age": age,
                "phone": phone,
                "email": email,
                "address": address,
                "height": height,
                "weight": weight,
                "bmi": bmi,
                "family_history": family_history
            }
        )

        return {
            "status": True,
            "message": "Patient added successfully"
        }

    @staticmethod
    def get_all_patients():
        patients_raw = execute(
            """
            SELECT patient_id as id, patient_id, name, name as full_name, gender, age, phone, email, address, height, weight, bmi, family_history, created_at
            FROM patients
            ORDER BY patient_id DESC
            """,
            fetch=True
        )

        formatted = []
        for p in (patients_raw or []):
            item = dict(p)
            if item.get("created_at"):
                item["created_at"] = str(item["created_at"])[:19]
            formatted.append(item)

        return {
            "status": True,
            "patients": formatted
        }

    @staticmethod
    def get_patient(patient_id):
        patient = execute(
            """
            SELECT patient_id as id, patient_id, name, name as full_name, gender, age, phone, email, address, height, weight, bmi, family_history, created_at
            FROM patients
            WHERE patient_id=:id
            """,
            {
                "id": patient_id
            },
            fetch=True
        )

        if not patient:
            return {
                "status": False,
                "message": "Patient not found"
            }

        item = dict(patient[0])
        if item.get("created_at"):
            item["created_at"] = str(item["created_at"])[:19]

        return {
            "status": True,
            "patient": item
        }


    @staticmethod
    def update_patient(patient_id, data):
        name = data.get("full_name") or data.get("name") or data.get("patient_name", "")
        age = data.get("age", 0)
        gender = data.get("gender", "Other")
        phone = data.get("phone", "")
        email = data.get("email", "")
        address = data.get("address", "")
        height = data.get("height", 0.0)
        weight = data.get("weight", 0.0)
        
        bmi = data.get("bmi")
        if (bmi is None or bmi == "") and height and float(height) > 0 and weight and float(weight) > 0:
            h_m = float(height) / 100.0
            bmi = round(float(weight) / (h_m * h_m), 2)
        elif bmi is None:
            bmi = 0.0

        family_history = data.get("family_history") or data.get("history", "")

        execute(
            """
            UPDATE patients
            SET
                name=:name,
                gender=:gender,
                age=:age,
                phone=:phone,
                email=:email,
                address=:address,
                height=:height,
                weight=:weight,
                bmi=:bmi,
                family_history=:family_history
            WHERE patient_id=:id
            """,
            {
                "id": patient_id,
                "name": name,
                "gender": gender,
                "age": age,
                "phone": phone,
                "email": email,
                "address": address,
                "height": height,
                "weight": weight,
                "bmi": bmi,
                "family_history": family_history
            }
        )

        return {
            "status": True,
            "message": "Patient updated successfully"
        }

    @staticmethod
    def delete_patient(patient_id):
        execute(
            """
            DELETE FROM patients
            WHERE patient_id=:id
            """,
            {
                "id": patient_id
            }
        )

        return {
            "status": True,
            "message": "Patient deleted successfully"
        }
