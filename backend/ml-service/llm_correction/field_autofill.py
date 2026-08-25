import re

PATTERNS = {
    "survey_number": r"(survey\s*no\.?|s\.?\s*no\.?)\s*[:\-]?\s*(\d+[A-Za-z\/\-]*)",
    "khasra_number": r"(khasra\s*no\.?)\s*[:\-]?\s*(\d+[A-Za-z\/\-]*)",
    "khata_number": r"(khata\s*no\.?)\s*[:\-]?\s*(\d+[A-Za-z\/\-]*)",
    "plot_area": r"(area)\s*[:\-]?\s*([\d.]+)\s*(acre|hectare|sq\.?\s*ft|sq\.?\s*m)?"
}


def autofill_fields(corrected_text):
    text_lower = corrected_text.lower()
    extracted = {}

    for field, pattern in PATTERNS.items():
        match = re.search(pattern, text_lower, re.IGNORECASE)
        if match:
            extracted[field] = match.group(2).strip()
        else:
            extracted[field] = None

    return extracted