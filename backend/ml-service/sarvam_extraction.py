import os
import json
import time
from sarvamai import SarvamAI
from sarvamai.core.api_error import ApiError
from llm_correction.correction_engine import correct_with_groq

_client = None

TERMINAL_STATES = {"completed", "partially_completed", "failed", "rejected"}

FIELD_SCHEMA = {
    "type": "object",
    "properties": {
        "landowner_name": {"type": "string", "description": "Full name of the land owner, as written on the document"},
        "survey_number": {"type": "string", "description": "Survey number of the land parcel, e.g. 212/1B"},
        "khasra_number": {"type": "string", "description": "Khasra number (Gat number) of the land parcel"},
        "khata_number": {"type": "string", "description": "Khata number / account number of the land record"},
        "plot_area": {"type": "string", "description": "Total area of the plot with its unit, e.g. 1.42 hectares"},
        "village": {"type": "string", "description": "Village name"},
        "tehsil": {"type": "string", "description": "Tehsil or Taluka name"},
        "district": {"type": "string", "description": "District name"},
        "land_classification": {"type": "string", "description": "Type/classification of land, e.g. Agricultural, Residential, Commercial"},
        "ownership_type": {"type": "string", "description": "Type of ownership, e.g. Individual, Joint, Trust"},
        "mutation_status": {"type": "string", "description": "Status of the latest mutation entry, e.g. Approved, Pending, Rejected"},
        "registration_number": {"type": "string", "description": "Official registration number of the document"}
    }
}

LANGUAGE_CODE_MAP = {
    "en": "en-IN",
    "devanagari": "hi-IN",
    "hindi": "hi-IN",
    "marathi": "mr-IN",
    "tamil": "ta-IN",
    "telugu": "te-IN",
    "bengali": "bn-IN",
    "gujarati": "gu-IN",
    "kannada": "kn-IN",
    "malayalam": "ml-IN",
    "odia": "od-IN",
    "punjabi": "pa-IN",
    "urdu": "ur-IN"
}

TRANSLATE_FIELDS_PROMPT = """You will receive a JSON object with land record field values, possibly in an Indian regional language.
Translate every value into English. Transliterate person and place names into Roman script (e.g. "முருகன் வேலு" becomes "Murugan Velu").
Keep numbers, codes, and dates exactly as given.
Return ONLY a valid JSON object with the same keys, with all values translated to English. No explanations, no markdown formatting."""


def to_sarvam_language_code(language_hint):
    return LANGUAGE_CODE_MAP.get(language_hint, "en-IN")


def get_client():
    global _client
    if _client is None:
        _client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))
    return _client


def extract_fields_with_sarvam(file_bytes, filename, language_code="en-IN", poll_interval=3, timeout=120):
    client = get_client()

    content_type = "application/pdf" if filename.lower().endswith(".pdf") else "image/jpeg"

    try:
        job = client.doc_ai.extract(
            file=[(filename, file_bytes, content_type)],
            schema=json.dumps(FIELD_SCHEMA),
            language=language_code,
            output_format="json"
        )
    except ApiError as error:
        return {"success": False, "error": f"Sarvam API error {error.status_code}: {error.body}"}

    start_time = time.time()
    status = job.status

    while status.lower() not in TERMINAL_STATES:
        if time.time() - start_time > timeout:
            return {"success": False, "error": "Sarvam extraction job timed out"}
        time.sleep(poll_interval)
        status_response = client.doc_ai.get_status(job_id=job.job_id)
        status = status_response.status

    if status.lower() not in ("completed", "partially_completed"):
        return {"success": False, "error": f"Sarvam job ended with status: {status}"}

    try:
        results = client.doc_ai.get_results(job_id=job.job_id)
        return {"success": True, "fields": results.result, "job_status": status}
    except ApiError as error:
        return {"success": False, "error": f"Failed to fetch results: {error.status_code}: {error.body}"}


def translate_extracted_fields(fields_dict):
    input_text = json.dumps(fields_dict, ensure_ascii=False)
    try:
        raw_response = correct_with_groq(f"{TRANSLATE_FIELDS_PROMPT}\n\n{input_text}")
        print(f"[debug] Raw Groq translation response: {raw_response}")
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        parsed = json.loads(cleaned.strip())
        return parsed
    except Exception as error:
        print(f"[ERROR] Field translation failed: {type(error).__name__}: {error}")
        return fields_dict