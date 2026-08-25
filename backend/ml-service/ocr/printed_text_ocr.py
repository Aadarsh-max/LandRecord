from paddleocr import PaddleOCR

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = PaddleOCR(
            lang="en",
            enable_mkldnn=False,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False
        )
    return _engine


def extract_printed_text(image):
    engine = get_engine()
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