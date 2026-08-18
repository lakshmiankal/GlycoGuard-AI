import pandas as pd
import numpy as np
data = pd.read_csv("diabetes.csv")

print("Original Data:")
print(data.head())
data.fillna(data.mean(), inplace=True)
columns = ["Glucose", "BloodPressure", "BMI", "Insulin"]

for col in columns:
    data[col].replace(0, data[col].mean(), inplace=True)
data["exercise_minutes"] = np.random.randint(0, 60, len(data))
data["sleep_hours"] = np.random.uniform(4, 9, len(data))
data["stress_level"] = np.random.randint(1, 10, len(data))
data.to_csv("cleaned_diabetes.csv", index=False)

print(" Data cleaned successfully!")