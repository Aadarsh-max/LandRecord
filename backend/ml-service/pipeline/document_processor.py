import time
from ocr.preprocessing import preprocess_document
from ocr.printed_text_ocr import extract_best_language, extract_printed_text, SUPPORTED_LANGUAGES
from ocr.handwriting_ocr import extract_handwritten_text
from llm_correction.correction_engine import correct_ocr_text
from nlp.ner_extraction import extract_entities
from nlp.field_classifier import classify_fields
from validation.business_rules import validate_fields
from validation.duplicate_detection import detect_duplicates
from confidence.scoring import build_validation_summary


def process_document(image_bytes, mode="auto", language_hint=None):
    t0 = time.time()
    processed = preprocess_document(image_bytes)
    original_image = processed["original"]
    grayscale_image = processed["grayscale"]
    print(f"[timing] preprocessing: {time.time() - t0:.2f}s")

    t1 = time.time()
    if language_hint in SUPPORTED_LANGUAGES:
        printed_result = extract_printed_text(original_image, lang=language_hint)
        language = language_hint
    else:
        language, printed_result = extract_best_language(original_image, candidate_langs=("en", "devanagari"))
    print(f"[timing] OCR: {time.time() - t1:.2f}s, detected={language}, hint={language_hint}")

    raw_text = printed_result["full_text"]
    ocr_confidence = printed_result["avg_confidence"]

    should_try_handwriting = mode == "handwritten"

    handwriting_result = None
    if should_try_handwriting:
        handwriting_result = extract_handwritten_text(grayscale_image)
        if handwriting_result["confidence"] > ocr_confidence:
            raw_text = handwriting_result["full_text"]
            ocr_confidence = handwriting_result["confidence"]

    t2 = time.time()
    correction = correct_ocr_text(raw_text)
    print(f"[timing] Groq correction/translation: {time.time() - t2:.2f}s")
    final_text = correction["corrected_text"]

    t3 = time.time()
    entities = extract_entities(final_text)
    structured_fields = classify_fields(final_text, entities)
    print(f"[timing] NLP extraction: {time.time() - t3:.2f}s")

    violations = validate_fields(structured_fields)
    duplicates = detect_duplicates(structured_fields)
    validation_summary = build_validation_summary(structured_fields, violations, duplicates)

    print(f"[timing] TOTAL: {time.time() - t0:.2f}s")

    return {
        "language_detected": language,
        "printed_ocr": printed_result,
        "handwriting_ocr": handwriting_result,
        "raw_text": raw_text,
        "ocr_confidence": ocr_confidence,
        "correction": correction,
        "entities": entities,
        "structured_fields": structured_fields,
        "validation_summary": validation_summary,
        "final_text": final_text
    }