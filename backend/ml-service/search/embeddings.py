from sentence_transformers import SentenceTransformer

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def generate_embedding(text):
    model = get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def record_to_text(record):
    parts = [
        record.get("landowner_name"),
        record.get("survey_number"),
        record.get("village"),
        record.get("tehsil"),
        record.get("district"),
        record.get("land_classification"),
        record.get("ownership_type")
    ]
    return " ".join(p for p in parts if p)