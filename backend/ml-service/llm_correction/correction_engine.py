import os
import httpx

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You correct OCR errors in Indian land record documents.
Fix garbled characters, spacing issues, and obvious misreads.
Preserve numbers, names, and structure exactly as intended.
Do not add explanations. Return only the corrected text."""


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
        "reasoning_effort": "low"
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
        "max_tokens": 1024
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
        "max_tokens": 1024
    }

    response = httpx.post(GROQ_URL, headers=headers, json=payload, timeout=30.0)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"].strip()


def correct_with_ollama(raw_text):
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

    payload = {
        "model": model,
        "prompt": f"{SYSTEM_PROMPT}\n\nText:\n{raw_text}",
        "stream": False
    }

    response = httpx.post(f"{base_url}/api/generate", json=payload, timeout=60.0)
    response.raise_for_status()
    data = response.json()
    return data["response"].strip()


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