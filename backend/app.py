import os
from flask import Flask
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from routes.patient import patients_bp
from routes.prediction import prediction_bp
from routes.planner import planner_bp
from routes.tracking import tracking_bp
from routes.reports import reports_bp
from routes.dashboard import dashboard_bp


def init_database_tables():
    """Auto-initialize database tables and schema migrations if they do not exist."""
    try:
        from db import execute
        # Execute table creation logic safely
        execute("""
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name VARCHAR(150),
            email VARCHAR(150),
            phone VARCHAR(20),
            role VARCHAR(30) DEFAULT 'Patient',
            google_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS otps(
            id SERIAL PRIMARY KEY,
            email VARCHAR(150) NOT NULL,
            otp_code VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            attempts INTEGER DEFAULT 0,
            is_used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS patients(
            patient_id SERIAL PRIMARY KEY,
            full_name VARCHAR(150),
            gender VARCHAR(20),
            age INTEGER,
            phone VARCHAR(20),
            email VARCHAR(150),
            address TEXT,
            height REAL,
            weight REAL,
            bmi REAL,
            family_history VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS predictions(
            prediction_id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patients(patient_id),
            pregnancies INTEGER,
            glucose REAL,
            blood_pressure REAL,
            skin_thickness REAL,
            insulin REAL,
            bmi REAL,
            diabetes_pedigree REAL,
            age INTEGER,
            exercise REAL,
            sleep REAL,
            stress REAL,
            risk_level VARCHAR(30),
            probability REAL,
            recommendation TEXT,
            prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS health_plans(
            plan_id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patients(patient_id),
            breakfast TEXT,
            lunch TEXT,
            snacks TEXT,
            dinner TEXT,
            exercise TEXT,
            water_goal TEXT,
            sleep_goal TEXT,
            stress_management TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS daily_tracking(
            tracking_id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patients(patient_id),
            water REAL,
            sleep REAL,
            exercise REAL,
            stress INTEGER,
            blood_sugar REAL,
            weight REAL,
            tracking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS reports(
            report_id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patients(patient_id),
            report_name VARCHAR(150),
            generated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        print("[DATABASE] Cloud database tables initialized successfully.")
    except Exception as e:
        print("[DATABASE NOTICE] Table initialization notice:", e)


def create_app():
    app = Flask(__name__)

    # Enable CORS for all routes and allow all origins & Authorization headers
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.config["JSON_SORT_KEYS"] = False
    app.config["SECRET_KEY"] = Config.SECRET_KEY

    # Auto-initialize database tables
    init_database_tables()

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(planner_bp)
    app.register_blueprint(tracking_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(dashboard_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=False
    )

