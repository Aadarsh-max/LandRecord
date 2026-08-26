from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any
from pipeline.document_processor import process_document
from search.embeddings import generate_embedding, record_to_text
from search.vector_index import rebuild_index, search_index
from search.query_parser import parse_query_filters
from risk_scoring.dispute_risk_model import compute_risk_score
from forensics.tamper_detection import detect_tampering
from gis.map_overlay_builder import build_map_marker

router = APIRouter()


@router.post("/ocr/extract")
async def extract_document(file: UploadFile = File(...), mode: str = Form("auto")):
    image_bytes = await file.read()
    result = process_document(image_bytes, mode=mode)
    return {
        "filename": file.filename,
        "mode": mode,
        "result": result
    }


class RecordForIndex(BaseModel):
    id: str
    landowner_name: str | None = None
    survey_number: str | None = None
    village: str | None = None
    tehsil: str | None = None
    district: str | None = None
    land_classification: str | None = None
    ownership_type: str | None = None
    plot_area: float | None = None


class IndexRequest(BaseModel):
    records: List[RecordForIndex]


@router.post("/search/index")
async def index_records(payload: IndexRequest):
    records_with_embeddings = []
    for record in payload.records:
        record_dict = record.model_dump()
        text = record_to_text(record_dict)
        if not text.strip():
            continue
        embedding = generate_embedding(text)
        records_with_embeddings.append({
            "id": record_dict["id"],
            "embedding": embedding,
            "plot_area": record_dict.get("plot_area")
        })

    rebuild_index(records_with_embeddings)
    return {"indexed_count": len(records_with_embeddings)}


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/search/query")
async def query_records(payload: SearchRequest):
    filters = parse_query_filters(payload.query)
    query_vector = generate_embedding(payload.query)
    matches = search_index(query_vector, top_k=payload.top_k)
    return {"matches": matches, "filters_detected": filters}


class RiskScoreRequest(BaseModel):
    landowner_name: str | None = None
    survey_number: str | None = None
    village: str | None = None
    mutation_count: int = 0
    duplicate_match_count: int = 0
    has_missing_fields: bool = False

class MapMarkerRequest(BaseModel):
    survey_number: str | None = None
    village: str | None = None
    district: str | None = None


@router.post("/gis/marker")
async def get_map_marker(payload: MapMarkerRequest):
    return build_map_marker(payload.model_dump())


@router.post("/risk/score")
async def score_risk(payload: RiskScoreRequest):
    return compute_risk_score(payload.model_dump())


@router.post("/forensics/tamper-check")
async def tamper_check(file: UploadFile = File(...)):
    image_bytes = await file.read()
    return detect_tampering(image_bytes)