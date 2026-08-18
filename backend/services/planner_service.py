from db import execute

class PlannerService:

    @staticmethod
    def generate_plan(data):
        patient_id = data.get("patient_id")
        risk_level = data.get("risk_level", "Medium")

        if risk_level == "High":
            breakfast = "Steel-cut oats with chia seeds, cinnamon, and 5 almonds + green tea (no sugar)"
            lunch = "Grilled chicken/tofu salad with spinach, cucumber, olive oil, and quinoa"
            snacks = "Handful of roasted chickpeas or walnuts + Greek yogurt"
            dinner = "Steamed salmon/dal with sautéed broccoli, cauliflower, and brown rice"
            exercise = "45 mins brisk walking or swimming daily"
            water_goal = "3.0 Liters daily"
            sleep_goal = "7.5 to 8 Hours nightly"
            stress_management = "15 mins morning mindfulness meditation & deep breathing"
        elif risk_level == "Medium":
            breakfast = "Vegetable omelet / Moong dal chilla + green tea"
            lunch = "Brown rice or 2 multigrain rotis with mixed veg curry and sprouts"
            snacks = "Apple slices with peanut butter or unsalted almonds"
            dinner = "Lentil soup with baked fish/paneer and garden green salad"
            exercise = "30-40 mins moderate cardio + light strength training"
            water_goal = "2.5 Liters daily"
            sleep_goal = "7 to 8 Hours"
            stress_management = "20 mins evening walk without phone & gentle yoga"
        else:
            breakfast = "Whole grain toast with avocado or boiled eggs + fresh berry smoothie"
            lunch = "Balanced thali: Roti, dal, sabzi, curd, and fresh salad"
            snacks = "Handful of mixed seeds (pumpkin/flax) or seasonal fruit"
            dinner = "Grilled lean protein / tofu with roasted vegetables"
            exercise = "30 mins daily active exercise (running, cycling, sports)"
            water_goal = "2.5 Liters daily"
            sleep_goal = "7 to 8 Hours"
            stress_management = "Regular hobbies & 10 mins daily relaxation"

        if patient_id:
            try:
                patient_id = int(patient_id)
                p_check = execute("SELECT patient_id FROM patients WHERE patient_id = :id", {"id": patient_id}, fetch=True)
                if not p_check:
                    patient_id = None
            except Exception:
                patient_id = None

        try:
            execute(
                """
                INSERT INTO health_plans (
                    patient_id, breakfast, lunch, snacks, dinner,
                    exercise, water_goal, sleep_goal, stress_management
                )
                VALUES (
                    :patient_id, :breakfast, :lunch, :snacks, :dinner,
                    :exercise, :water_goal, :sleep_goal, :stress_management
                )
                """,
                {
                    "patient_id": patient_id,
                    "breakfast": breakfast,
                    "lunch": lunch,
                    "snacks": snacks,
                    "dinner": dinner,
                    "exercise": exercise,
                    "water_goal": water_goal,
                    "sleep_goal": sleep_goal,
                    "stress_management": stress_management
                }
            )
            print(f"[DB LOG] Saved health plan to database successfully (Patient ID: {patient_id})")
        except Exception as e:
            print("Notice: Health plan DB insert log:", e)


        return {
            "status": True,
            "message": "AI Health Plan generated successfully",
            "plan": {
                "breakfast": breakfast,
                "lunch": lunch,
                "snacks": snacks,
                "dinner": dinner,
                "exercise": exercise,
                "water_goal": water_goal,
                "sleep_goal": sleep_goal,
                "stress_management": stress_management
            }
        }

    @staticmethod
    def get_plan(patient_id):
        plans = execute(
            """
            SELECT * FROM health_plans
            WHERE patient_id = :patient_id
            ORDER BY plan_id DESC
            LIMIT 1
            """,
            {"patient_id": patient_id},
            fetch=True
        )
        if not plans:
            return {
                "status": False,
                "message": "No health plan found for patient"
            }
        return {
            "status": True,
            "plan": plans[0]
        }
