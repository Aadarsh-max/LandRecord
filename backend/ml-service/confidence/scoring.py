REVIEW_THRESHOLD = 0.65


def compute_overall_confidence(structured_fields):
    scored_fields = [f for f in structured_fields.values() if f["value"] is not None]

    if not scored_fields:
        return 0.0

    total = sum(f["confidence"] for f in scored_fields)
    return round(total / len(scored_fields), 4)


def flag_low_confidence_fields(structured_fields, threshold=REVIEW_THRESHOLD):
    flagged = []
    for field_name, field_data in structured_fields.items():
        if field_data["value"] is None:
            continue
        if field_data["confidence"] < threshold:
            flagged.append(field_name)
    return flagged


def build_validation_summary(structured_fields, violations, duplicates):
    overall_confidence = compute_overall_confidence(structured_fields)
    low_confidence_fields = flag_low_confidence_fields(structured_fields)

    needs_human_review = (
        overall_confidence < REVIEW_THRESHOLD
        or len(violations) > 0
        or len(duplicates) > 0
        or len(low_confidence_fields) > 0
    )

    return {
        "overall_confidence": overall_confidence,
        "low_confidence_fields": low_confidence_fields,
        "business_rule_violations": violations,
        "duplicate_matches": duplicates,
        "needs_human_review": needs_human_review
    }