from dotenv import load_dotenv
load_dotenv(dotenv_path="../../.env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import router as ocr_router

app = FastAPI(title="Land Record ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocr_router)


@app.get("/health")
def health():
    return {"status": "ok"}