from db import execute

print("Creating GlycoGuard AI Database...")

# ===========================
# USERS
# ===========================

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

)

""")

try:
    execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);")
except Exception:
    pass

# ===========================
# OTPS FOR PASSWORD RESET
# ===========================

execute("""

CREATE TABLE IF NOT EXISTS otps(

    id SERIAL PRIMARY KEY,

    email VARCHAR(150) NOT NULL,

    otp_code VARCHAR(6) NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    attempts INTEGER DEFAULT 0,

    is_used BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

)

""")


# ===========================
# PATIENTS
# ===========================

execute("""

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

)

""")

# ===========================
# PREDICTIONS
# ===========================

execute("""

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

)

""")

# ===========================
# HEALTH PLANS
# ===========================

execute("""

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

)

""")

# ===========================
# DAILY TRACKING
# ===========================

execute("""

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

)

""")

# ===========================
# REPORTS
# ===========================

execute("""

CREATE TABLE IF NOT EXISTS reports(

    report_id SERIAL PRIMARY KEY,

    patient_id INTEGER REFERENCES patients(patient_id),

    report_name VARCHAR(150),

    generated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP

)

""")

# Migration column safety for existing database tables
migrations = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'Patient';",
    "ALTER TABLE patients ADD COLUMN IF NOT EXISTS name VARCHAR(150);",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS patient_id INTEGER;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS pregnancies INTEGER;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS glucose REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS blood_pressure REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS skin_thickness REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS insulin REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS bmi REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS diabetes_pedigree REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS age INTEGER;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS exercise REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS sleep REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS stress REAL;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS recommendation TEXT;",
    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
    "ALTER TABLE health_plans ADD COLUMN IF NOT EXISTS stress_management TEXT;",
    "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_name VARCHAR(150);",
    "ALTER TABLE reports ADD COLUMN IF NOT EXISTS generated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"
]

for stmt in migrations:
    try:
        execute(stmt)
    except Exception as e:
        pass

print("===================================")
print(" GlycoGuard AI Database Ready ")
print("===================================")