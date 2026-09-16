import re

CLASSIFICATION_AREA_RANGES = {
    "agricultural": (0.05, 500.0),
    "residential": (0.01, 5.0),
    "commercial": (0.01, 20.0),
    "cultivation": (0.05, 500.0),
    "agriculture": (0.05, 500.0),
}

DEFAULT_RANGE = (0.01, 1000.0)


def extract_numeric_area(area_value):
    if not area_value:
        return None
    match = re.search(r"\d+\.?\d*", str(area_value))
    if not match:
        return None
    return float(match.group(0))


def check_area_plausibility(plot_area_value, land_classification_value):
    numeric_area = extract_numeric_area(plot_area_value)

    if numeric_area is None:
        return {"checked": False, "reason": "no_numeric_area_found"}

    classification_key = (land_classification_value or "").strip().lower()
    min_area, max_area = CLASSIFICATION_AREA_RANGES.get(classification_key, DEFAULT_RANGE)

    is_plausible = min_area <= numeric_area <= max_area

    return {
        "checked": True,
        "numeric_area": numeric_area,
        "expected_range": {"min": min_area, "max": max_area},
        "plausible": is_plausible,
        "note": (
            f"Area appears within typical range for {classification_key or 'this land type'}."
            if is_plausible
            else f"Area ({numeric_area}) is outside the typical range ({min_area}-{max_area}) for {classification_key or 'this land type'} — worth manual verification."
        )
    }