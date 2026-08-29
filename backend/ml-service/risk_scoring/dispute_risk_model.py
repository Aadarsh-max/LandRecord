def compute_risk_score(record_signals):
    score = 0
    reasons = []

    mutation_count = record_signals.get("mutation_count", 0)
    if mutation_count >= 3:
        score += 30
        reasons.append(f"{mutation_count} mutation entries recorded, higher than typical")
    elif mutation_count >= 1:
        score += 10
        reasons.append("Recent mutation entry recorded — routine, low concern")

    duplicate_count = record_signals.get("duplicate_match_count", 0)
    if duplicate_count > 0:
        score += 40
        reasons.append(f"{duplicate_count} potential duplicate record(s) found")

    if record_signals.get("has_missing_fields"):
        score += 15
        reasons.append("Record has missing mandatory fields")

    if not record_signals.get("landowner_name"):
        score += 15
        reasons.append("No landowner name on record")

    score = min(score, 100)

    if score >= 60:
        level = "high"
    elif score >= 30:
        level = "medium"
    else:
        level = "low"

    if not reasons:
        reasons.append("No risk factors detected")

    return {
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons
    }