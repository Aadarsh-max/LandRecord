from ocr.preprocessing import preprocess_document
from ocr.printed_text_ocr import extract_printed_text
from ocr.handwriting_ocr import extract_handwritten_text
from ocr.language_detector import detect_language


def process_document(image_bytes, mode="auto"):
    processed = preprocess_document(image_bytes)
    processed_image = processed["processed"]
    grayscale_image = processed["grayscale"]

    printed_result = extract_printed_text(processed_image, lang="en")
    language = detect_language(printed_result["full_text"])

    if language != "en":
        printed_result = extract_printed_text(processed_image, lang=language)

    response = {
        "language_detected": language,
        "printed_ocr": printed_result,
        "handwriting_ocr": None,
        "final_text": printed_result["full_text"]
    }

    should_try_handwriting = mode == "handwritten" or (
        mode == "auto" and printed_result["avg_confidence"] < 0.55
    )

    if should_try_handwriting:
        handwriting_result = extract_handwritten_text(grayscale_image)
        response["handwriting_ocr"] = handwriting_result

        if handwriting_result["confidence"] > printed_result["avg_confidence"]:
            response["final_text"] = handwriting_result["full_text"]

    return response