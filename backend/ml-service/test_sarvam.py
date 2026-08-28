import os
import sys
import time
from dotenv import load_dotenv

load_dotenv(dotenv_path="../../.env")

from sarvam_extraction import extract_fields_with_sarvam, to_sarvam_language_code, translate_extracted_fields

if len(sys.argv) < 2:
    print("Usage: python test_sarvam.py <path_to_image> [language_hint]")
    print("Example: python test_sarvam.py C:\\SIH\\land-record-digitization\\database\\seeds\\land_record_specimen_tamil.jpg tamil")
    sys.exit(1)

file_path = sys.argv[1]
language_hint = sys.argv[2] if len(sys.argv) > 2 else "en"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

with open(file_path, "rb") as f:
    file_bytes = f.read()

filename = os.path.basename(file_path)
language_code = to_sarvam_language_code(language_hint)

print(f"Testing Sarvam extraction on: {filename}")
print(f"Language hint: {language_hint} -> Sarvam code: {language_code}")
print("Submitting job...")

start = time.time()
result = extract_fields_with_sarvam(file_bytes, filename, language_code=language_code)
elapsed = time.time() - start

print(f"\nCompleted in {elapsed:.2f}s\n")

if result["success"]:
    print("Raw extracted fields:")
    for key, value in result["fields"].items():
        print(f"  {key}: {value}")

    print("\nTranslating to English...")
    translated = translate_extracted_fields(result["fields"])

    print("\nTranslated fields:")
    for key, value in translated.items():
        print(f"  {key}: {value}")
else:
    print(f"Failed: {result['error']}")