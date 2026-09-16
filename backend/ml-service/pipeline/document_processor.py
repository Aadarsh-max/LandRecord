TENANCY_TARGET_FIELDS = [
    "occupant_name", "survey_number", "hissa_number", "plot_area", "village",
    "tehsil", "district", "land_classification", "tenant_names",
    "mutation_entry_number", "mutation_date", "remarks"
]


def build_structured_fields(raw_fields, field_list=None):
    fields_to_use = field_list or TARGET_FIELDS
    structured = {}
    for field_name in fields_to_use:
        value = raw_fields.get(field_name)
        confidence = compute_field_confidence(field_name, value)
        if confidence == 0.0:
            structured[field_name] = {"value": None, "confidence": 0.0, "source": None}
        else:
            structured[field_name] = {"value": str(value).strip(), "confidence": confidence, "source": "sarvam"}
    return structured


def process_document(image_bytes, mode="auto", language_hint=None, filename="document.jpg", document_type="standard"):
    t0 = time.time()

    print(f"[debug] language_hint received: {repr(language_hint)}, document_type: {document_type}")

    tpre = time.time()
    preprocess_result = preprocess_document(image_bytes)
    print(f"[timing] preprocessing: {time.time() - tpre:.2f}s")

    if preprocess_result["success"]:
        image_to_send = preprocess_result["processed_bytes"]
        image_quality = preprocess_result["quality_after"]
    else:
        print(f"[preprocessing] failed, using original image: {preprocess_result.get('error')}")
        image_to_send = image_bytes
        image_quality = {"warnings": []}

    language_code = to_sarvam_language_code(language_hint or "en")

    t1 = time.time()
    extraction_result = extract_fields_with_sarvam(image_to_send, filename, language_code=language_code, document_type=document_type)
    print(f"[timing] Sarvam extraction: {time.time() - t1:.2f}s")

    active_field_list = TENANCY_TARGET_FIELDS if document_type == "tenancy" else TARGET_FIELDS

    if not extraction_result["success"]:
        empty_fields = build_structured_fields({}, active_field_list)
        return {
            "language_detected": language_hint or "en",
            "document_type": document_type,
            "ocr_confidence": 0.0,
            "structured_fields": empty_fields,
            "image_quality": image_quality,
            "validation_summary": build_validation_summary(
                empty_fields,
                [{"field": "document", "rule": "extraction_failed", "message": extraction_result["error"]}],
                []
            ),
            "ekyc_check": None,
            "final_text": "",
            "error": extraction_result["error"]
        }

    raw_fields = extraction_result["fields"]

    t2 = time.time()
    translated_fields = translate_extracted_fields(raw_fields) if language_code != "en-IN" else raw_fields
    print(f"[timing] Translation: {time.time() - t2:.2f}s")

    structured_fields = build_structured_fields(translated_fields, active_field_list)

    if document_type == "tenancy":
        violations = []
        duplicates = []
        owner_name_value = structured_fields.get("occupant_name", {}).get("value")
        survey_number_value = structured_fields.get("survey_number", {}).get("value")
    else:
        violations = validate_fields(structured_fields)
        duplicates = detect_duplicates(structured_fields)
        owner_name_value = structured_fields.get("landowner_name", {}).get("value")
        survey_number_value = structured_fields.get("survey_number", {}).get("value")

    prior_records = get_records_for_survey_number(survey_number_value)
    ekyc_result = run_ekyc_check(owner_name_value, survey_number_value, prior_records)

    validation_summary = build_validation_summary(structured_fields, violations, duplicates)

    overall_confidence = round(
        sum(f["confidence"] for f in structured_fields.values()) / len(structured_fields), 2
    )

    print(f"[timing] TOTAL: {time.time() - t0:.2f}s")

    return {
        "language_detected": language_hint or "en",
        "document_type": document_type,
        "ocr_confidence": overall_confidence,
        "structured_fields": structured_fields,
        "image_quality": image_quality,
        "validation_summary": validation_summary,
        "ekyc_check": ekyc_result,
        "final_text": str(translated_fields)
    }