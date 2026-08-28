import re

NUMERIC_PATTERN = re.compile(r"^\d+[\d/\-]*$")
REGISTRATION_PATTERN = re.compile(r"^[A-Z]{2,4}-[A-Z0-9]{2,6}-\d{4}-\d{3,8}$", re.IGNORECASE)
AREA_PATTERN = re.compile(r"\d+\.?\d*\s*(hectare|acre|sq\.?\s*ft|sq\.?\s*m)", re.IGNORECASE)
HAS_NON_LATIN = re.compile(r"[^\x00-\x7F]")

NUMERIC_FIELDS = {"survey_number", "khasra_number", "khata_number"}
TEXT_FIELDS = {"landowner_name", "village", "tehsil", "district", "land_classification", "ownership_type", "mutation_status"}


def compute_field_confidence(field_name, value):
    if value is None:
        return 0.0

    value = str(value).strip()
    if not value:
        return 0.0

    score = 0.5

    if HAS_NON_LATIN.search(value):
        score -= 0.25

    if field_name in NUMERIC_FIELDS:
        if NUMERIC_PATTERN.match(value):
            score += 0.35
        else:
            score -= 0.15

    elif field_name == "plot_area":
        if AREA_PATTERN.search(value):
            score += 0.35
        elif re.search(r"\d", value):
            score += 0.15
        else:
            score -= 0.2

    elif field_name == "registration_number":
        if REGISTRATION_PATTERN.match(value):
            score += 0.4
        elif re.search(r"\d", value) and re.search(r"[A-Za-z]", value):
            score += 0.15
        else:
            score -= 0.15

    elif field_name in TEXT_FIELDS:
        word_count = len(value.split())
        if len(value) < 2:
            score -= 0.3
        elif word_count >= 1 and value.replace(" ", "").isalpha():
            score += 0.3
        else:
            score += 0.1

        if len(value) > 60:
            score -= 0.15

    score = max(0.05, min(0.97, score))
    return round(score, 2)