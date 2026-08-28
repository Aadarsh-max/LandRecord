import re

NUMBER_PATTERN = re.compile(r"\d+[\d/\-]*")

STOP_WORDS = r"(?=\s+(?:Total|Area|Land|Ownership|Mutation|Registration|Date|Remarks|Issued|Talathi|$))"

REGEX_FALLBACKS = {
    "survey_number": r"survey\s*no\.?\s*[:\-]?\s*(\d+[\/\-]?\w*)",
    "khasra_number": r"khasra\s*no\.?\s*[:\-]?\s*(\d+[\/\-]?\w*)",
    "khata_number": r"khata\s*no\.?\s*[:\-]?\s*(\d+[\/\-]?\w*)",
    "registration_number": r"registration\s*no\.?\s*[:\-]?\s*(\S+)",
    "mutation_status": r"mutation\s*(?:status)?\s*[:\-]?\s*(\w+)",
    "land_classification": r"land\s*classification\s*[:\-]?\s*(\w+)",
    "ownership_type": r"ownership\s*type\s*[:\-]?\s*(\w+)",
    "landowner_name": r"owner\s*(?:name)?\s*[:\-]?\s*([A-Za-z][A-Za-z\s.]{2,50}?)" + STOP_WORDS
}

ENTITY_TO_FIELD = {
    "SURVEY_NUMBER": "survey_number",
    "KHASRA_NUMBER": "khasra_number",
    "KHATA_NUMBER": "khata_number",
    "PLOT_AREA": "plot_area",
    "VILLAGE": "village",
    "TEHSIL": "tehsil",
    "DISTRICT": "district",
    "GPE": "location_hint"
}
TARGET_FIELDS = [
    "landowner_name", "survey_number", "khasra_number", "khata_number",
    "plot_area", "village", "tehsil", "district", "land_classification",
    "ownership_type", "mutation_status", "registration_number"
]

LABEL_STRIP_PATTERNS = {
    "village": r"^village\s*[:\-]?\s*",
    "tehsil": r"^(?:tehsil|taluka)\s*[:\-]?\s*",
    "district": r"^district\s*[:\-]?\s*"
}


def clean_number(raw_value):
    match = NUMBER_PATTERN.search(raw_value)
    return match.group(0) if match else raw_value


def strip_label(field_name, value):
    pattern = LABEL_STRIP_PATTERNS.get(field_name)
    if pattern:
        return re.sub(pattern, "", value, flags=re.IGNORECASE).strip()
    return value


def classify_fields(text, entities):
    fields = {field: {"value": None, "confidence": 0.0, "source": None} for field in TARGET_FIELDS}

    for entity in entities:
        field_name = ENTITY_TO_FIELD.get(entity["label"])
        if not field_name or field_name not in fields:
            continue
        if fields[field_name]["value"] is not None:
            continue

        value = entity["text"]
        if field_name in ("survey_number", "khasra_number", "khata_number"):
            value = clean_number(value)
        elif field_name in ("village", "tehsil", "district"):
            value = strip_label(field_name, value)

        fields[field_name] = {
            "value": value,
            "confidence": 0.75,
            "source": "ner"
        }

    for field_name, pattern in REGEX_FALLBACKS.items():
        if fields[field_name]["value"] is not None:
            continue
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            fields[field_name] = {
                "value": match.group(1).strip(),
                "confidence": 0.6,
                "source": "regex"
            }

    return fields