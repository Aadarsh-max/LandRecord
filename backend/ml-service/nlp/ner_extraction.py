import re
import spacy
from spacy.pipeline import EntityRuler

_nlp = None

FIELD_PATTERNS = [
    {"label": "SURVEY_NUMBER", "pattern": [{"LOWER": {"IN": ["survey", "s.no", "s.no."]}}, {"LOWER": "no", "OP": "?"}, {"IS_PUNCT": True, "OP": "?"}, {"LIKE_NUM": True}]},
    {"label": "KHASRA_NUMBER", "pattern": [{"LOWER": "khasra"}, {"LOWER": "no", "OP": "?"}, {"IS_PUNCT": True, "OP": "?"}, {"LIKE_NUM": True}]},
    {"label": "KHATA_NUMBER", "pattern": [{"LOWER": "khata"}, {"LOWER": "no", "OP": "?"}, {"IS_PUNCT": True, "OP": "?"}, {"LIKE_NUM": True}]},
    {"label": "PLOT_AREA", "pattern": [{"LIKE_NUM": True}, {"LOWER": {"IN": ["acre", "acres", "hectare", "hectares", "sqft", "sq.ft"]}}]},
    {"label": "VILLAGE", "pattern": [{"LOWER": "village"}, {"IS_PUNCT": True, "OP": "?"}, {"IS_ALPHA": True, "OP": "+"}]},
    {"label": "TEHSIL", "pattern": [{"LOWER": {"IN": ["tehsil", "taluka"]}}, {"IS_PUNCT": True, "OP": "?"}, {"IS_ALPHA": True, "OP": "+"}]},
    {"label": "DISTRICT", "pattern": [{"LOWER": "district"}, {"IS_PUNCT": True, "OP": "?"}, {"IS_ALPHA": True, "OP": "+"}]}
]


def load_model():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
        if "entity_ruler" not in _nlp.pipe_names:
            ruler = _nlp.add_pipe("entity_ruler", before="ner")
            ruler.add_patterns(FIELD_PATTERNS)
    return _nlp


def extract_entities(text):
    nlp = load_model()
    doc = nlp(text)

    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char
        })

    return entities