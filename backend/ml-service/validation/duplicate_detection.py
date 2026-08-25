from rapidfuzz import fuzz
from db import fetch_existing_records


def detect_duplicates(structured_fields, threshold=85):
    survey_number = structured_fields.get("survey_number", {}).get("value")
    village = structured_fields.get("village", {}).get("value")

    if not survey_number and not village:
        return []

    existing_records = fetch_existing_records()
    duplicates = []

    candidate_key = f"{survey_number or ''} {village or ''}".strip().lower()

    for record in existing_records:
        existing_key = f"{record.get('survey_number') or ''} {record.get('village') or ''}".strip().lower()
        if not existing_key:
            continue

        similarity = fuzz.ratio(candidate_key, existing_key)

        if similarity >= threshold:
            duplicates.append({
                "matched_record_id": str(record.get("id")),
                "matched_survey_number": record.get("survey_number"),
                "matched_village": record.get("village"),
                "similarity_score": round(similarity, 2)
            })

    return duplicates