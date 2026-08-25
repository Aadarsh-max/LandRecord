from paddleocr import PaddleOCR

_engines = {}


def get_engine(lang):
    if lang not in _engines:
        _engines[lang] = PaddleOCR(use_angle_cls=True, lang=lang, show_log=False)
    return _engines[lang]


def extract_printed_text(image, lang="en"):
    engine = get_engine(lang)
    result = engine.ocr(image, cls=True)

    lines = []
    if result and result[0]:
        for entry in result[0]:
            box, (text, confidence) = entry
            lines.append({
                "text": text,
                "confidence": round(float(confidence), 4),
                "bbox": box
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