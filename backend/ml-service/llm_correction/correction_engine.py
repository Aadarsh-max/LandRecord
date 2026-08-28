import os
import httpx

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You process OCR text from Indian land record documents.
The text may be in English or any Indian regional language (Hindi, Marathi, Tamil, Telugu, or others), and may contain OCR errors.

Your job:
1. Fix garbled characters and obvious OCR misreads.
2. If the text is not in English, translate it into English.
3. Transliterate all person names into Roman/English script (e.g., "गणेश विठ्ठल देशमुख" becomes "Ganesh Vitthal Deshmukh"). Never leave a name in a non-Latin script.
4. When translating field labels, always use these EXACT English labels, regardless of how they literally translate: State, District, Tehsil, Village, Survey No., Khasra No., Khata No., Owner Name, Total Area, Land Classification, Ownership Type, Mutation Status, Registration No.
5. Do not use these field label words anywhere except their actual labeled data rows. The document TITLE or HEADING is the name of the FORM TYPE, not a data field — never extract a Survey No., Khasra No., or Khata No. from the title, even if it contains numbers that look like a fraction. Only extract these numbers from a line that explicitly labels them.
6. Put each field on its own separate line, formatted exactly as "Label: Value". Never combine two fields' values on the same line, even if the original document had them close together or without clear separation.
7. Preserve numbers, names, and dates exactly as written.

Do not add explanations. Return only the final English text."""


def correct_with_groq(raw_text):
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": raw_text}
        ],
        "temperature": 0.1,
        "max_tokens": 2048,
        "reasoning_effort": "medium"
    }

    response = httpx.post(GROQ_URL, headers=headers, json=payload, timeout=30.0)
    response.raise_for_status()
    data = response.json()

    content = data["choices"][0]["message"].get("content", "")
    content = content.strip() if content else ""

    if not content:
        print(f"Groq returned empty content. Full response: {data}")
        raise ValueError("Groq returned empty content")

    return content


def correct_with_ollama(raw_text):
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:latest")

    payload = {
        "model": model,
        "prompt": f"{SYSTEM_PROMPT}\n\nText:\n{raw_text}",
        "stream": False
    }

    response = httpx.post(f"{base_url}/api/generate", json=payload, timeout=90.0)
    response.raise_for_status()
    data = response.json()

    content = data.get("response", "")
    content = content.strip() if content else ""

    if not content:
        raise ValueError("Ollama returned empty content")

    return content


def correct_ocr_text(raw_text):
    if not raw_text or not raw_text.strip():
        return {"corrected_text": "", "provider_used": None, "success": False, "error": "empty_input"}

    provider = os.getenv("LLM_PROVIDER", "groq")
    errors = []

    try:
        if provider == "groq":
            corrected = correct_with_groq(raw_text)
            return {"corrected_text": corrected, "provider_used": "groq", "success": True}
        else:
            corrected = correct_with_ollama(raw_text)
            return {"corrected_text": corrected, "provider_used": "ollama", "success": True}
    except Exception as primary_error:
        errors.append(f"{provider}: {str(primary_error)}")
        try:
            corrected = correct_with_ollama(raw_text)
            return {"corrected_text": corrected, "provider_used": "ollama_fallback", "success": True}
        except Exception as fallback_error:
            errors.append(f"ollama_fallback: {str(fallback_error)}")
            return {
                "corrected_text": raw_text,
                "provider_used": None,
                "success": False,
                "error": " | ".join(errors)
            }