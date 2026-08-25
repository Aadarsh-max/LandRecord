from ocr.preprocessing import preprocess_document
from ocr.printed_text_ocr import extract_printed_text
from ocr.handwriting_ocr import extract_handwritten_text
from llm_correction.correction_engine import correct_ocr_text
from nlp.ner_extraction import extract_entities
from nlp.field_classifier import classify_fields


def process_document(image_bytes, mode="auto"):
    processed = preprocess_document(image_bytes)
    original_image = processed["original"]
    grayscale_image = processed["grayscale"]

    printed_result = extract_printed_text(original_image)

    raw_text = printed_result["full_text"]
    ocr_confidence = printed_result["avg_confidence"]

    should_try_handwriting = mode == "handwritten" or (
        mode == "auto" and ocr_confidence < 0.55
    )

    handwriting_result = None
    if should_try_handwriting:
        handwriting_result = extract_handwritten_text(grayscale_image)
        if handwriting_result["confidence"] > ocr_confidence:
            raw_text = handwriting_result["full_text"]
            ocr_confidence = handwriting_result["confidence"]

    correction = correct_ocr_text(raw_text)
    final_text = correction["corrected_text"]

    entities = extract_entities(final_text)
    structured_fields = classify_fields(final_text, entities)

    return {
        "language_detected": "en",
        "printed_ocr": printed_result,
        "handwriting_ocr": handwriting_result,
        "raw_text": raw_text,
        "ocr_confidence": ocr_confidence,
        "correction": correction,
        "entities": entities,
        "structured_fields": structured_fields,
        "final_text": final_text
    }