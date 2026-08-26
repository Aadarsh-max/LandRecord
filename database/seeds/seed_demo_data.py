import psycopg2
import os
import uuid
from datetime import datetime, timedelta
import random

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://landrecord:landrecord@localhost:5433/landrecord_db")

VILLAGES = [
    ("Shirdi", "Rahata", "Ahmednagar"),
    ("Kopargaon", "Kopargaon", "Nashik"),
    ("Sinnar", "Sinnar", "Nashik"),
    ("Rahuri", "Rahuri", "Ahmednagar"),
    ("Igatpuri", "Igatpuri", "Nashik")
]

NAMES = [
    "Rajesh Kumar Sharma", "Sunita Devi Patil", "Vikram Singh Rathod",
    "Meera Bai Deshmukh", "Anil Kumar Jadhav", "Priya Suresh Kulkarni",
    "Ramesh Chandra Pawar", "Kavita Ashok More"
]

CLASSIFICATIONS = ["Agricultural", "Residential", "Commercial"]
OWNERSHIP_TYPES = ["Individual", "Joint", "Trust"]
MUTATION_STATUSES = ["Approved", "Pending", "Rejected"]


def generate_records(count=25):
    records = []
    for i in range(count):
        village, tehsil, district = random.choice(VILLAGES)
        records.append({
            "id": str(uuid.uuid4()),
            "document_id": str(uuid.uuid4()),
            "landowner_name": random.choice(NAMES),
            "survey_number": f"{random.randint(1, 300)}/{random.randint(1, 5)}",
            "khasra_number": str(random.randint(1, 200)),
            "khata_number": str(random.randint(1, 100)),
            "plot_area": round(random.uniform(0.5, 8.0), 2),
            "village": village,
            "tehsil": tehsil,
            "district": district,
            "land_classification": random.choice(CLASSIFICATIONS),
            "ownership_type": random.choice(OWNERSHIP_TYPES),
            "mutation_status": random.choice(MUTATION_STATUSES),
            "registration_number": f"MH-{random.randint(2020,2026)}-{random.randint(10000,99999)}",
            "created_at": datetime.now() - timedelta(days=random.randint(0, 90))
        })
    return records


def seed():
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    admin_id = str(uuid.uuid4())
    cursor.execute(
        """INSERT INTO users (id, name, email, password_hash, role, department)
           VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (email) DO NOTHING""",
        (admin_id, "Demo Admin", "demo@dolr.gov.in", "$2a$10$fakeHashForDemoOnlyNotReal", "admin", "Dept of Land Resources")
    )

    records = generate_records(25)

    for record in records:
        cursor.execute(
            """INSERT INTO documents (id, filename, storage_path, uploaded_by, status, uploaded_at)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (record["document_id"], f"scan_{record['survey_number'].replace('/', '_')}.jpg",
             "seed-data/mock.jpg", admin_id, "verified", record["created_at"])
        )

        cursor.execute(
            """INSERT INTO land_records (
                id, document_id, landowner_name, survey_number, khasra_number, khata_number,
                plot_area, village, tehsil, district, land_classification,
                ownership_type, mutation_status, registration_number, created_at
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (record["id"], record["document_id"], record["landowner_name"], record["survey_number"],
             record["khasra_number"], record["khata_number"], record["plot_area"], record["village"],
             record["tehsil"], record["district"], record["land_classification"],
             record["ownership_type"], record["mutation_status"], record["registration_number"],
             record["created_at"])
        )

        for field_name in ["landowner_name", "survey_number", "khasra_number", "village", "district"]:
            cursor.execute(
                """INSERT INTO field_confidence (land_record_id, field_name, confidence_score, is_verified)
                   VALUES (%s, %s, %s, %s)""",
                (record["id"], field_name, round(random.uniform(0.65, 0.98), 2), random.choice([True, False]))
            )

    conn.commit()
    cursor.close()
    conn.close()
    print(f"Seeded {len(records)} demo land records.")


if __name__ == "__main__":
    seed()