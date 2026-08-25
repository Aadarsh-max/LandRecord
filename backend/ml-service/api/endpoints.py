from fastapi import APIRouter, UploadFile, File, Form
from pipeline.document_processor import process_document

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