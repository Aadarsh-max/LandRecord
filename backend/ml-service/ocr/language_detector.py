import re

SCRIPT_RANGES = {
    "hi": (0x0900, 0x097F),
    "bn": (0x0980, 0x09FF),
    "pa": (0x0A00, 0x0A7F),
    "gu": (0x0A80, 0x0AFF),
    "ta": (0x0B80, 0x0BFF),
    "te": (0x0C00, 0x0C7F),
    "kn": (0x0C80, 0x0CFF),
    "ml": (0x0D00, 0x0D7F),
    "or": (0x0B00, 0x0B7F),
}


def detect_language(text):
    if not text or not text.strip():
        return "unknown"

    counts = {code: 0 for code in SCRIPT_RANGES}
    latin_count = 0

    for char in text:
        code_point = ord(char)
        matched = False
        for lang, (start, end) in SCRIPT_RANGES.items():
            if start <= code_point <= end:
                counts[lang] += 1
                matched = True
                break
        if not matched and re.match(r"[A-Za-z]", char):
            latin_count += 1

    best_script = max(counts, key=counts.get)

    if counts[best_script] == 0 and latin_count > 0:
        return "en"

    if counts[best_script] >= latin_count:
        return best_script

    return "en"