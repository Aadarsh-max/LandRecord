def build_risk_signals(land_record, duplicate_matches, field_confidence_list):
    missing_required = any(
        land_record.get(field) is None
        for field in ["landowner_name", "survey_number", "village", "district"]
    )

    return {
        "landowner_name": land_record.get("landowner_name"),
        "survey_number": land_record.get("survey_number"),
        "village": land_record.get("village"),
        "mutation_count": 1 if land_record.get("mutation_status") else 0,
        "duplicate_match_count": len(duplicate_matches),
        "has_missing_fields": missing_required
    }