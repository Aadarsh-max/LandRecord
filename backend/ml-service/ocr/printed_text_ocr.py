from paddleocr import PaddleOCR

_engines = {}

MODEL_OVERRIDES = {
    "devanagari": {
        "text_recognition_model_name": "devanagari_PP-OCRv5_mobile_rec"
    },
    "tamil": {
        "text_recognition_model_name": "ta_PP-OCRv5_mobile_rec"
    },
    "telugu": {
        "text_recognition_model_name": "te_PP-OCRv5_mobile_rec"
    }
}


def get_engine(lang):
    if lang not in _engines:
        kwargs = {
            "lang": lang,
            "enable_mkldnn": False,
            "use_doc_orientation_classify": False,
            "use_doc_unwarping": False,
            "use_textline_orientation": False
        }
        override = MODEL_OVERRIDES.get(lang)
        if override:
            kwargs.pop("lang", None)
            kwargs.update(override)
        _engines[lang] = PaddleOCR(**kwargs)
    return _engines[lang]


def extract_printed_text(image, lang="en"):
    engine = get_engine(lang)
    result = engine.predict(image)

    lines = []
    if result:
        page = result[0]
        texts = page.get("rec_texts", [])
        scores = page.get("rec_scores", [])
        boxes = page.get("rec_polys", [])

        for i in range(len(texts)):
            lines.append({
                "text": texts[i],
                "confidence": round(float(scores[i]), 4) if i < len(scores) else 0.0,
                "bbox": boxes[i].tolist() if i < len(boxes) else None
            })

    full_text = " ".join(line["text"] for line in lines)
    avg_confidence = (
        sum(line["confidence"] for line in lines) / len(lines) if lines else 0.0
    )

    return {
        "full_text": full_text,
        "lines": lines,
        "avg_confidence": round(avg_confidence, 4)
    }


def extract_best_language(image, candidate_langs=("en", "devanagari")):
    results = {}
    for lang in candidate_langs:
        try:
            outcome = extract_printed_text(image, lang=lang)
            if outcome is not None:
                results[lang] = outcome
        except Exception as error:
            print(f"OCR failed for lang '{lang}': {error}")
            continue

    if not results:
        return "en", {"full_text": "", "lines": [], "avg_confidence": 0.0}

    best_lang = max(results, key=lambda l: results[l]["avg_confidence"])
    return best_lang, results[best_lang]


SUPPORTED_LANGUAGES = ["en", "devanagari", "tamil", "telugu"]