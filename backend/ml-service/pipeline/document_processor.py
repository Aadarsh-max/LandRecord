import time
from sarvam_extraction import extract_fields_with_sarvam, to_sarvam_language_code, translate_extracted_fields
from validation.business_rules import validate_fields
from validation.duplicate_detection import detect_duplicates
from confidence.scoring import build_validation_summary
from confidence.field_scoring import compute_field_confidence

TARGET_FIELDS = [
    "landowner_name", "survey_number", "khasra_number", "khata_number",
    "plot_area", "village", "tehsil", "district", "land_classification",
    "ownership_type", "mutation_status", "registration_number"
]


def build_structured_fields(raw_fields):
    structured = {}
    for field_name in TARGET_FIELDS:
        value = raw_fields.get(field_name)
        confidence = compute_field_confidence(field_name, value)
        if confidence == 0.0:
            structured[field_name] = {"value": None, "confidence": 0.0, "source": None}
        else:
            structured[field_name] = {"value": str(value).strip(), "confidence": confidence, "source": "sarvam"}
    return structured


def process_document(image_bytes, mode="auto", language_hint=None, filename="document.jpg"):
    t0 = time.time()

    print(f"[debug] language_hint received: {repr(language_hint)}")

    language_code = to_sarvam_language_code(language_hint or "en")
    print(f"[debug] resolved language_code: {language_code}")

    extraction_result = extract_fields_with_sarvam(image_bytes, filename, language_code=language_code)
    print(f"[timing] Sarvam extraction: {time.time() - t0:.2f}s")

    if not extraction_result["success"]:
        empty_fields = build_structured_fields({})
        return {
            "language_detected": language_hint or "en",
            "ocr_confidence": 0.0,
            "structured_fields": empty_fields,
            "validation_summary": build_validation_summary(
                empty_fields,
                [{"field": "document", "rule": "extraction_failed", "message": extraction_result["error"]}],
                []
            ),
            "final_text": "",
            "error": extraction_result["error"]
        }

    raw_fields = extraction_result["fields"]

    t1 = time.time()
    translated_fields = translate_extracted_fields(raw_fields) if language_code != "en-IN" else raw_fields
    print(f"[timing] Translation: {time.time() - t1:.2f}s")

    structured_fields = build_structured_fields(translated_fields)

    violations = validate_fields(structured_fields)
    duplicates = detect_duplicates(structured_fields)
    validation_summary = build_validation_summary(structured_fields, violations, duplicates)

    overall_confidence = round(
        sum(f["confidence"] for f in structured_fields.values()) / len(structured_fields), 2
    )

    print(f"[timing] TOTAL: {time.time() - t0:.2f}s")

    return {
        "language_detected": language_hint or "en",
        "ocr_confidence": overall_confidence,
        "structured_fields": structured_fields,
        "validation_summary": validation_summary,
        "final_text": str(translated_fields)
    }